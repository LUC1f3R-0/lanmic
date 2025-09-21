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

    // Debug logging for login attempts
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

    // Remove this check - we want users to be able to login even if unverified
    // They will need to verify email to access dashboard content

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

    // Clear OTP data and reset verification status for new session
    // BUT preserve email change OTP data if it exists
    const updateData: any = {
      isVerified: false, // Reset email verification on every login - user must verify email for each session
    };

    // Only clear OTP data if it's not for email change process
    if (!user.newEmail) {
      updateData.otp = null;
      updateData.otpExpiresAt = null;
    }

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Clean up ALL existing tokens for this user before generating new ones
    const beforeCleanup = await this.getUserTokenCount(user.id);
    await this.cleanupAllUserTokens(user.id);
    const afterCleanup = await this.getUserTokenCount(user.id);

    // Generate tokens
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
      // Clean up expired tokens for this user before throwing error
      await this.cleanupUserTokens(tokenRecord.userId);
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

    // Check if user should be logged out based on rememberMe status
    if (!tokenRecord.rememberMe) {
      // If rememberMe was false, log out the user by clearing tokens
      await this.tokenCleanupService.cleanupAllTokensForUser(
        tokenRecord.user.id,
      );
      this.cookieService.clearAllAuthCookies(res);
      throw new UnauthorizedException('Session expired - please login again');
    }

    // Generate new tokens with the same rememberMe status
    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.rememberMe,
    );

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
      message: tokenRecord.user.isVerified
        ? 'Tokens refreshed successfully'
        : 'Tokens refreshed successfully - Email verification required',
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
        isVerified: tokenRecord.user.isVerified, // Keep current verification status
      },
    };
  }

  async logout(refreshToken: string, res: Response, userId?: number | null) {
    try {
      let targetUserId: number | null = userId || null;

      // Find the user from the refresh token if userId not provided
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

      // Clean up ALL tokens for this user on logout and reset email verification
      if (targetUserId) {
        const deletedCount =
          await this.tokenCleanupService.cleanupAllTokensForUser(targetUserId);
        console.log(
          `Auth Service: Logout cleanup - Deleted ${deletedCount} tokens for user ${targetUserId}`,
        );

        // Reset email verification on logout - user must verify email again on next login
        await this.databaseService.getPrismaClient().user.update({
          where: { id: targetUserId },
          data: { isVerified: false },
        });
        console.log(
          `Auth Service: Reset email verification for user ${targetUserId} on logout`,
        );
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

    // Save refresh token to database
    await this.databaseService.getPrismaClient().refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
        userId,
        rememberMe: rememberMe,
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
    return await this.tokenCleanupService.cleanupExpiredTokensForUser(userId);
  }

  // Method to clean up ALL tokens for a user (used for logout)
  async cleanupAllUserTokens(userId: number) {
    return await this.tokenCleanupService.cleanupAllTokensForUser(userId);
  }

  // Manual cleanup method for administrators
  async manualCleanup(): Promise<number> {
    return await this.tokenCleanupService.manualCleanup();
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

    // CRITICAL SECURITY FIX: Clean up ALL tokens for this user before password reset
    // This prevents session hijacking and ensures the user must re-authenticate
    console.log(
      'Auth Service: Cleaning up all tokens for user before password reset:',
      user.id,
    );
    const tokensCleaned =
      await this.tokenCleanupService.cleanupAllTokensForUser(user.id);
    console.log(
      `Auth Service: Cleaned up ${tokensCleaned} tokens for user ${user.id}`,
    );

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

    return {
      message:
        'Password reset successfully. You will need to login again with your new password.',
      requiresReauth: true, // Signal to frontend that re-authentication is required
    };
  }

  async changePassword(user: any, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Validate that new password and confirm password match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Validate that new password is different from current password
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Get fresh user data from database
    const userRecord = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { id: user.id },
      });

    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userRecord.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // CRITICAL SECURITY FIX: Clean up ALL tokens for this user before password change
    // This prevents session hijacking and ensures the user must re-authenticate
    console.log(
      'Auth Service: Cleaning up all tokens for user before password change:',
      user.id,
    );
    const tokensCleaned =
      await this.tokenCleanupService.cleanupAllTokensForUser(user.id);
    console.log(
      `Auth Service: Cleaned up ${tokensCleaned} tokens for user ${user.id}`,
    );

    // Update user password
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    // Send password change confirmation email
    await this.emailService.sendPasswordChangeConfirmationEmail(
      userRecord.email,
    );

    return {
      message:
        'Password changed successfully. You will need to login again with your new password.',
      requiresReauth: true, // Signal to frontend that re-authentication is required
    };
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
          isVerified: true, // Mark as verified after successful registration - user can see dashboard cards
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

    // Validate that the provided email matches the logged-in user's email
    if (providedEmail && providedEmail !== user.email) {
      throw new BadRequestException(
        'Email must match your logged-in email address',
      );
    }

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
    // Update user as verified and clear token - this is when user can see dashboard cards
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        isVerified: true, // Now user can see dashboard cards
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

  // Email Change Methods
  async sendCurrentEmailOtp(user: any) {
    const email = user.email;

    // Generate 5-digit OTP
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with current email OTP - KEEP isVerified = true during email change process
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiresAt,
        // Keep isVerified = true during email change process
        isVerified: true,
      },
    });

    // Send OTP email using SMTP
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

    // Mark current email as verified (but don't clear OTP yet - we'll use it for new email)
    // Keep isVerified = true throughout the email change process
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        // Keep OTP for new email verification
        // Keep isVerified = true during email change process
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

    // Check if new email is different from current email
    if (newEmail === user.email) {
      throw new BadRequestException(
        'New email must be different from current email',
      );
    }

    // Check if new email already exists
    const existingUser = await this.databaseService
      .getPrismaClient()
      .user.findUnique({
        where: { email: newEmail },
      });

    if (existingUser) {
      throw new BadRequestException('Email address is already registered');
    }

    // Generate new OTP for new email
    const newOtp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new email OTP and store new email temporarily
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        otp: newOtp,
        otpExpiresAt,
        newEmail: newEmail, // Store the new email temporarily
        isVerified: true, // Keep verified during email change process
      },
    });

    // Send OTP email to new email address
    await this.emailService.sendNewEmailVerificationOtp(newEmail, newOtp);

    return {
      message:
        'OTP has been sent to your new email address. Please check your inbox and enter the 5-digit code.',
      expiresInMinutes: 10,
      newEmail: newEmail, // Return the new email for frontend reference
    };
  }

  async verifyNewEmailOtp(user: any, verifyOtpDto: VerifyEmailChangeOtpDto) {
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
      throw new BadRequestException('No OTP found for new email verification');
    }

    if (new Date() > userRecord.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (userRecord.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Mark new email as verified (but don't update email yet - wait for password confirmation)
    // Keep isVerified = true during email change process
    // Note: We don't update newEmail here - it should already be set from sendNewEmailOtp
    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: {
        // Keep OTP for final confirmation
        // Keep newEmail for final confirmation (already set)
        // Keep isVerified = true during email change process
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

    // No password verification needed - just update with new data

    // Update user's email and password, clear temporary data
    const oldEmail = userRecord.email;
    const finalNewEmail = newEmail;

    console.log('Auth Service: Updating email and password:', {
      userId: user.id,
      oldEmail: oldEmail,
      newEmail: finalNewEmail,
      hasNewPassword: !!newPassword,
    });

    // CRITICAL SECURITY FIX: Clean up ALL tokens for this user before email/password change
    // This prevents session hijacking and ensures the user must re-authenticate
    console.log(
      'Auth Service: Cleaning up all tokens for user before email/password change:',
      user.id,
    );
    const tokensCleaned =
      await this.tokenCleanupService.cleanupAllTokensForUser(user.id);
    console.log(
      `Auth Service: Cleaned up ${tokensCleaned} tokens for user ${user.id}`,
    );

    // Prepare update data - always update with new email and password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    const updateData: any = {
      email: finalNewEmail,
      password: hashedNewPassword,
      newEmail: null, // Clear temporary new email
      otp: null, // Clear OTP
      otpExpiresAt: null, // Clear OTP expiration
      isVerified: false, // Reset verification status - user must verify new email
    };

    console.log('Auth Service: Updating with new email and password');

    await this.databaseService.getPrismaClient().user.update({
      where: { id: user.id },
      data: updateData,
    });

    console.log('Auth Service: Email and password change completed successfully');

    // Send confirmation email to new address
    await this.emailService.sendEmailChangeConfirmationEmail(
      finalNewEmail,
      oldEmail,
    );

    // Get the updated user data after email/password change
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
      requiresReauth: true, // Signal to frontend that re-authentication is required
    };
  }
}
