-- AlterTable
ALTER TABLE `examples` ADD COLUMN `tokens` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `grammar_points` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` INTEGER NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `pattern` VARCHAR(500) NOT NULL,
    `explanation` TEXT NOT NULL,
    `notes` TEXT NULL,

    INDEX `grammar_points_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grammar_examples` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grammar_id` INTEGER NOT NULL,
    `hanzi` VARCHAR(500) NOT NULL,
    `pinyin` TEXT NULL,
    `meaning_vi` TEXT NULL,

    INDEX `grammar_examples_grammar_id_idx`(`grammar_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `user_id` INTEGER NOT NULL,
    `word_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`, `word_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_activity` (
    `user_id` INTEGER NOT NULL,
    `date` VARCHAR(10) NOT NULL,
    `reviews` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`user_id`, `date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `grammar_examples` ADD CONSTRAINT `grammar_examples_grammar_id_fkey` FOREIGN KEY (`grammar_id`) REFERENCES `grammar_points`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_activity` ADD CONSTRAINT `daily_activity_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
