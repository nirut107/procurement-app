-- CreateTable
CREATE TABLE `Stock` (
    `Version` VARCHAR(191) NOT NULL,
    `Brand` VARCHAR(191) NOT NULL,
    `Category` VARCHAR(191) NOT NULL,
    `ProductCode` VARCHAR(191) NOT NULL,
    `OPCCode` VARCHAR(191) NOT NULL,
    `Model` VARCHAR(191) NOT NULL,
    `Color` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `Stock` INTEGER NOT NULL DEFAULT 0,
    `Stock_china` INTEGER NOT NULL DEFAULT 0,
    `Productplan` INTEGER NOT NULL DEFAULT 0,
    `TotalSale2022` INTEGER NOT NULL DEFAULT 0,
    `TotalSale2023` INTEGER NOT NULL DEFAULT 0,
    `TotalSale2024` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Stock_Version_key`(`Version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
