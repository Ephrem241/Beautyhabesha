# Quick Fix for Migration Conflict

## The Problem
Prisma detected that migration `20260127200000_add_subscription_fields_and_email_support` was modified after it was applied.

## Solution (Run in PowerShell)

### Option 1: Use the Script (Easiest)
```powershell
cd "C:\Users\user pc\Desktop\habesha_scorts"
.\RESOLVE_MIGRATION.ps1
```

### Option 2: Manual Steps

**Step 1: Mark the migration as resolved**
```powershell
npx prisma migrate resolve --applied 20260127200000_add_subscription_fields_and_email_support
```

**Step 2: Create the new migration for images**
```powershell
npx prisma migrate dev --name update_escort_images_to_json
```

**Step 3: Generate Prisma Client**
```powershell
npx prisma generate
```

## What This Does

1. **Marks the existing migration as applied** - Tells Prisma the migration is already in the database
2. **Creates new migration** - Adds the migration to change `images` from `text[]` to `jsonb`
3. **Updates Prisma Client** - Regenerates types to match the new schema

## After This

You can then run:
```powershell
npm run build
```

## If You Still Get Errors

If the migration file already exists, you can manually apply it:

1. Go to Neon dashboard: https://console.neon.tech
2. Open SQL Editor
3. Copy the SQL from: `prisma/migrations/20260128000000_update_escort_images_to_json/migration.sql`
4. Run it
5. Then mark as applied:
   ```powershell
   npx prisma migrate resolve --applied 20260128000000_update_escort_images_to_json
   ```
