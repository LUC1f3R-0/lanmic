import { Injectable } from '@nestjs/common';
import { Response, CookieOptions } from 'express';

@Injectable()
export class CookieService {
  private readonly ACCESS_TOKEN_COOKIE_NAME = 'access_token';
  private readonly REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

  private getSameSite(): 'lax' | 'strict' | 'none' {
    const value = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();

    if (value === 'strict' || value === 'lax' || value === 'none') {
      return value;
    }

    return 'lax';
  }

  private getCookieOptions(): CookieOptions {
    const sameSite = this.getSameSite();
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: sameSite === 'none' ? true : isProduction,
      sameSite,
      path: '/',
    };
  }

  setAccessTokenCookie(res: Response, token: string, expiresIn: string): void {
    const maxAge = this.parseExpiryToMs(expiresIn);

    res.cookie(this.ACCESS_TOKEN_COOKIE_NAME, token, {
      ...this.getCookieOptions(),
      maxAge,
    });
  }

  setRefreshTokenCookie(res: Response, token: string, expiresIn: string): void {
    const maxAge = this.parseExpiryToMs(expiresIn);

    res.cookie(this.REFRESH_TOKEN_COOKIE_NAME, token, {
      ...this.getCookieOptions(),
      maxAge,
    });
  }

  clearAccessTokenCookie(res: Response): void {
    res.clearCookie(this.ACCESS_TOKEN_COOKIE_NAME, {
      ...this.getCookieOptions(),
    });
  }

  clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME, {
      ...this.getCookieOptions(),
    });
  }

  clearAllAuthCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  }

  private parseExpiryToMs(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    if (Number.isNaN(value)) {
      return 15 * 60 * 1000;
    }

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
        return 15 * 60 * 1000;
    }
  }
}
