-- Add username (unique, optional) and age (optional)
ALTER TABLE "users" ADD COLUMN "username" TEXT;
ALTER TABLE "users" ADD COLUMN "age" INTEGER;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- Make email optional (keep unique for OAuth users)
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
