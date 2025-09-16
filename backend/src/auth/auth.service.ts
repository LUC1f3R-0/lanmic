import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
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
    const { email, password } = loginDto;

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

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

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

    // Revoke the old refresh token
    await this.databaseService.getPrismaClient().refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

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

    // Clear all authentication cookies
    this.cookieService.clearAllAuthCookies(res);

    return { message: 'Logged out successfully' };
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
    await this.databaseService.getPrismaClient().refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
      },
    });
  }

  // Method to revoke all refresh tokens for a user
  async revokeAllUserTokens(userId: number) {
    await this.databaseService.getPrismaClient().refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
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
