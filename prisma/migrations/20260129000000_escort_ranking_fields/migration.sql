-- AlterTable
ALTER TABLE "escort_profiles" ADD COLUMN "lastActiveAt" TIMESTAMP(3),
ADD COLUMN "rankingBoostUntil" TIMESTAMP(3),
ADD COLUMN "rankingSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "manualPlanId" TEXT;

-- CreateIndex
CREATE INDEX "escort_profiles_lastActiveAt_idx" ON "escort_profiles"("lastActiveAt" DESC);
