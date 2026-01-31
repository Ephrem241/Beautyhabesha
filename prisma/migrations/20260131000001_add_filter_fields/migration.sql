-- AlterTable
ALTER TABLE "escort_profiles" ADD COLUMN "price" INTEGER;
ALTER TABLE "escort_profiles" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;
