import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const headerKey =
      (req.headers['x-api-key'] as string | undefined) ??
      (req.headers['x-api_key'] as string | undefined);

    const expectedKey = process.env.API_KEY;

    if (!expectedKey) {
      // If no API_KEY is configured, allow the request (to avoid hard failures in dev)
      return next();
    }

    if (!headerKey || headerKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    next();
  }
}

