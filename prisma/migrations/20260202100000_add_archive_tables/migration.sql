-- CreateTable
CREATE TABLE "message_archives" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_archives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_archives" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receiptUrl" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_archives_roomId_idx" ON "message_archives"("roomId");

-- CreateIndex
CREATE INDEX "message_archives_createdAt_idx" ON "message_archives"("createdAt");

-- CreateIndex
CREATE INDEX "payment_archives_userId_idx" ON "payment_archives"("userId");

-- CreateIndex
CREATE INDEX "payment_archives_createdAt_idx" ON "payment_archives"("createdAt");
