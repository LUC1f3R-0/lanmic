import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest();

    if (!request.cookies?.['csrf-token']) {
      const csrfToken = randomBytes(32).toString('hex');

      const sameSite = this.getSameSite();
      const isProduction = process.env.NODE_ENV === 'production';

      response.cookie('csrf-token', csrfToken, {
        httpOnly: false,
        secure: sameSite === 'none' ? true : isProduction,
        sameSite,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    return next.handle();
  }

  private getSameSite(): 'lax' | 'strict' | 'none' {
    const value = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();

    if (value === 'strict' || value === 'lax' || value === 'none') {
      return value;
    }

    return 'lax';
  }
}
