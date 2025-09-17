import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database.service';
import { CookieService } from './cookie.service';
import { LoginDto, RefreshTokenDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private cookieService: CookieService,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const { email, password, rememberMe } = loginDto;

    const user = await this.databaseService.getPrismaClient().user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clean up old tokens for this user before generating new ones
    const beforeCleanup = await this.getUserTokenCount(user.id);
    await this.cleanupUserTokens(user.id);
    const afterCleanup = await this.getUserTokenCount(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user.id);
    const afterLogin = await this.getUserTokenCount(user.id);

    console.log(`Auth Service: Token cleanup for user ${user.id}: ${beforeCleanup} -> ${afterCleanup} -> ${afterLogin} tokens`);
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

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isActive: user.isVerified,
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

    if (!tokenRecord.user.isVerified) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Delete the old refresh token completely
    await this.databaseService.getPrismaClient().refreshToken.delete({
      where: { id: tokenRecord.id },
    });
    console.log(
      `Auth Service: Deleted old refresh token with ID ${tokenRecord.id} during refresh`,
    );

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
      message: 'Tokens refreshed successfully',
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        username: tokenRecord.user.username,
        isActive: tokenRecord.user.isVerified,
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
        isActive: user.isVerified,
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
    const count = await this.databaseService.getPrismaClient().refreshToken.count({
      where: { userId },
    });
    return count;
  }

  // Method to get total token count (for debugging/testing)
  async getTotalTokenCount(): Promise<number> {
    const count = await this.databaseService.getPrismaClient().refreshToken.count();
    return count;
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
