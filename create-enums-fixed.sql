-- Step 1: Create ENUM types
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "public"."Status" AS ENUM ('PENDING', 'ACTIVE');
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PRO');

-- Step 2: Remove default values first
ALTER TABLE "User" 
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "plan" DROP DEFAULT;

-- Step 3: Convert columns to ENUM types
ALTER TABLE "User" 
  ALTER COLUMN "role" TYPE "public"."Role" USING "role"::text::"public"."Role",
  ALTER COLUMN "status" TYPE "public"."Status" USING "status"::text::"public"."Status",
  ALTER COLUMN "plan" TYPE "public"."Plan" USING "plan"::text::"public"."Plan";

-- Step 4: Set defaults back
ALTER TABLE "User" 
  ALTER COLUMN "role" SET DEFAULT 'USER'::"public"."Role",
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."Status",
  ALTER COLUMN "plan" SET DEFAULT 'FREE'::"public"."Plan";

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User' AND column_name IN ('role', 'status', 'plan');
