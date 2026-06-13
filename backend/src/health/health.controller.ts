import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @SkipThrottle()
  @ApiExcludeEndpoint()
  liveness() {
    return this.healthService.liveness();
  }

  @Get('ready')
  @SkipThrottle()
  @ApiExcludeEndpoint()
  readiness() {
    return this.healthService.readiness();
  }
}
