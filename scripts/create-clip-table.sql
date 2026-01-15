-- Clip 테이블 생성
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS "Clip_highlightId_idx" ON "Clip"("highlightId");
CREATE INDEX IF NOT EXISTS "Clip_status_idx" ON "Clip"("status");

-- 외래키 제약 조건 추가 (Highlight 테이블이 이미 존재한다고 가정)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Clip_highlightId_fkey') THEN
        ALTER TABLE "Clip" ADD CONSTRAINT "Clip_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
