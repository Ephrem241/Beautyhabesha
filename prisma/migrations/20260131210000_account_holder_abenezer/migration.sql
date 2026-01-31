-- Update account holder name to Abenezer z
UPDATE "payment_accounts"
SET "accountName" = 'Abenezer z', "updatedAt" = CURRENT_TIMESTAMP
WHERE "accountName" = 'Beautyhabesha';
