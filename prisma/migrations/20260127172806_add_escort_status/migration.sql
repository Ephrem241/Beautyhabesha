/*
  Warnings:

  - You are about to drop the column `isPublished` on the `escort_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EscortStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- DropIndex
DROP INDEX "escort_profiles_isPublished_createdAt_idx";

-- AlterTable
ALTER TABLE "escort_profiles" DROP COLUMN "isPublished",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "status" "EscortStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "escort_profiles_status_createdAt_idx" ON "escort_profiles"("status", "createdAt" DESC);
