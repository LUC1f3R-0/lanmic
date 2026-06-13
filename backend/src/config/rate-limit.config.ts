import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitConfig: ThrottlerModuleOptions = [
  {
    ttl: 60_000,
    limit: 120,
  },
];
