-- Migration 0003: danh mục từ vựng, mở rộng ngữ pháp, vai trò quản trị.
-- Chỉ THÊM cột và bảng, không xoá hay sửa dữ liệu hiện có. Tương thích ngược với API cũ.
--
-- Kiểm tra trước khi chạy (cần trả về 0 dòng, nếu không chỉ mục unique ở grammar_examples sẽ lỗi):
--   SELECT grammar_id, hanzi, COUNT(*) c FROM grammar_examples GROUP BY grammar_id, hanzi HAVING c > 1;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(16) NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE `grammar_points`
    ADD COLUMN `title_zh` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NULL,
    ADD COLUMN `category` VARCHAR(64) NULL,
    ADD COLUMN `keywords` VARCHAR(255) NULL,
    ADD COLUMN `usage_notes` TEXT NULL,
    ADD COLUMN `common_mistakes` TEXT NULL,
    ADD COLUMN `is_published` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `source` VARCHAR(32) NOT NULL DEFAULT 'imported',
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

CREATE UNIQUE INDEX `grammar_points_slug_key` ON `grammar_points`(`slug`);
CREATE INDEX `grammar_points_level_sort_order_idx` ON `grammar_points`(`level`, `sort_order`);
CREATE INDEX `grammar_points_category_idx` ON `grammar_points`(`category`);

-- AlterTable
ALTER TABLE `grammar_examples`
    ADD COLUMN `tokens` VARCHAR(500) NULL,
    ADD COLUMN `explanation_vi` TEXT NULL,
    ADD COLUMN `is_correct` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `corrected_hanzi` VARCHAR(500) NULL,
    ADD COLUMN `error_explanation` TEXT NULL,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX `grammar_examples_grammar_id_hanzi_key` ON `grammar_examples`(`grammar_id`, `hanzi`);
CREATE INDEX `grammar_examples_grammar_id_sort_order_idx` ON `grammar_examples`(`grammar_id`, `sort_order`);

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `parent_id` INTEGER NULL,
    `icon` VARCHAR(32) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parent_id_sort_order_idx`(`parent_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `word_categories` (
    `word_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `word_categories_category_id_idx`(`category_id`),
    PRIMARY KEY (`word_id`, `category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grammar_relations` (
    `grammar_id` INTEGER NOT NULL,
    `related_id` INTEGER NOT NULL,

    INDEX `grammar_relations_related_id_idx`(`related_id`),
    PRIMARY KEY (`grammar_id`, `related_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grammar_words` (
    `grammar_id` INTEGER NOT NULL,
    `word_id` INTEGER NOT NULL,

    INDEX `grammar_words_word_id_idx`(`word_id`),
    PRIMARY KEY (`grammar_id`, `word_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grammar_progress` (
    `user_id` INTEGER NOT NULL,
    `grammar_id` INTEGER NOT NULL,
    `learned` BOOLEAN NOT NULL DEFAULT false,
    `favorite` BOOLEAN NOT NULL DEFAULT false,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `correct` INTEGER NOT NULL DEFAULT 0,
    `last_practiced` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `grammar_progress_grammar_id_idx`(`grammar_id`),
    PRIMARY KEY (`user_id`, `grammar_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grammar_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `grammar_id` INTEGER NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `correct` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `grammar_attempts_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `grammar_attempts_grammar_id_idx`(`grammar_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `word_categories` ADD CONSTRAINT `word_categories_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `word_categories` ADD CONSTRAINT `word_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_relations` ADD CONSTRAINT `grammar_relations_grammar_id_fkey` FOREIGN KEY (`grammar_id`) REFERENCES `grammar_points`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_relations` ADD CONSTRAINT `grammar_relations_related_id_fkey` FOREIGN KEY (`related_id`) REFERENCES `grammar_points`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_words` ADD CONSTRAINT `grammar_words_grammar_id_fkey` FOREIGN KEY (`grammar_id`) REFERENCES `grammar_points`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_words` ADD CONSTRAINT `grammar_words_word_id_fkey` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_progress` ADD CONSTRAINT `grammar_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_progress` ADD CONSTRAINT `grammar_progress_grammar_id_fkey` FOREIGN KEY (`grammar_id`) REFERENCES `grammar_points`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_attempts` ADD CONSTRAINT `grammar_attempts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `grammar_attempts` ADD CONSTRAINT `grammar_attempts_grammar_id_fkey` FOREIGN KEY (`grammar_id`) REFERENCES `grammar_points`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
