-- Create Clip table
CREATE TABLE IF NOT EXISTS "Clip" (
    "id" TEXT NOT NULL,
    "highlightId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "resolution" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to Highlight
ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
ALTER TABLE "Highlight" ADD COLUMN IF NOT EXISTS "emotion" TEXT;

-- Add churchName to Sermon if missing
ALTER TABLE "Sermon" ADD COLUMN IF NOT EXISTS "churchName" TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Clip_highlightId_idx" ON "Clip"("highlightId");
CREATE INDEX IF NOT EXISTS "Clip_status_idx" ON "Clip"("status");

-- Add foreign key for Clip
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Clip_highlightId_fkey') THEN
        ALTER TABLE "Clip" ADD CONSTRAINT "Clip_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
