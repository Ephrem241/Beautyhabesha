-- Update Telebirr payment account number to 0912 696 090
UPDATE "payment_accounts"
SET "accountNumber" = '0912 696 090', "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'pa_telebirr_001';
