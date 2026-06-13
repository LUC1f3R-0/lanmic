import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { CsrfController } from './csrf.controller';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtSecret'),
        signOptions: {
          issuer: configService.getOrThrow<string>('auth.issuer'),
          audience: configService.getOrThrow<string>('auth.audience'),
          algorithm: 'HS512',
        },
      }),
    }),
  ],
  controllers: [AuthController, CsrfController],
  providers: [
    AuthService,
    CookieService,
    EmailService,
    TokenCleanupService,
    JwtStrategy,
  ],
  exports: [AuthService, CookieService, EmailService, JwtModule],
})
export class AuthModule {}
