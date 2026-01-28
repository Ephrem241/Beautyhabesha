-- AlterTable
ALTER TABLE "users" ADD COLUMN "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN "subscriptionStatus" TEXT DEFAULT 'inactive';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_subscriptionEndDate_idx" ON "users"("subscriptionEndDate");

-- CreateIndex
CREATE INDEX "users_subscriptionStatus_idx" ON "users"("subscriptionStatus");
