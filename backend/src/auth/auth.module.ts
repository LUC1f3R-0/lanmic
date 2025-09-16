import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { TokenCleanupService } from './token-cleanup.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseService } from '../database.service';

@Module({
  imports: [
    PassportModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CookieService,
    TokenCleanupService,
    JwtStrategy,
    DatabaseService,
  ],
  exports: [AuthService, CookieService, TokenCleanupService],
})
export class AuthModule {}
