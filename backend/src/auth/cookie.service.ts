import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  private readonly ACCESS_TOKEN_COOKIE_NAME = 'access_token';
  private readonly REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
  private readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };

  setAccessTokenCookie(res: Response, token: string, expiresIn: string): void {
    const maxAge = this.parseExpiryToMs(expiresIn);

    res.cookie(this.ACCESS_TOKEN_COOKIE_NAME, token, {
      ...this.COOKIE_OPTIONS,
      maxAge,
    });
  }

  setRefreshTokenCookie(res: Response, token: string, expiresIn: string): void {
    const maxAge = this.parseExpiryToMs(expiresIn);

    res.cookie(this.REFRESH_TOKEN_COOKIE_NAME, token, {
      ...this.COOKIE_OPTIONS,
      maxAge,
    });
  }

  clearAccessTokenCookie(res: Response): void {
    res.clearCookie(this.ACCESS_TOKEN_COOKIE_NAME, {
      ...this.COOKIE_OPTIONS,
    });
  }

  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME, {
      ...this.COOKIE_OPTIONS,
    });
  }

  clearAllAuthCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  }

  private parseExpiryToMs(expiry: string): number {
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
        return 15 * 60 * 1000; // Default to 15 minutes
    }
  }
}
