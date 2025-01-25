/*
  Warnings:

  - You are about to drop the column `month_year` on the `task` table. All the data in the column will be lost.
  - Added the required column `month` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `task` DROP COLUMN `month_year`,
    ADD COLUMN `month` VARCHAR(191) NOT NULL,
    ADD COLUMN `year` VARCHAR(191) NOT NULL;
