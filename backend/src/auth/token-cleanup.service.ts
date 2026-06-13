import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSecurityRecords(): Promise<number> {
    const now = new Date();
    const retentionBoundary = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [refreshTokens, challenges, emailChanges, sessions] =
      await this.databaseService.$transaction([
        this.databaseService.refreshToken.deleteMany({
          where: {
            OR: [
              { expiresAt: { lt: now } },
              { consumedAt: { lt: retentionBoundary } },
              { revokedAt: { lt: retentionBoundary } },
            ],
          },
        }),
        this.databaseService.verificationChallenge.deleteMany({
          where: {
            OR: [
              { expiresAt: { lt: retentionBoundary } },
              { consumedAt: { lt: retentionBoundary } },
            ],
          },
        }),
        this.databaseService.emailChangeRequest.deleteMany({
          where: {
            OR: [
              { expiresAt: { lt: retentionBoundary } },
              { completedAt: { lt: retentionBoundary } },
            ],
          },
        }),
        this.databaseService.authSession.deleteMany({
          where: {
            OR: [
              { expiresAt: { lt: retentionBoundary } },
              { revokedAt: { lt: retentionBoundary } },
            ],
          },
        }),
      ]);

    const total =
      refreshTokens.count +
      challenges.count +
      emailChanges.count +
      sessions.count;
    if (total > 0) {
      this.logger.log(`Removed ${total} expired security records`);
    }
    return total;
  }

  async revokeAllSessionsForUser(userId: number): Promise<number> {
    const result = await this.databaseService.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }
}
