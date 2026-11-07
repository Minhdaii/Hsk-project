-- Additive account profile field. Existing accounts remain valid and retain all study data.
ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(191) NULL;
