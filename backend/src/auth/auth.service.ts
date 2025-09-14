import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database.service';
import {
  RegisterEmailDto,
  VerifyOtpDto,
  RegisterDetailsDto,
  LoginDto,
  RefreshTokenDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(registerEmailDto: RegisterEmailDto) {
    const { email } = registerEmailDto;

    // Check if user already exists and is verified
    const existingUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email },
      });

    if (existingUser && existingUser.isVerified) {
      throw new ConflictException('User already exists and is verified');
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create or update user with OTP
    await this.databaseService.getPrismaClient().user.upsert({
      where: { email },
      update: {
        otpCode,
        otpExpiresAt,
      },
      create: {
        email,
        otpCode,
        otpExpiresAt,
      },
    });

    // In a real application, you would send the OTP via email
    // For now, we'll just log it to console
    console.log(`OTP for ${email}: ${otpCode}`);

    return {
      message: 'OTP sent successfully to your email',
      expiresInMinutes: 5,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this user');
    }

    if (user.otpCode !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark user as verified
    await this.databaseService.getPrismaClient().user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return {
      message: 'OTP verified successfully',
      canProceed: true,
    };
  }

  async registerDetails(registerDetailsDto: RegisterDetailsDto) {
    const { email, username, password, confirmPassword } = registerDetailsDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user exists and is verified
    const user = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new NotFoundException('User not found. Please verify your email first.');
    }

    if (!user.isVerified) {
      throw new BadRequestException('User not verified. Please verify your email first.');
    }

    // Check if username is already taken
    const existingUsername = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { username },
      });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with username and password
    const updatedUser = await this.databaseService
      .getPrismaClient()
      .user.update({
        where: { email },
        data: {
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          isVerified: true,
        },
      });

    return {
      message: 'Registration completed successfully',
      user: updatedUser,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('User not verified');
    }

    if (!user.password) {
      throw new UnauthorizedException('User not fully registered');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const tokenRecord = await this.databaseService
      .getPrismaClient()
      .refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!tokenRecord.user.isVerified) {
      throw new UnauthorizedException('User not verified');
    }

    // Revoke the old refresh token
    await this.databaseService.getPrismaClient().refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.user.id);

    return {
      ...tokens,
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
        isVerified: tokenRecord.user.isVerified,
      },
    };
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.databaseService
      .getPrismaClient()
      .refreshToken.findUnique({
        where: { token: refreshToken },
      });

    if (tokenRecord) {
      await this.databaseService.getPrismaClient().refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });
    }

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: number) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    });

    const refreshToken = this.generateRandomToken();
    const refreshTokenExpiry = new Date(
      Date.now() + this.parseExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d'),
    );

    // Save refresh token to database
    await this.databaseService.getPrismaClient().refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
        userId,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateRandomToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    }
  }
}
