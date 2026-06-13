import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { DatabaseService } from '../../database.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

interface AccessTokenPayload {
  sub: number;
  sid: string;
  role: string;
  tv: number;
  type: 'access';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token as string | null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwtSecret'),
      issuer: configService.getOrThrow<string>('auth.issuer'),
      audience: configService.getOrThrow<string>('auth.audience'),
      algorithms: ['HS512'],
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    if (payload.type !== 'access' || !payload.sub || !payload.sid) {
      throw new UnauthorizedException('Invalid access token');
    }

    const session = await this.databaseService.authSession.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });

    const now = new Date();
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= now ||
      !session.user.isActive ||
      session.user.tokenVersion !== payload.tv
    ) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    return {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      role: session.user.role,
      isVerified: Boolean(session.user.emailVerifiedAt),
      sessionId: session.id,
      tokenVersion: session.user.tokenVersion,
    };
  }
}
