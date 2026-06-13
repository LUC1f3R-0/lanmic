import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Throttle({ short: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Get public API service information' })
  @ApiResponse({ status: 200, description: 'API is reachable' })
  getServiceInfo() {
    return this.appService.getServiceInfo();
  }
}
