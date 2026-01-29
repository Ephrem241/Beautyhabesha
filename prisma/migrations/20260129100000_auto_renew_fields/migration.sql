-- AlterTable
ALTER TABLE "users" ADD COLUMN "autoRenew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "renewalAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastRenewalAttempt" TIMESTAMP(3);
