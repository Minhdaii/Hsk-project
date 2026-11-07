ALTER TABLE `users`
  ADD COLUMN `learning_experience` VARCHAR(24) NULL,
  ADD COLUMN `study_purpose` VARCHAR(24) NULL,
  ADD COLUMN `daily_study_minutes` SMALLINT UNSIGNED NULL;
