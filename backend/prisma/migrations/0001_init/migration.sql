-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `streak` INTEGER NOT NULL DEFAULT 0,
    `xp` INTEGER NOT NULL DEFAULT 0,
    `last_study` VARCHAR(10) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `words` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hanzi` VARCHAR(64) NOT NULL,
    `traditional` VARCHAR(64) NULL,
    `pinyin` VARCHAR(128) NULL,
    `meaning_vi` TEXT NULL,
    `meaning_en` TEXT NULL,
    `pos` VARCHAR(64) NULL,
    `hanviet` VARCHAR(128) NULL,
    `hsk_level` INTEGER NULL,
    `hsk_old` INTEGER NULL,
    `frequency` INTEGER NULL,
    `radical` VARCHAR(8) NULL,
    `audio_url` VARCHAR(500) NULL,

    INDEX `words_hsk_level_idx`(`hsk_level`),
    INDEX `words_hanzi_idx`(`hanzi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `examples` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `word_id` INTEGER NOT NULL,
    `hanzi` TEXT NOT NULL,
    `pinyin` TEXT NULL,
    `meaning_vi` TEXT NULL,
    `source` VARCHAR(64) NULL,

    INDEX `examples_word_id_idx`(`word_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_word_progress` (
    `user_id` INTEGER NOT NULL,
    `word_id` INTEGER NOT NULL,
    `ease_factor` DOUBLE NOT NULL DEFAULT 2.5,
    `interval` INTEGER NOT NULL DEFAULT 0,
    `repetitions` INTEGER NOT NULL DEFAULT 0,
    `due_date` VARCHAR(10) NOT NULL,

    INDEX `user_word_progress_user_id_due_date_idx`(`user_id`, `due_date`),
    PRIMARY KEY (`user_id`, `word_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `examples` ADD CONSTRAINT `examples_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_word_progress` ADD CONSTRAINT `user_word_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_word_progress` ADD CONSTRAINT `user_word_progress_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
