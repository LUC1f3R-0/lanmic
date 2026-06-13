-- ONE-TIME migration for the original LANMIC schema shown in the supplied export.
-- REQUIREMENTS:
--   1. Stop all backend instances.
--   2. Take and verify a complete MySQL backup.
--   3. Run against a staging copy first.
--   4. This intentionally deletes all old refresh tokens, signing everyone out.
-- MySQL DDL auto-commits; a transaction does not make these ALTER statements atomic.

ALTER TABLE `users`
  ADD COLUMN `role` ENUM('ADMIN', 'EDITOR', 'USER') NOT NULL DEFAULT 'USER' AFTER `password`,
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true AFTER `role`,
  ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL AFTER `isActive`,
  ADD COLUMN `tokenVersion` INTEGER NOT NULL DEFAULT 0 AFTER `emailVerifiedAt`;

UPDATE `users`
SET `emailVerifiedAt` = CASE
  WHEN `isVerified` = true THEN COALESCE(`updatedAt`, CURRENT_TIMESTAMP(3))
  ELSE NULL
END;

ALTER TABLE `users`
  DROP COLUMN `isVerified`,
  DROP COLUMN `otp`,
  DROP COLUMN `otpExpiresAt`,
  DROP COLUMN `newEmail`,
  MODIFY COLUMN `email` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `username` VARCHAR(64) NOT NULL,
  MODIFY COLUMN `password` VARCHAR(255) NOT NULL,
  ADD INDEX `users_role_isActive_idx` (`role`, `isActive`);

DROP TABLE IF EXISTS `refresh_tokens`;

CREATE TABLE `auth_sessions` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `rememberMe` BOOLEAN NOT NULL DEFAULT false,
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ipAddress` VARCHAR(45) NULL,
  `userAgent` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `auth_sessions_userId_revokedAt_expiresAt_idx` (`userId`, `revokedAt`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `auth_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `tokenHash` CHAR(64) NOT NULL,
  `sessionId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `consumedAt` DATETIME(3) NULL,
  `revokedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `refresh_tokens_tokenHash_key` (`tokenHash`),
  INDEX `refresh_tokens_sessionId_revokedAt_expiresAt_idx` (`sessionId`, `revokedAt`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `refresh_tokens_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `auth_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `verification_challenges` (
  `id` VARCHAR(191) NOT NULL,
  `purpose` ENUM('REGISTER', 'PASSWORD_RESET', 'VERIFY_EMAIL') NOT NULL,
  `target` VARCHAR(191) NOT NULL,
  `codeHash` CHAR(64) NOT NULL,
  `grantHash` CHAR(64) NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `maxAttempts` INTEGER NOT NULL DEFAULT 5,
  `expiresAt` DATETIME(3) NOT NULL,
  `verifiedAt` DATETIME(3) NULL,
  `consumedAt` DATETIME(3) NULL,
  `userId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `verification_challenges_grantHash_key` (`grantHash`),
  INDEX `verification_challenges_target_purpose_expiresAt_idx` (`target`, `purpose`, `expiresAt`),
  INDEX `verification_challenges_userId_purpose_expiresAt_idx` (`userId`, `purpose`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `verification_challenges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_change_requests` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `newEmail` VARCHAR(191) NULL,
  `currentCodeHash` CHAR(64) NOT NULL,
  `currentCodeExpiresAt` DATETIME(3) NOT NULL,
  `currentAttempts` INTEGER NOT NULL DEFAULT 0,
  `currentVerifiedAt` DATETIME(3) NULL,
  `newCodeHash` CHAR(64) NULL,
  `newCodeExpiresAt` DATETIME(3) NULL,
  `newAttempts` INTEGER NOT NULL DEFAULT 0,
  `newVerifiedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `email_change_requests_userId_completedAt_expiresAt_idx` (`userId`, `completedAt`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `email_change_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Align existing CMS column widths and indexes with the hardened Prisma schema.
ALTER TABLE `blog_posts`
  MODIFY COLUMN `title` VARCHAR(200) NOT NULL,
  MODIFY COLUMN `category` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `readTime` VARCHAR(50) NULL,
  MODIFY COLUMN `authorName` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `authorPosition` VARCHAR(100) NULL,
  MODIFY COLUMN `authorImage` VARCHAR(255) NULL,
  MODIFY COLUMN `blogImage` VARCHAR(255) NULL;

ALTER TABLE `team_members`
  MODIFY COLUMN `name` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `position` VARCHAR(150) NOT NULL,
  MODIFY COLUMN `image` VARCHAR(255) NULL,
  MODIFY COLUMN `department` VARCHAR(100) NULL;

ALTER TABLE `executive_leadership`
  MODIFY COLUMN `name` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `position` VARCHAR(150) NOT NULL,
  MODIFY COLUMN `image` VARCHAR(255) NULL,
  MODIFY COLUMN `linkedinUrl` VARCHAR(500) NULL,
  MODIFY COLUMN `twitterUrl` VARCHAR(500) NULL;

ALTER TABLE `testimonials`
  MODIFY COLUMN `name` VARCHAR(100) NOT NULL,
  MODIFY COLUMN `position` VARCHAR(150) NULL,
  MODIFY COLUMN `company` VARCHAR(150) NULL,
  MODIFY COLUMN `image` VARCHAR(255) NULL;
