-- 현재 존재하는 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('User', 'Account', 'Session', 'VerificationToken')
ORDER BY table_name;
