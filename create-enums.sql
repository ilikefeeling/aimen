-- Create ENUM types for User table
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'ACTIVE');
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PRO');

-- Alter User table columns to use ENUM types
ALTER TABLE "User" 
  ALTER COLUMN "role" TYPE "public"."Role" USING "role"::text::"public"."Role",
  ALTER COLUMN "status" TYPE "public"."Status" USING "status"::text::"public"."Status",
  ALTER COLUMN "plan" TYPE "public"."Plan" USING "plan"::text::"public"."Plan";

-- Set defaults
ALTER TABLE "User" 
  ALTER COLUMN "role" SET DEFAULT 'USER',
  ALTER COLUMN "status" SET DEFAULT 'PENDING',
  ALTER COLUMN "plan" SET DEFAULT 'FREE';

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User' AND column_name IN ('role', 'status', 'plan');
