import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { randomBytes } from 'crypto';

/**
 * CSRF Interceptor - Sets CSRF token cookie
 * Implements Double Submit Cookie pattern
 */
@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest();

    // Generate CSRF token if not present
    if (!request.cookies?.['csrf-token']) {
      const csrfToken = randomBytes(32).toString('hex');
      
      // Set CSRF token cookie
      response.cookie('csrf-token', csrfToken, {
        httpOnly: false, // Must be accessible to JavaScript for Double Submit Cookie
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }

    return next.handle();
  }
}


