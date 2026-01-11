# PostgreSQL 데이터베이스 설정 가이드

## ✅ PostgreSQL 18.1 설치 확인됨

---

## 🗄️ 데이터베이스 생성 방법 (3가지 옵션)

### 옵션 1: pgAdmin 사용 (가장 쉬움) ⭐ 추천

1. **pgAdmin 실행**
   - 시작 메뉴에서 `pgAdmin 4` 검색 및 실행

2. **PostgreSQL 서버 연결**
   - 왼쪽 패널에서 `PostgreSQL 18` 확장
   - 비밀번호 입력 (설치 시 설정한 비밀번호)

3. **데이터베이스 생성**
   - `Databases` 우클릭 → `Create` → `Database...`
   - Database name: `aimen`
   - Owner: `postgres` (기본값)
   - `Save` 클릭

4. **완료!**
   - 왼쪽 패널에 `aimen` 데이터베이스가 표시됨

---

### 옵션 2: SQL Shell (psql) 사용

1. **SQL Shell (psql) 실행**
   - 시작 메뉴에서 `SQL Shell (psql)` 검색

2. **연결 정보 입력**
   - Server: `localhost` (Enter)
   - Database: `postgres` (Enter)
   - Port: `5432` (Enter)
   - Username: `postgres` (Enter)
   - Password: [설치 시 설정한 비밀번호 입력]

3. **데이터베이스 생성**

   ```sql
   CREATE DATABASE aimen;
   \l
   ```

   (`\l` 명령으로 aimen이 생성되었는지 확인)

4. **종료**

   ```
   \q
   ```

---

### 옵션 3: PowerShell에서 직접 실행

```powershell
# 비밀번호를 환경 변수로 설정 (your_password를 실제 비밀번호로 교체)
$env:PGPASSWORD='your_actual_password'

# 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE aimen;"

# 확인
psql -U postgres -c "\l"
```

---

## 📝 .env.local 파일 업데이트

데이터베이스 생성 후 `.env.local` 파일에서 `DATABASE_URL`을 업데이트하세요:

### 기본 설정 (비밀번호가 'postgres'인 경우)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aimen?schema=public"
```

### 커스텀 비밀번호

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/aimen?schema=public"
```

**주의**: `YOUR_PASSWORD`를 실제 PostgreSQL 비밀번호로 교체하세요!

---

## 🔍 PostgreSQL 비밀번호 모르는 경우

### 비밀번호 재설정

1. **서비스 중지**

   ```powershell
   Stop-Service postgresql-x64-18
   ```

2. **pg_hba.conf 파일 수정**
   - 파일 위치: `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`
   - 메모장으로 열기 (관리자 권한)
   - `md5`를 `trust`로 변경

3. **서비스 시작**

   ```powershell
   Start-Service postgresql-x64-18
   ```

4. **비밀번호 변경**

   ```powershell
   psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"
   ```

5. **pg_hba.conf 원상복구** (`trust` → `md5`)

---

## ✅ 다음 단계

데이터베이스 생성이 완료되면:

1. `.env.local` 파일의 `DATABASE_URL` 업데이트
2. Prisma 마이그레이션 실행:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

---

어떤 방법으로 데이터베이스를 생성하시겠습니까?
