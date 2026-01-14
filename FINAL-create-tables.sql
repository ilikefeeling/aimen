-- FINAL: Create all NextAuth tables matching Prisma schema EXACTLY

-- 1. Create ENUM types
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACTIVE');
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- 2. Create User table
CREATE TABLE "User" (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  image TEXT,
  "kakaoId" TEXT UNIQUE,
  "emailVerified" TIMESTAMP(3),
  role "Role" NOT NULL DEFAULT 'USER',
  status "Status" NOT NULL DEFAULT 'PENDING',
  plan "Plan" NOT NULL DEFAULT 'FREE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Account table
CREATE TABLE "Account" (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  refresh_token_expires_in INTEGER,
  
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId")
);

-- 4. Create Session table
CREATE TABLE "Session" (
  id TEXT NOT NULL PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  expires TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Create VerificationToken table
CREATE TABLE "VerificationToken" (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE (identifier, token)
);

-- 6. Create indexes
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- Verify creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('User', 'Account', 'Session', 'VerificationToken')
ORDER BY table_name;
