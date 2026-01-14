-- Add emailVerified column (missing from previous SQL!)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);

-- Verify it was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User' AND column_name = 'emailVerified';
