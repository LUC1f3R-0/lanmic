import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../database.service';

interface JwtPayload {
  sub: number;
  iat: number;
  exp: number;
  type: 'access';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private databaseService: DatabaseService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from cookies
        (req: any) => {
          const token = req.cookies?.access_token || null;
          console.log('JWT Strategy: Extracting token from cookies:', {
            hasCookies: !!req.cookies,
            cookies: req.cookies,
            accessToken: !!token,
          });
          return token;
        },
        // Fallback to Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'], // Explicitly specify algorithm
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT Strategy: Validating payload:', {
      sub: payload.sub,
      type: payload.type,
      exp: payload.exp,
      iat: payload.iat,
    });

    // Validate token type to ensure it's an access token
    if (payload.type !== 'access') {
      console.log('JWT Strategy: Invalid token type:', payload.type);
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if token is expired (additional check)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }

    const user = await this.databaseService.getPrismaClient().user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // CRITICAL SECURITY CHECK: Verify that a valid refresh token exists for this user
    const validRefreshToken = await this.databaseService
      .getPrismaClient()
      .refreshToken.findFirst({
        where: {
          userId: user.id,
          revoked: false,
          expiresAt: {
            gt: new Date(), // Token hasn't expired
          },
        },
      });

    if (!validRefreshToken) {
      console.log(
        'JWT Strategy: No valid refresh token found for user:',
        user.id,
      );
      throw new UnauthorizedException('Session expired - please login again');
    }

    console.log('JWT Strategy: Valid refresh token found for user:', user.id);
    return user;
  }
}
