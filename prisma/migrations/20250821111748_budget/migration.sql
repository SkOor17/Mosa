/*
  Warnings:

  - You are about to drop the column `maxAmount` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `percentage` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "maxAmount",
ADD COLUMN     "percentage" DECIMAL(12,2) NOT NULL;
