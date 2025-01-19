-- CreateTable
CREATE TABLE `customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerCode` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `saleCode` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `customer_customerCode_key`(`customerCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
