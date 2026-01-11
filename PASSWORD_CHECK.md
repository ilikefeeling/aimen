# PostgreSQL 비밀번호 확인 가이드

## 현재 상황

`.env.local` 파일의 DATABASE_URL이 다음과 같이 설정되어 있습니다:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aimen?schema=public
```

이 설정은 PostgreSQL 비밀번호가 `postgres`라고 가정합니다.

---

## 🔍 PostgreSQL 비밀번호 확인 방법

### 방법 1: 이전 로그인 기억하기

- SQL Shell (psql) 또는 pgAdmin 실행 시 입력했던 비밀번호
- PostgreSQL 설치 시 설정했던 비밀번호

### 방법 2: pgAdmin에서 확인

1. pgAdmin 4 실행
2. 서버 연결 시도
3. 비밀번호 입력 프롬프트 확인
4. 성공적으로 연결된 비밀번호가 맞는 비밀번호

### 방법 3: 테스트로 확인

다음 명령어로 연결 테스트:

```powershell
# 비밀번호 postgres로 테스트
$env:PGPASSWORD='postgres'; psql -U postgres -c "\l"

# 연결 성공 시: 데이터베이스 목록 출력
# 연결 실패 시: password 인증 실패 메시지
```

---

## ✏️ 비밀번호가 다른 경우

`.env.local` 파일을 열고 DATABASE_URL을 수정하세요:

```env
# 비밀번호가 mypassword라면:
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/aimen?schema=public

# 비밀번호가 admin1234라면:
DATABASE_URL=postgresql://postgres:admin1234@localhost:5432/aimen?schema=public
```

**주의**: `postgres:` 다음에 오는 부분이 비밀번호입니다!

---

## 다음 단계

비밀번호 확인 후:

1. `.env.local` 파일 저장
2. Prisma 마이그레이션 실행:

   ```bash
   npx prisma migrate dev --name init
   ```
