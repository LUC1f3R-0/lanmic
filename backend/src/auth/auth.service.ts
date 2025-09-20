import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database.service';
import { CookieService } from './cookie.service';
import { EmailService } from './email.service';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private cookieService: CookieService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const { email, password, rememberMe } = loginDto;

    const user = await this.databaseService.getPrismaClient().user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove this check - we want users to be able to login even if unverified
    // They will need to verify email to access dashboard content

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clear OTP data but keep verification status
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiresAt: null,
      },
    });

    // Clean up old tokens for this user before generating new ones
    const beforeCleanup = await this.getUserTokenCount(user.id);
    await this.cleanupUserTokens(user.id);
    const afterCleanup = await this.getUserTokenCount(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);
    const afterLogin = await this.getUserTokenCount(user.id);

    console.log(
      `Auth Service: Token cleanup for user ${user.id}: ${beforeCleanup} -> ${afterCleanup} -> ${afterLogin} tokens`,
    );
    console.log('Auth Service: Generated tokens:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      accessTokenLength: tokens.accessToken?.length,
      refreshTokenLength: tokens.refreshToken?.length,
    });

    // Set secure HTTP-only cookies with different expiry based on remember me
    const accessTokenExpiry = rememberMe
      ? process.env.ACCESS_TOKEN_EXPIRY_REMEMBER || '24h' // Longer for remember me
      : process.env.ACCESS_TOKEN_EXPIRY || '15m'; // Default short expiry

    const refreshTokenExpiry = rememberMe
      ? process.env.REFRESH_TOKEN_EXPIRY_REMEMBER || '30d' // Much longer for remember me
      : process.env.REFRESH_TOKEN_EXPIRY || '7d'; // Default expiry

    this.cookieService.setAccessTokenCookie(
      res,
      tokens.accessToken,
      accessTokenExpiry,
    );
    this.cookieService.setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      refreshTokenExpiry,
    );

    // Get the updated user data after clearing OTP
    const updatedUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    return {
      message: updatedUser?.isVerified
        ? 'Login successful'
        : 'Login successful - Email verification required',
      user: {
        id: updatedUser?.id || user.id,
        email: updatedUser?.email || user.email,
        username: updatedUser?.username || user.username,
        isVerified: updatedUser?.isVerified || false,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto, res: Response) {
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

    // Remove verification check - allow refresh but require re-verification
    // Delete the old refresh token completely
    await this.databaseService.getPrismaClient().refreshToken.delete({
      where: { id: tokenRecord.id },
    });
    console.log(
      `Auth Service: Deleted old refresh token with ID ${tokenRecord.id} during refresh`,
    );

    // Don't reset verification status on token refresh
    // Let the user's current verification status persist

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.user.id);

    // Set new secure HTTP-only cookies
    this.cookieService.setAccessTokenCookie(
      res,
      tokens.accessToken,
      process.env.ACCESS_TOKEN_EXPIRY || '15m',
    );
    this.cookieService.setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      process.env.REFRESH_TOKEN_EXPIRY || '7d',
    );

    return {
      message: tokenRecord.user.isVerified ? 'Tokens refreshed successfully' : 'Tokens refreshed successfully - Email verification required',
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
        isVerified: tokenRecord.user.isVerified, // Keep current verification status
      },
    };
  }

  async logout(refreshToken: string, res: Response) {
    try {
      // Find and completely delete the specific refresh token
      if (refreshToken) {
        const tokenRecord = await this.databaseService
          .getPrismaClient()
          .refreshToken.findUnique({
            where: { token: refreshToken },
          });

        if (tokenRecord) {
          const beforeDelete = await this.getTotalTokenCount();
          await this.databaseService.getPrismaClient().refreshToken.delete({
            where: { id: tokenRecord.id },
          });
          const afterDelete = await this.getTotalTokenCount();
          console.log(
            `Auth Service: Deleted refresh token with ID ${tokenRecord.id} on logout. Total tokens: ${beforeDelete} -> ${afterDelete}`,
          );

          // Don't reset verification status on logout
          // Let the user's verification status persist
        }
      }

      // Clear all authentication cookies
      this.cookieService.clearAllAuthCookies(res);

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear cookies and return success
      this.cookieService.clearAllAuthCookies(res);
      return { message: 'Logged out successfully' };
    }
  }

  getProfile(req: any) {
    // Extract user from JWT token (set by JWT strategy)
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
    };
  }

  private async generateTokens(userId: number) {
    const payload = {
      sub: userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
      algorithm: 'HS256',
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
        createdAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateRandomToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Method to clean up expired refresh tokens
  async cleanupExpiredTokens() {
    const result = await this.databaseService
      .getPrismaClient()
      .refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() }, // Only expired tokens
        },
      });
    if (result.count > 0) {
      console.log(
        `Auth Service: Cleaned up ${result.count} expired tokens globally`,
      );
    }
    return result.count;
  }

  // Method to delete all refresh tokens for a user
  async revokeAllUserTokens(userId: number) {
    const result = await this.databaseService
      .getPrismaClient()
      .refreshToken.deleteMany({
        where: { userId },
      });
    if (result.count > 0) {
      console.log(
        `Auth Service: Deleted all ${result.count} tokens for user ${userId}`,
      );
    }
    return result.count;
  }

  // Method to clean up old tokens for a user (delete expired tokens)
  async cleanupUserTokens(userId: number) {
    const result = await this.databaseService
      .getPrismaClient()
      .refreshToken.deleteMany({
        where: {
          userId,
          expiresAt: { lt: new Date() }, // Only expired tokens
        },
      });
    if (result.count > 0) {
      console.log(
        `Auth Service: Cleaned up ${result.count} expired tokens for user ${userId}`,
      );
    }
  }

  // Method to get token count for a user (for debugging/testing)
  async getUserTokenCount(userId: number): Promise<number> {
    const count = await this.databaseService
      .getPrismaClient()
      .refreshToken.count({
        where: { userId },
      });
    return count;
  }

  // Method to get total token count (for debugging/testing)
  async getTotalTokenCount(): Promise<number> {
    const count = await this.databaseService
      .getPrismaClient()
      .refreshToken.count();
    return count;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Check if user exists (exact match first)
    let user = await this.databaseService.getPrismaClient().user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    // If not found, try case-insensitive search
    if (!user) {
      user = await this.databaseService.getPrismaClient().user.findFirst({
        where: {
          email: {
            contains: email,
          },
        },
      });
    }

    if (!user) {
      // Email not found in system
      throw new BadRequestException(
        'Email address not found in our system. Please check your email address or contact the administrator.',
      );
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Account is deactivated. Please contact the administrator.',
      );
    }

    // Generate 5-digit OTP
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt,
      },
    });

    // Send OTP email using SMTP
    await this.emailService.sendOtpEmail(email, otp);

    return {
      message:
        'OTP has been sent to your email address. Please check your inbox and enter the 5-digit code.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    // Try exact match first, then case-insensitive
    let user = await this.databaseService.getPrismaClient().user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (!user) {
      user = await this.databaseService.getPrismaClient().user.findFirst({
        where: {
          email: {
            contains: email,
          },
        },
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this email');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Try exact match first, then case-insensitive
    let user = await this.databaseService.getPrismaClient().user.findFirst({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (!user) {
      user = await this.databaseService.getPrismaClient().user.findFirst({
        where: {
          email: {
            contains: email,
          },
        },
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestException(
        'No valid OTP found. Please request a new OTP.',
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException(
        'OTP has expired. Please request a new OTP.',
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    // Send success email
    await this.emailService.sendPasswordResetSuccessEmail(email);

    return { message: 'Password reset successfully' };
  }

  async debugUserLookup(email: string) {
    try {
      console.log(`Debug: Looking up user with email: "${email}"`);

      // Check all users in database
      const allUsers = await this.databaseService
        .getPrismaClient()
        .user.findMany({
          select: { id: true, email: true, username: true, isVerified: true },
        });

      console.log('Debug: All users in database:', allUsers);

      // Try exact match
      const exactUser = await this.databaseService
        .getPrismaClient()
        .user.findUnique({
          where: { email: email },
        });

      console.log('Debug: Exact match result:', exactUser);

      // Try case-insensitive search
      const caseInsensitiveUser = await this.databaseService
        .getPrismaClient()
        .user.findFirst({
          where: {
            email: {
              contains: email,
            },
          },
        });

      console.log('Debug: Case-insensitive match result:', caseInsensitiveUser);

      return {
        searchedEmail: email,
        allUsers: allUsers,
        exactMatch: exactUser,
        caseInsensitiveMatch: caseInsensitiveUser,
        totalUsers: allUsers.length,
      };
    } catch (error) {
      console.error('Debug: Error in user lookup:', error);
      return {
        error: error.message,
        searchedEmail: email,
      };
    }
  }

  private generateOtp(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  private generateVerificationToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async sendRegistrationOtp(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Check if user already exists
    const existingUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new BadRequestException('Email address is already registered');
    }

    // Generate 5-digit OTP
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user record with OTP
    await this.databaseService.getPrismaClient().user.create({
      data: {
        email,
        username: `temp_${Date.now()}`, // Temporary username
        password: 'temp_password', // Temporary password
        isVerified: false, // Not verified yet
        otp,
        otpExpiresAt,
      },
    });

    // Send OTP email using SMTP
    await this.emailService.sendRegistrationOtpEmail(email, otp);

    return {
      message:
        'OTP has been sent to your email address. Please check your inbox and enter the 5-digit code.',
      expiresInMinutes: 10,
    };
  }

  async verifyRegistrationOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.databaseService.getPrismaClient().user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this email');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    return {
      message:
        'OTP verified successfully. You can now complete your registration.',
      canProceed: true,
    };
  }

  async registerDetails(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) {
    const { email, username, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user exists and has verified OTP
    const user = await this.databaseService.getPrismaClient().user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found. Please start the registration process again.',
      );
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestException(
        'No valid OTP found. Please request a new OTP.',
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException(
        'OTP has expired. Please request a new OTP.',
      );
    }

    // Check if username is already taken
    const existingUsername = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { username },
      });

    if (existingUsername && existingUsername.id !== user.id) {
      throw new BadRequestException('Username is already taken');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with final details
    const updatedUser = await this.databaseService
      .getPrismaClient()
      .user.update({
        where: { id: user.id },
        data: {
          username,
          password: hashedPassword,
          isVerified: true, // Mark as verified after successful registration
          otp: null,
          otpExpiresAt: null,
        },
      });

    return {
      message: 'Registration completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        isVerified: updatedUser.isVerified,
      },
    };
  }

  async sendVerificationEmail(user: any) {
    const { email } = user;

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification token
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp: verificationToken, // Reusing otp field for verification token
        otpExpiresAt: tokenExpiresAt,
      },
    });

    // Send verification email using SMTP
    await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message:
        'Verification email has been sent to your email address. Please check your inbox and click the verification link.',
    };
  }

  async verifyEmail(user: any, verifyOtpDto: VerifyOtpDto) {
    const { otp } = verifyOtpDto;

    // Get fresh user data
    const userRecord = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    if (!userRecord.otp || !userRecord.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this user');
    }

    if (new Date() > userRecord.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (userRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Update user as verified and clear OTP
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async verifyEmailByToken(token: string, res: Response) {
    console.log('AuthService: Starting email verification for token:', token);
    
    // Find user by verification token
    const user = await this.databaseService.getPrismaClient().user.findFirst({
      where: { otp: token },
    });

    if (!user) {
      console.log('AuthService: No user found for token');
      throw new NotFoundException('Invalid verification link');
    }

    console.log('AuthService: Found user:', user.email);

    if (!user.otpExpiresAt) {
      console.log('AuthService: No expiration time found');
      throw new BadRequestException('No verification token found');
    }

    if (new Date() > user.otpExpiresAt) {
      console.log('AuthService: Token expired');
      throw new BadRequestException('Verification link has expired');
    }

    console.log('AuthService: Updating user as verified');
    // Update user as verified and clear token
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    console.log('AuthService: Generating new tokens');
    // Generate new tokens and log the user in
    const tokens = await this.generateTokens(user.id);

    console.log('AuthService: Setting authentication cookies');
    // Set secure HTTP-only cookies
    this.cookieService.setAccessTokenCookie(
      res,
      tokens.accessToken,
      process.env.ACCESS_TOKEN_EXPIRY || '15m',
    );
    this.cookieService.setRefreshTokenCookie(
      res,
      tokens.refreshToken,
      process.env.REFRESH_TOKEN_EXPIRY || '7d',
    );

    console.log('AuthService: Email verification completed successfully');
    // Don't return response - controller will handle redirect
    return;
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
