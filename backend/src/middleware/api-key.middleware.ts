import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly publicRoutes = [
    '/auth/verify-email',
    '/auth/test',
    '/favicon.ico',
    '/uploads',
  ];

  use(req: any, res: any, next: () => void) {
    // IMPORTANT:
    // When middleware is mounted with forRoutes('*'), req.path can become "/".
    // So originalUrl is safer here.
    const requestPath = (req.originalUrl || req.url || '').split('?')[0];

    console.log('API Key Middleware:', {
      method: req.method,
      originalUrl: req.originalUrl,
      url: req.url,
      path: req.path,
      requestPath,
    });

    if (req.method === 'OPTIONS') {
      return next();
    }

    const isPublicRoute = this.publicRoutes.some((route) =>
      requestPath.startsWith(route),
    );

    if (isPublicRoute) {
      return next();
    }

    const expectedKey = process.env.API_KEY;

    if (!expectedKey) {
      return next();
    }

    const headerKey =
      (req.headers['x-api-key'] as string | undefined) ??
      (req.headers['x-api_key'] as string | undefined);

    if (!headerKey || headerKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return next();
  }
}