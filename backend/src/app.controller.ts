import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';

@ApiTags('lanmic')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Returns a welcome message',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-connection')
  @ApiOperation({ summary: 'Test PostgreSQL database connection' })
  @ApiResponse({
    status: 200,
    description:
      'Returns true if database connection is successful, false otherwise',
    schema: {
      type: 'object',
      properties: {
        connected: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  async testDatabaseConnection(): Promise<{ connected: boolean }> {
    const isConnected = await this.databaseService.testConnection();
    return { connected: isConnected };
  }
}
