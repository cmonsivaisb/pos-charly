/*
  Warnings:

  - You are about to drop the column `tenantId` on the `CashRegisterSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CashRegisterSession" DROP CONSTRAINT "CashRegisterSession_tenantId_fkey";

-- AlterTable
ALTER TABLE "CashRegisterSession" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "catalogProductId" TEXT;

-- CreateTable
CREATE TABLE "CatalogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultImageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProduct" (
    "id" TEXT NOT NULL,
    "catalogCode" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" TEXT,
    "sizeValue" DOUBLE PRECISION,
    "sizeUnit" TEXT,
    "unit" TEXT NOT NULL,
    "barcode" TEXT,
    "tags" TEXT[],
    "synonyms" TEXT[],
    "ivaRate" DECIMAL(5,2) NOT NULL DEFAULT 0.16,
    "priceInputMode" "PriceInputMode" NOT NULL DEFAULT 'INCLUDES_TAX',
    "priceBase" DECIMAL(10,2) NOT NULL,
    "priceTotal" DECIMAL(10,2) NOT NULL,
    "imageKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogPack" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogPackItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "packId" TEXT NOT NULL,
    "catalogProductId" TEXT NOT NULL,

    CONSTRAINT "CatalogPackItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogCategory_slug_key" ON "CatalogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProduct_catalogCode_key" ON "CatalogProduct"("catalogCode");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogPack_code_key" ON "CatalogPack"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogPackItem_packId_catalogProductId_key" ON "CatalogPackItem"("packId", "catalogProductId");

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CatalogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogPackItem" ADD CONSTRAINT "CatalogPackItem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "CatalogPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogPackItem" ADD CONSTRAINT "CatalogPackItem_catalogProductId_fkey" FOREIGN KEY ("catalogProductId") REFERENCES "CatalogProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_catalogProductId_fkey" FOREIGN KEY ("catalogProductId") REFERENCES "CatalogProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
