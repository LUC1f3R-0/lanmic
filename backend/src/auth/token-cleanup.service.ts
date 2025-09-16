import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private databaseService: DatabaseService) {}

  // Run cleanup every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    try {
      const result = await this.databaseService
        .getPrismaClient()
        .refreshToken.deleteMany({
          where: {
            expiresAt: { lt: new Date() }, // Only expired tokens
          },
        });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired tokens`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens:', error);
    }
  }

  // Manual cleanup method that can be called on demand
  async manualCleanup(): Promise<number> {
    try {
      const result = await this.databaseService
        .getPrismaClient()
        .refreshToken.deleteMany({
          where: {
            expiresAt: { lt: new Date() }, // Only expired tokens
          },
        });

      this.logger.log(`Manual cleanup: Removed ${result.count} expired tokens`);
      return result.count;
    } catch (error) {
      this.logger.error('Failed to perform manual cleanup:', error);
      throw error;
    }
  }
}
