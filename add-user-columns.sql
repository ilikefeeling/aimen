-- Add missing columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "name" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "image" TEXT,
ADD COLUMN IF NOT EXISTS "kakaoId" TEXT;

-- Add unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email") WHERE "email" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "User_kakaoId_key" ON "User"("kakaoId") WHERE "kakaoId" IS NOT NULL;

-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;
