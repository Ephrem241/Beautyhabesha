-- AlterTable: Change images column from text[] to jsonb
-- Convert existing text[] array to jsonb array format
-- Each string URL will be converted to {url: string, publicId: string} format

-- Step 1: Create a temporary column
ALTER TABLE "escort_profiles" ADD COLUMN "images_temp" jsonb DEFAULT '[]'::jsonb;

-- Step 2: Convert existing data
-- Convert each text array element to a jsonb object
UPDATE "escort_profiles" 
SET "images_temp" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', url_value,
      'publicId', 'legacy_' || COALESCE(
        substring(url_value from '/([^/]+)\.[^.]+$'),
        substring(url_value from '/([^/]+)$'),
        'unknown'
      )
    )
  )
  FROM unnest("images"::text[]) AS url_value
)
WHERE "images" IS NOT NULL AND array_length("images"::text[], 1) > 0;

-- Step 3: Drop old column and rename new one
ALTER TABLE "escort_profiles" DROP COLUMN "images";
ALTER TABLE "escort_profiles" RENAME COLUMN "images_temp" TO "images";

-- Step 4: Set default and make sure it's not null
ALTER TABLE "escort_profiles" 
ALTER COLUMN "images" SET DEFAULT '[]'::jsonb,
ALTER COLUMN "images" SET NOT NULL;
