import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../auth/email.service';
import { DatabaseService } from '../database.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  liveness() {
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
    };
  }

  async readiness() {
    const database = await this.databaseService.testConnection();

    const smtpRequired =
      this.configService.getOrThrow<boolean>('smtp.required');

    const smtpReady = this.emailService.isEmailServiceReady();

    const ready = database && (!smtpRequired || smtpReady);

    const dependencies = {
      database: database ? 'up' : 'down',
      smtp: smtpReady ? 'up' : smtpRequired ? 'down' : 'optional-unavailable',
    } as const;

    if (!ready) {
      throw new ServiceUnavailableException({
        status: 'not-ready',
        dependencies,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ready' as const,
      dependencies,
      rateLimiting: 'in-memory',
      timestamp: new Date().toISOString(),
    };
  }
}
