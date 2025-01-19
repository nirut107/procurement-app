/*
  Warnings:

  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Stock`;

-- CreateTable
CREATE TABLE `Stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `productcode` VARCHAR(191) NOT NULL,
    `opccode` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `colorname` VARCHAR(191) NOT NULL,
    `searchstring` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `stockoh` INTEGER NOT NULL,
    `stockchina` INTEGER NOT NULL,

    UNIQUE INDEX `Stocks_productcode_key`(`productcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
