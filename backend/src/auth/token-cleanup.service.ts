import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private databaseService: DatabaseService) {}

  // Run cleanup every 5 minutes to clean up any orphaned expired tokens
  // Main cleanup happens on login and access token expiration
  @Cron('0 */5 * * * *')
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

  // Clean up expired tokens for a specific user
  async cleanupExpiredTokensForUser(userId: number): Promise<number> {
    try {
      const result = await this.databaseService
        .getPrismaClient()
        .refreshToken.deleteMany({
          where: {
            userId,
            expiresAt: { lt: new Date() }, // Only expired tokens
          },
        });

      if (result.count > 0) {
        this.logger.log(
          `Cleaned up ${result.count} expired tokens for user ${userId}`,
        );
      }
      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to cleanup expired tokens for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Clean up ALL tokens for a specific user (used when access token expires)
  async cleanupAllTokensForUser(userId: number): Promise<number> {
    try {
      const result = await this.databaseService
        .getPrismaClient()
        .refreshToken.deleteMany({
          where: {
            userId,
          },
        });

      if (result.count > 0) {
        this.logger.log(
          `Cleaned up ALL ${result.count} tokens for user ${userId} due to access token expiration`,
        );
      }
      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to cleanup all tokens for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  // Clean up tokens that are close to expiring (within 1 hour) to prevent accumulation
  @Cron('0 0 * * * *') // Run every hour
  async cleanupTokensNearExpiry() {
    try {
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      const result = await this.databaseService
        .getPrismaClient()
        .refreshToken.deleteMany({
          where: {
            expiresAt: { lt: oneHourFromNow },
          },
        });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} tokens near expiry`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup tokens near expiry:', error);
    }
  }
}
