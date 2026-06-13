import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'crypto';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  randomToken(bytes = 32): string {
    return randomBytes(bytes).toString('base64url');
  }

  randomOtp(): string {
    return randomInt(100000, 1000000).toString();
  }

  hashRefreshToken(token: string): string {
    return this.hmac(
      token,
      this.configService.getOrThrow<string>('auth.tokenPepper'),
    );
  }

  hashOtp(value: string): string {
    return this.hmac(
      value,
      this.configService.getOrThrow<string>('auth.otpPepper'),
    );
  }

  hashGrant(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  signCsrfToken(token: string): string {
    return this.hmac(
      token,
      this.configService.getOrThrow<string>('auth.csrfSecret'),
    );
  }

  safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private hmac(value: string, secret: string): string {
    return createHmac('sha256', secret).update(value).digest('hex');
  }
}
