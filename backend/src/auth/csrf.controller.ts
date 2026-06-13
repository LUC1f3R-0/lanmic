import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { CryptoService } from '../security/crypto.service';

@Controller('auth')
export class CsrfController {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  @Get('csrf-token')
  issueToken(@Res({ passthrough: true }) response: Response): {
    csrfToken: string;
  } {
    const token = this.cryptoService.randomToken(32);
    const signature = this.cryptoService.signCsrfToken(token);
    const isProduction =
      this.configService.getOrThrow<string>('app.nodeEnv') === 'production';
    const sameSite = this.configService.getOrThrow<'lax' | 'strict' | 'none'>(
      'cookie.sameSite',
    );
    const domain = this.configService.get<string>('cookie.domain');

    response.cookie('csrf_token', `${token}.${signature}`, {
      httpOnly: false,
      secure: isProduction,
      sameSite,
      domain: domain || undefined,
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });

    response.setHeader('Cache-Control', 'no-store');
    return { csrfToken: token };
  }
}
