import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * CSRF Guard - Implements Double Submit Cookie pattern
 * Validates CSRF token from header against cookie
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip CSRF for public endpoints (login, register, etc.)
    const publicPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/verify-otp',
      '/auth/reset-password',
      '/auth/refresh',
      '/auth/verify-email',
      '/contact',
    ];
    
    const isPublicPath = publicPaths.some(path => 
      request.path.startsWith(path)
    );
    
    if (isPublicPath) {
      return true;
    }

    // Get CSRF token from header
    const csrfToken = request.headers['x-csrf-token'] as string;
    const csrfCookie = request.cookies?.['csrf-token'];

    if (!csrfToken || !csrfCookie) {
      throw new ForbiddenException('CSRF token missing');
    }

    // Validate token matches cookie (Double Submit Cookie pattern)
    if (csrfToken !== csrfCookie) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}


