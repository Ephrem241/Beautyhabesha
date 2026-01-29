-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "escortId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "mode" "BookingMode" NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availabilities_escortId_idx" ON "availabilities"("escortId");

-- CreateIndex
CREATE INDEX "availabilities_escortId_date_idx" ON "availabilities"("escortId", "date");

-- CreateIndex
CREATE INDEX "availabilities_date_idx" ON "availabilities"("date");

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_escortId_fkey" FOREIGN KEY ("escortId") REFERENCES "escort_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
