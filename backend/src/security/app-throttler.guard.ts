import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';
import type { Request } from 'express';

interface RequestWithAuthenticatedUser extends Request {
  user?: {
    id?: number;
  };
}

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return Promise.resolve(true);
    }

    return super.canActivate(context);
  }

  protected getTracker(rawRequest: Record<string, unknown>): Promise<string> {
    const request = rawRequest as unknown as RequestWithAuthenticatedUser;

    const body =
      typeof request.body === 'object' && request.body !== null
        ? (request.body as Record<string, unknown>)
        : {};

    const email = this.normalizedString(body.email);

    const challengeId = this.normalizedString(body.challengeId);

    const requestId = this.normalizedString(body.requestId);

    const userId =
      typeof request.user?.id === 'number' ? String(request.user.id) : '';

    const ipAddress = request.ip || request.socket?.remoteAddress || 'unknown';

    const trackerSource = [ipAddress, userId, email, challengeId, requestId]
      .map((value) => value.slice(0, 191))
      .join('|');

    const tracker = createHash('sha256').update(trackerSource).digest('hex');

    return Promise.resolve(tracker);
  }

  private normalizedString(value: unknown): string {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }
}
