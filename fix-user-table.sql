-- Check User table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- Drop and recreate User table with correct structure
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "image" TEXT,
  "kakaoId" TEXT,
  "emailVerified" TIMESTAMP(3),
  "role" TEXT NOT NULL DEFAULT 'USER',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "plan" TEXT NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_kakaoId_key" ON "User"("kakaoId");

-- Recreate foreign keys for Account and Session
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
