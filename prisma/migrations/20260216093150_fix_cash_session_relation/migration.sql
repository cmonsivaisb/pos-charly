/*
  Warnings:

  - Added the required column `tenantId` to the `CashRegisterSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CashRegisterSession" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CashRegisterSession" ADD CONSTRAINT "CashRegisterSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
