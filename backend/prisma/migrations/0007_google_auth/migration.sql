-- AlterTable users: make password_hash nullable for OAuth users, add avatar_url
ALTER TABLE `users`
  MODIFY `password_hash` VARCHAR(255) NULL,
  ADD COLUMN `avatar_url` VARCHAR(500) NULL;

-- CreateTable auth_accounts for third-party OAuth providers (Google, etc.)
CREATE TABLE `auth_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `provider` VARCHAR(32) NOT NULL,
    `provider_user_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `auth_accounts_provider_provider_user_id_key`(`provider`, `provider_user_id`),
    INDEX `auth_accounts_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auth_accounts` ADD CONSTRAINT `auth_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
