# 환경 변수 설정 완료 가이드

## ✅ .env.local 파일 생성 완료

파일 위치: `c:\Users\PC2301\Desktop\aimen\.env.local`

---

## 🔧 다음 단계: API 키 입력

### 1. 텍스트 에디터로 `.env.local` 파일 열기

**VS Code 사용:**

```bash
code .env.local
```

**또는 메모장 사용:**

```bash
notepad .env.local
```

### 2. API 키 값 입력

파일을 열고 다음 값들을 실제 키로 교체하세요:

#### 필수 항목

```env
# 1. Google Gemini (Google AI Studio에서 복사)
GOOGLE_GEMINI_API_KEY=실제_gemini_api_키_입력

# 2. Kakao OAuth (Kakao Developers에서 복사)
KAKAO_CLIENT_ID=실제_rest_api_키_입력
KAKAO_CLIENT_SECRET=실제_client_secret_입력

# 3. NextAuth Secret (랜덤 문자열 생성)
NEXTAUTH_SECRET=aimen2026secretkey_최소32자이상_랜덤문자열

# 4. 데이터베이스 (아래 선택)
DATABASE_URL="postgresql://postgres:password@localhost:5432/aimen?schema=public"
```

#### 선택 항목 (나중에 추가 가능)

```env
# PortOne (결제 기능 필요 시)
NEXT_PUBLIC_PORTONE_STORE_ID=
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=
PORTONE_API_SECRET=

# Supabase (Supabase 사용 시)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. NEXTAUTH_SECRET 생성 방법

**옵션 A - OpenSSL 사용 (권장):**

```bash
openssl rand -base64 32
```

**옵션 B - 수동 입력:**

```
aimen2026secretkey_12345678901234567890
```

(32자 이상의 랜덤 문자열)

---

## 💾 데이터베이스 설정 (2가지 옵션)

### 옵션 1: 로컬 PostgreSQL 설치 (권장 - 완전 무료)

#### Windows PostgreSQL 설치

1. <https://www.postgresql.org/download/windows/> 접속
2. **Download the installer** 클릭
3. PostgreSQL 15 이상 다운로드 및 설치
4. 설치 시 비밀번호 설정 (예: `postgres`)
5. 포트: 기본값 `5432` 유지

#### 데이터베이스 생성

```bash
# PostgreSQL SQL Shell (psql) 실행 후
CREATE DATABASE aimen;
```

#### .env.local 설정

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/aimen?schema=public"
```

(your_password를 실제 비밀번호로 교체)

---

### 옵션 2: Supabase 사용 (클라우드 - 무료 티어)

#### Supabase 가입

1. <https://supabase.com/> 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인
4. **New project** 생성
   - Name: `aimen`
   - Database Password: 설정
   - Region: `Northeast Asia (Seoul)` 선택

#### 연결 정보 복사

1. Project 설정 > Database 메뉴
2. **Connection string** > **URI** 복사
3. `.env.local`에 붙여넣기

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

## 🚀 다음 단계: 데이터베이스 초기화

환경 변수 설정이 완료되면 다음 명령어를 실행하세요:

```bash
# 1. Prisma 클라이언트 생성
npx prisma generate

# 2. 데이터베이스 마이그레이션 (테이블 생성)
npx prisma migrate dev --name init

# 3. Prisma Studio로 확인 (선택)
npx prisma studio
```

---

## ✅ 체크리스트

- [ ] `.env.local` 파일 열기
- [ ] Google Gemini API 키 입력
- [ ] Kakao REST API 키 입력
- [ ] Kakao Client Secret 입력
- [ ] NEXTAUTH_SECRET 생성 및 입력
- [ ] 데이터베이스 선택 (PostgreSQL 또는 Supabase)
- [ ] DATABASE_URL 설정
- [ ] 파일 저장
- [ ] `npx prisma generate` 실행
- [ ] `npx prisma migrate dev` 실행

---

준비가 되면 알려주세요! 데이터베이스 설정을 도와드리겠습니다.
