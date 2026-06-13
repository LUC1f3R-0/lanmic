import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
    rememberMe: boolean,
  ): void {
    const accessTtlSeconds = this.configService.getOrThrow<number>(
      'auth.accessTtlSeconds',
    );
    const refreshTtlSeconds = rememberMe
      ? this.configService.getOrThrow<number>('auth.refreshRememberTtlSeconds')
      : this.configService.getOrThrow<number>('auth.refreshTtlSeconds');

    response.cookie('access_token', accessToken, {
      ...this.baseCookieOptions(),
      httpOnly: true,
      maxAge: accessTtlSeconds * 1000,
    });

    response.cookie('refresh_token', refreshToken, {
      ...this.baseCookieOptions(),
      httpOnly: true,
      maxAge: refreshTtlSeconds * 1000,
    });
  }

  clearAuthCookies(response: Response): void {
    const options = this.baseCookieOptions();
    response.clearCookie('access_token', options);
    response.clearCookie('refresh_token', options);
  }

  private baseCookieOptions(): CookieOptions {
    const isProduction =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production';
    const sameSite = this.configService.getOrThrow<'lax' | 'strict' | 'none'>(
      'cookie.sameSite',
    );
    const domain = this.configService.get<string>('cookie.domain');

    return {
      secure: isProduction,
      sameSite,
      domain: domain || undefined,
      path: '/',
    };
  }
}
