/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PLATFORM_ADMIN';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "packaging" TEXT,
ADD COLUMN     "supplierName" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "warehouseLocation" TEXT;

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "businessName",
ADD COLUMN     "activeSince" TIMESTAMP(3),
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "planCode" TEXT DEFAULT 'MVP_MONTHLY',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedReason" TEXT;
