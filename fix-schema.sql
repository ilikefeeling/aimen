-- 직접 데이터베이스에 platform 컬럼 추가
ALTER TABLE "Highlight" 
ADD COLUMN IF NOT EXISTS "platform" TEXT;

-- 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Highlight';
