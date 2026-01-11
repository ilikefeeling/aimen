# 데이터베이스 연결 문제 해결 가이드

## 🔴 현재 상황

PostgreSQL 비밀번호 인증이 계속 실패하고 있습니다.

- PostgreSQL 서비스: ✅ 실행 중 (postgresql-x64-18)
- 포트: 5432
- 비밀번호: `sinmyung9!@#`
- 오류: password 인증 실패

---

## 🔧 해결 방법

### 옵션 1: pgAdmin에서 직접 마이그레이션 실행 (가장 쉬움) ⭐

1. **pgAdmin 4 실행**

2. **aimen 데이터베이스 선택**
   - 왼쪽 패널에서 `PostgreSQL 18` → `Databases` → `aimen` 클릭

3. **Query Tool 열기**
   - `aimen` 우클릭 → `Query Tool` 선택

4. **스키마 생성 SQL 실행**
   - 아래 SQL을 복사하여 붙여넣기
   - F5 또는 재생 버튼 클릭

```sql
-- Users 테이블
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    profile_image TEXT,
    provider TEXT DEFAULT 'kakao' NOT NULL,
    provider_id TEXT,
    subscription_status TEXT DEFAULT 'pending' NOT NULL,
    approval_status TEXT DEFAULT 'pending' NOT NULL,
    subscription_ends_at TIMESTAMP,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Videos 테이블
CREATE TABLE videos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_url TEXT,
    transcript TEXT,
    duration INTEGER,
    highlights JSONB,
    analysis_status TEXT DEFAULT 'pending' NOT NULL,
    analysis_error TEXT,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_videos_user_id ON videos(user_id);

-- Payments 테이블
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT,
    merchant_uid TEXT UNIQUE NOT NULL,
    imp_uid TEXT,
    pg_provider TEXT,
    subscription_plan TEXT NOT NULL,
    subscription_period TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_merchant_uid ON payments(merchant_uid);

-- Prisma Migrations 테이블 (Prisma 추적용)
CREATE TABLE _prisma_migrations (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    applied_steps_count INTEGER DEFAULT 0 NOT NULL
);

-- 초기 마이그레이션 기록
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'manual_migration',
    CURRENT_TIMESTAMP,
    '00000000000000_manual_init',
    1
);
```

1. **완료!**
   - 왼쪽 패널에서 `aimen` → `Schemas` → `public` → `Tables` 확인
   - users, videos, payments 테이블이 생성되어야 함

---

### 옵션 2: 비밀번호 재확인

비밀번호가 `sinmyung9!@#`이 **확실히 맞는지** 다시 확인해주세요.

**확인 방법:**

1. pgAdmin 4 실행
2. PostgreSQL 18 서버 클릭
3. 비밀번호 입력 프롬프트
4. 성공적으로 연결되는 비밀번호가 정확한 비밀번호

---

### 옵션 3: 비밀번호 재설정

비밀번호를 잊었다면 재설정하세요:

1. **서비스 중지**

   ```powershell
   net stop postgresql-x64-18
   ```

2. **pg_hba.conf 파일 수정** (관리자 권한)
   - 파일: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
   - 모든 `md5` → `trust`로 변경

3. **서비스 시작**

   ```powershell
   net start postgresql-x64-18
   ```

4. **비밀번호 변경**

   ```powershell
   psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"
   ```

5. **pg_hba.conf 원상복구** (`trust` → `md5`)

6. **서비스 재시작**

---

## 🎯 추천 방법

**옵션 1 (pgAdmin SQL 실행)**이 가장 쉽고 확실합니다!

완료 후 알려주시면 다음 단계로 진행하겠습니다.
