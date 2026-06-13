/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionId` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refresh_tokens`
  ADD COLUMN `sessionId` VARCHAR(191) NULL,
  ADD COLUMN `deviceName` VARCHAR(255) NULL,
  ADD COLUMN `ipAddress` VARCHAR(45) NULL,
  ADD COLUMN `userAgent` TEXT NULL,
  ADD COLUMN `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `revokedAt` DATETIME(3) NULL;

UPDATE `refresh_tokens`
SET `sessionId` = REPLACE(UUID(), '-', '')
WHERE `sessionId` IS NULL;

ALTER TABLE `refresh_tokens`
  MODIFY `sessionId` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `refresh_tokens_sessionId_key`
ON `refresh_tokens`(`sessionId`);

CREATE INDEX `refresh_tokens_user_session_idx`
ON `refresh_tokens`(`userId`, `sessionId`);

CREATE INDEX `refresh_tokens_user_active_idx`
ON `refresh_tokens`(`userId`, `revoked`, `expiresAt`);
