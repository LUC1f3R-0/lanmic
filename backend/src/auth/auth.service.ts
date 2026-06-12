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
import { TokenCleanupService } from './token-cleanup.service';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  VerifyEmailChangeOtpDto,
  ResetPasswordDto,
  ConfirmEmailChangeDto,
  ChangePasswordDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private cookieService: CookieService,
    private emailService: EmailService,
    private tokenCleanupService: TokenCleanupService,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const { email, password, rememberMe } = loginDto;

    console.log('Auth Service: Login attempt:', {
      email: email,
      hasPassword: !!password,
      passwordLength: password?.length,
      rememberMe: rememberMe,
    });

    const user = await this.databaseService.getPrismaClient().user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Auth Service: User not found for email:', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Auth Service: User found:', {
      id: user.id,
      email: user.email,
      username: user.username,
      hasPassword: !!user.password,
      isVerified: user.isVerified,
    });

    if (!user.password) {
      console.log('Auth Service: User has no password set');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Auth Service: Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log(
        'Auth Service: Password validation failed for user:',
        user.id,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const updateData: any = {
      isVerified: false,
    };

    if (!user.newEmail) {
      updateData.otp = null;
      updateData.otpExpiresAt = null;
    }

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: updateData,
    });

    const beforeCleanup = await this.getUserTokenCount(user.id);
    await this.cleanupAllUserTokens(user.id);
    const afterCleanup = await this.getUserTokenCount(user.id);

    const tokens = await this.generateTokens(user.id, rememberMe);
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

    const accessTokenExpiry = rememberMe
      ? process.env.ACCESS_TOKEN_EXPIRY_REMEMBER || '24h'
      : process.env.ACCESS_TOKEN_EXPIRY || '15m';

    const refreshTokenExpiry = rememberMe
      ? process.env.REFRESH_TOKEN_EXPIRY_REMEMBER || '30d'
      : process.env.REFRESH_TOKEN_EXPIRY || '7d';

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
      await this.cleanupUserTokens(tokenRecord.userId);
      throw new UnauthorizedException('Refresh token has expired');
    }

    await this.databaseService.getPrismaClient().refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    console.log(
      `Auth Service: Deleted old refresh token with ID ${tokenRecord.id} during refresh`,
    );

    if (!tokenRecord.rememberMe) {
      await this.tokenCleanupService.cleanupAllTokensForUser(
        tokenRecord.user.id,
      );

      this.cookieService.clearAllAuthCookies(res);

      throw new UnauthorizedException('Session expired - please login again');
    }

    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.rememberMe,
    );

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
      message: tokenRecord.user.isVerified
        ? 'Tokens refreshed successfully'
        : 'Tokens refreshed successfully - Email verification required',
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
        isVerified: tokenRecord.user.isVerified,
      },
    };
  }

  async logout(refreshToken: string, res: Response, userId?: number | null) {
    try {
      let targetUserId: number | null = userId || null;

      if (!targetUserId && refreshToken) {
        const tokenRecord = await this.databaseService
          .getPrismaClient()
          .refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
          });

        if (tokenRecord) {
          targetUserId = tokenRecord.userId;

          console.log(
            `Auth Service: Logout requested for user ${tokenRecord.user.email} (ID: ${targetUserId})`,
          );
        }
      } else if (targetUserId) {
        console.log(
          `Auth Service: Logout requested for user ID ${targetUserId}`,
        );
      }

      if (targetUserId) {
        const deletedCount =
          await this.tokenCleanupService.cleanupAllTokensForUser(targetUserId);

        console.log(
          `Auth Service: Logout cleanup - Deleted ${deletedCount} tokens for user ${targetUserId}`,
        );

        await this.databaseService.getPrismaClient().user.update({
          where: { id: targetUserId },
          data: { isVerified: false },
        });

        console.log(
          `Auth Service: Reset email verification for user ${targetUserId} on logout`,
        );
      }

      this.cookieService.clearAllAuthCookies(res);

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);

      this.cookieService.clearAllAuthCookies(res);

      return { message: 'Logged out successfully' };
    }
  }

  getProfile(req: any) {
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

  private async generateTokens(userId: number, rememberMe: boolean = false) {
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

    await this.databaseService.getPrismaClient().refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
        userId,
        rememberMe,
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

  async cleanupExpiredTokens() {
    const result = await this.databaseService
      .getPrismaClient()
      .refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

    if (result.count > 0) {
      console.log(
        `Auth Service: Cleaned up ${result.count} expired tokens globally`,
      );
    }

    return result.count;
  }

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

  async cleanupUserTokens(userId: number) {
    return await this.tokenCleanupService.cleanupExpiredTokensForUser(userId);
  }

  async cleanupAllUserTokens(userId: number) {
    return await this.tokenCleanupService.cleanupAllTokensForUser(userId);
  }

  async manualCleanup(): Promise<number> {
    return await this.tokenCleanupService.manualCleanup();
  }

  async getUserTokenCount(userId: number): Promise<number> {
    const count = await this.databaseService
      .getPrismaClient()
      .refreshToken.count({
        where: { userId },
      });

    return count;
  }

  async getTotalTokenCount(): Promise<number> {
    const count = await this.databaseService
      .getPrismaClient()
      .refreshToken.count();

    return count;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

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
      throw new BadRequestException(
        'Email address not found in our system. Please check your email address or contact the administrator.',
      );
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Account is deactivated. Please contact the administrator.',
      );
    }

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt,
      },
    });

    await this.emailService.sendOtpEmail(email, otp);

    return {
      message:
        'OTP has been sent to your email address. Please check your inbox and enter the 5-digit code.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(
      'Auth Service: Cleaning up all tokens for user before password reset:',
      user.id,
    );

    const tokensCleaned =
      await this.tokenCleanupService.cleanupAllTokensForUser(user.id);

    console.log(
      `Auth Service: Cleaned up ${tokensCleaned} tokens for user ${user.id}`,
    );

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    await this.emailService.sendPasswordResetSuccessEmail(email);

    return {
      message:
        'Password reset successfully. You will need to login again with your new password.',
      requiresReauth: true,
    };
  }

  async changePassword(user: any, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const userRecord = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userRecord.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    console.log(
      'Auth Service: Cleaning up all tokens for user before password change:',
      user.id,
    );

    const tokensCleaned =
      await this.tokenCleanupService.cleanupAllTokensForUser(user.id);

    console.log(
      `Auth Service: Cleaned up ${tokensCleaned} tokens for user ${user.id}`,
    );

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    await this.emailService.sendPasswordChangeConfirmationEmail(
      userRecord.email,
    );

    return {
      message:
        'Password changed successfully. You will need to login again with your new password.',
      requiresReauth: true,
    };
  }

  async debugUserLookup(email: string) {
    try {
      console.log(`Debug: Looking up user with email: "${email}"`);

      const allUsers = await this.databaseService
        .getPrismaClient()
        .user.findMany({
          select: { id: true, email: true, username: true, isVerified: true },
        });

      console.log('Debug: All users in database:', allUsers);

      const exactUser = await this.databaseService
        .getPrismaClient()
        .user.findUnique({
          where: { email: email },
        });

      console.log('Debug: Exact match result:', exactUser);

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
        allUsers,
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

    const existingUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email },
      });

    if (existingUser) {
      throw new BadRequestException('Email address is already registered');
    }

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.databaseService.getPrismaClient().user.create({
      data: {
        email,
        username: `temp_${Date.now()}`,
        password: 'temporary_password',
        isVerified: false,
        otp,
        otpExpiresAt,
      },
    });

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

    const existingUsername = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { username },
      });

    if (existingUsername && existingUsername.id !== user.id) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.databaseService
      .getPrismaClient()
      .user.update({
        where: { id: user.id },
        data: {
          username,
          password: hashedPassword,
          isVerified: true,
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

  async sendVerificationEmail(user: any, providedEmail?: string) {
    const email = providedEmail || user.email;

    if (providedEmail && providedEmail !== user.email) {
      throw new BadRequestException(
        'Email must match your logged-in email address',
      );
    }

    const verificationToken = this.generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp: verificationToken,
        otpExpiresAt: tokenExpiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message:
        'Verification email has been sent to your email address. Please check your inbox and click the verification link.',
    };
  }

  async verifyEmail(user: any, verifyOtpDto: VerifyOtpDto) {
    const { otp } = verifyOtpDto;

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

    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Verification token is required');
    }

    const user = await this.databaseService.getPrismaClient().user.findFirst({
      where: {
        otp: token,
      },
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

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    console.log(
      'AuthService: Cleaning old tokens before creating verified session',
    );

    await this.tokenCleanupService.cleanupAllTokensForUser(user.id);

    console.log('AuthService: Generating new verified session tokens');

    const accessTokenExpiry =
      process.env.ACCESS_TOKEN_EXPIRY_REMEMBER ||
      process.env.ACCESS_TOKEN_EXPIRY ||
      '24h';

    const refreshTokenExpiry =
      process.env.REFRESH_TOKEN_EXPIRY_REMEMBER ||
      process.env.REFRESH_TOKEN_EXPIRY ||
      '30d';

    const tokens = await this.generateTokens(user.id, true);

    console.log('AuthService: Setting authentication cookies');

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

    console.log('AuthService: Email verification completed successfully');
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
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  async sendCurrentEmailOtp(user: any) {
    const email = user.email;

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt,
        isVerified: true,
      },
    });

    await this.emailService.sendCurrentEmailVerificationOtp(email, otp);

    return {
      message:
        'OTP has been sent to your current email address. Please check your inbox and enter the 5-digit code.',
      expiresInMinutes: 10,
    };
  }

  async verifyCurrentEmailOtp(
    user: any,
    verifyOtpDto: VerifyEmailChangeOtpDto,
  ) {
    const { otp } = verifyOtpDto;

    const userRecord = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    if (!userRecord.otp || !userRecord.otpExpiresAt) {
      throw new BadRequestException(
        'No OTP found for current email verification',
      );
    }

    if (new Date() > userRecord.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (userRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    return {
      message:
        'Current email verified successfully. You can now enter your new email address.',
      canProceedToNewEmail: true,
    };
  }

  async sendNewEmailOtp(user: any, forgotPasswordDto: ForgotPasswordDto) {
    const { email: newEmail } = forgotPasswordDto;

    if (newEmail === user.email) {
      throw new BadRequestException(
        'New email must be different from current email',
      );
    }

    const existingUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email: newEmail },
      });

    if (existingUser) {
      throw new BadRequestException('Email address is already registered');
    }

    const newOtp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp: newOtp,
        otpExpiresAt,
        newEmail,
        isVerified: true,
      },
    });

    await this.emailService.sendNewEmailVerificationOtp(newEmail, newOtp);

    return {
      message:
        'OTP has been sent to your new email address. Please check your inbox and enter the 5-digit code.',
      expiresInMinutes: 10,
      newEmail,
    };
  }

  async verifyNewEmailOtp(user: any, verifyOtpDto: VerifyEmailChangeOtpDto) {
    const { otp } = verifyOtpDto;

    const userRecord = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    if (!userRecord.otp || !userRecord.otpExpiresAt) {
      throw new BadRequestException('No OTP found for new email verification');
    }

    if (new Date() > userRecord.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (userRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    return {
      message:
        'New email verified successfully. You can now confirm the change with your password.',
      canProceedToPasswordConfirmation: true,
    };
  }

  async confirmEmailChange(
    user: any,
    confirmEmailChangeDto: ConfirmEmailChangeDto,
  ) {
    const { newEmail, newPassword } = confirmEmailChangeDto;

    const userRecord = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    if (!userRecord.otp || !userRecord.otpExpiresAt) {
      throw new BadRequestException(
        'Email change verification not completed. Please start the process again.',
      );
    }

    if (new Date() > userRecord.otpExpiresAt) {
      throw new BadRequestException(
        'Email change verification has expired. Please start the process again.',
      );
    }

    if (!userRecord.newEmail) {
      throw new BadRequestException(
        'New email not found. Please start the email change process again.',
      );
    }

    const oldEmail = userRecord.email;
    const finalNewEmail = newEmail;

    console.log('Auth Service: Updating email and password:', {
      userId: user.id,
      oldEmail,
      newEmail: finalNewEmail,
      hasNewPassword: !!newPassword,
    });

    console.log(
      'Auth Service: Cleaning up all tokens for user before email/password change:',
      user.id,
    );

    const tokensCleaned =
      await this.tokenCleanupService.cleanupAllTokensForUser(user.id);

    console.log(
      `Auth Service: Cleaned up ${tokensCleaned} tokens for user ${user.id}`,
    );

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    const updateData: any = {
      email: finalNewEmail,
      password: hashedNewPassword,
      newEmail: null,
      otp: null,
      otpExpiresAt: null,
      isVerified: false,
    };

    console.log('Auth Service: Updating with new email and password');

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: updateData,
    });

    console.log(
      'Auth Service: Email and password change completed successfully',
    );

    await this.emailService.sendEmailChangeConfirmationEmail(
      finalNewEmail,
      oldEmail,
    );

    const updatedUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    return {
      message:
        'Email address and password updated successfully. You will receive a confirmation email at your new address. Please login again with your new email address and password.',
      newEmail: finalNewEmail,
      user: updatedUser
        ? {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            isVerified: updatedUser.isVerified,
          }
        : null,
      requiresReauth: true,
    };
  }
}
