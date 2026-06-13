import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { CryptoService } from '../security/crypto.service';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return true;
    }

    const cookieValue = request.cookies?.csrf_token as string | undefined;
    const headerToken = request.header('x-csrf-token');

    if (!cookieValue || !headerToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    const [cookieToken, signature] = cookieValue.split('.');
    if (!cookieToken || !signature) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    const expectedSignature = this.cryptoService.signCsrfToken(cookieToken);
    const valid =
      this.cryptoService.safeEqual(cookieToken, headerToken) &&
      this.cryptoService.safeEqual(signature, expectedSignature);

    if (!valid) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    const origin = request.header('origin');
    const frontendUrl =
      this.configService.getOrThrow<string>('app.frontendUrl');
    if (origin && origin !== frontendUrl) {
      throw new ForbiddenException('Invalid request origin');
    }

    return true;
  }
}
