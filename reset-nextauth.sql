-- 1. 모든 NextAuth 테이블 완전 삭제
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
-- User 테이블은 Sermon과 연결되어 있으므로 조심스럽게 처리

-- 2. User 테이블 재생성 준비 - 기존 데이터 백업이 필요하다면:
-- SELECT * FROM "User"; -- 백업용

-- 3. User 테이블과 관련된 모든 것 삭제
DROP TABLE IF EXISTS "User" CASCADE;

-- 4. ENUM 타입도 삭제 (깔끔하게)
DROP TYPE IF EXISTS "public"."Role" CASCADE;
DROP TYPE IF EXISTS "public"."Status" CASCADE;
DROP TYPE IF EXISTS "public"."Plan" CASCADE;

-- 완료! 이제 Prisma db push로 자동 생성합니다.
