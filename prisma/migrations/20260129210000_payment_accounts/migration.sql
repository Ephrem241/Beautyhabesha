-- CreateTable
CREATE TABLE "payment_accounts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "provider" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_accounts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payment_accounts_isActive_displayOrder_idx" ON "payment_accounts"("isActive", "displayOrder");

-- Seed initial payment accounts
INSERT INTO "payment_accounts" ("id", "type", "accountName", "accountNumber", "provider", "displayOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('pa_bank_001', 'bank', 'Beautyhabesha', '1000510638798', NULL, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pa_telebirr_001', 'mobile_money', 'Beautyhabesha', '0912 696 090', 'TeleBirr', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
