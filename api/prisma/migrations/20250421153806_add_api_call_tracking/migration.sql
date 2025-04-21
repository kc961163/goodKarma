-- AlterTable
ALTER TABLE `CoachingData` ADD COLUMN `adviceCallUsedThisMonth` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastAdviceCallDate` DATETIME(3) NULL,
    ADD COLUMN `lastProgressCallDate` DATETIME(3) NULL,
    ADD COLUMN `progressCallUsedThisMonth` BOOLEAN NOT NULL DEFAULT false;
