# aimen (에이아이멘) - AI 기반 설교 콘텐츠 자동화 솔루션

**"주일의 은혜를 평일의 일상으로"**

Google Gemini AI로 설교 영상에서 영적 하이라이트를 자동 추출하고, FFmpeg.wasm으로 브라우저에서 즉시 숏폼 영상으로 편집하는 SaaS 플랫폼입니다.

## 🌟 주요 기능

### 1. 🤖 AI 하이라이트 추출

- **Gemini 1.5 Pro** 기반 설교 분석
- 40분 설교에서 영적 감동이 담긴 **핵심 구간 3곳** 자동 선정
- 각 하이라이트는 30~60초 길이로 최적화
- SNS 캡션 및 성경 구절 자동 생성
- 메신저 공유용 3줄 요약 제공

### 2. ⚡ 클라이언트 사이드 영상 편집

- **FFmpeg.wasm** 기반 브라우저 내 편집
- 서버 업로드 없이 개인정보 보호
- 워터마크 자동 삽입
- SNS 최적화 영상 인코딩

### 3. 📱 SNS 즉시 공유

- 인스타그램 릴스
- 유튜브 쇼츠
- 틱톡
- 카카오톡

### 4. 🔐 인증 및 승인 시스템

- 카카오 OAuth 간편 로그인
- 관리자 승인 기반 사용자 관리
- 구독 플랜 관리 (Free/Pro)

### 5. 💳 구독 결제

- PortOne (구 아임포트) 연동
- 월간 정기 결제
- 결제 내역 관리

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS (Navy & Gold 테마)
- **AI**: Google Gemini 1.5 Pro API
- **Video Processing**: FFmpeg.wasm (Multithreading)
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js + Kakao OAuth
- **Payment**: PortOne API
- **Storage**: Supabase (선택적)
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 저장소 클론 및 의존성 설치

\`\`\`bash
cd aimen
npm install
\`\`\`

### 2. 환경 변수 설정

\`env.example.txt\` 파일을 참고하여 \`.env.local\` 파일을 생성하고 아래 값들을 설정하세요:

\`\`\`env

# Google Gemini AI

GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Kakao OAuth

KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here

# NextAuth

NEXTAUTH_URL=<http://localhost:3000>
NEXTAUTH_SECRET=your_nextauth_secret_here

# PortOne (Payment)

NEXT_PUBLIC_PORTONE_STORE_ID=your_portone_store_id_here
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your_portone_channel_key_here
PORTONE_API_SECRET=your_portone_api_secret_here

# Database

DATABASE_URL="postgresql://user:password@localhost:5432/aimen?schema=public"
\`\`\`

### 3. 데이터베이스 설정

\`\`\`bash

# Prisma 클라이언트 생성

npx prisma generate

# 데이터베이스 마이그레이션

npx prisma migrate dev --name init

# Prisma Studio로 데이터 확인 (선택)

npx prisma studio
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📁 프로젝트 구조

\`\`\`
aimen/
├── app/                          # Next.js App Router 페이지
│   ├── api/                      # API Routes
│   │   ├── analyze/             # Gemini AI 분석 API
│   │   ├── auth/                # NextAuth API
│   │   ├── admin/               # 관리자 API
│   │   └── payment/             # 결제 API
│   ├── dashboard/               # 사용자 대시보드
│   ├── editor/[videoId]/        # 영상 편집 페이지
│   ├── admin/                   # 관리자 대시보드
│   ├── layout.tsx               # 루트 레이아웃
│   └── page.tsx                 # 랜딩 페이지
├── src/
│   ├── app/                     # 추가 앱 페이지
│   ├── components/              # React 컴포넌트
│   │   ├── ui/                  # UI 컴포넌트
│   │   └── VideoEditor.tsx      # 영상 편집 컴포넌트
│   ├── lib/                     # 유틸리티 및 라이브러리
│   │   ├── gemini/             # Gemini AI 클라이언트
│   │   ├── ffmpeg/             # FFmpeg.wasm 로더 및 편집기
│   │   ├── supabase/           # Supabase 클라이언트
│   │   └── prisma.ts           # Prisma 클라이언트
│   └── types/                   # TypeScript 타입 정의
├── prisma/
│   └── schema.prisma            # 데이터베이스 스키마
├── tailwind.config.ts           # Tailwind 설정 (Navy & Gold 테마)
└── next.config.ts               # Next.js 설정 (FFmpeg 헤더)
\`\`\`

## 🎨 디자인 시스템

### Navy & Gold 테마

- **Primary Navy**: #0A192F
- **Navy Light**: #112240
- **Gold**: #D4AF37
- **Gold Light**: #E5C878

### 주요 컴포넌트

- \`Button\`: 4가지 variant (primary, secondary, outline, danger)
- \`Card\`: Glassmorphism 효과
- \`ProgressBar\`: 영상 처리 진행률 표시

## 🔑 API 키 발급

### 1. Google Gemini API

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 생성
3. \`.env.local\`에 \`GOOGLE_GEMINI_API_KEY\` 설정

### 2. Kakao OAuth

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. 플랫폼 설정: Web (<http://localhost:3000>)
4. Redirect URI: <http://localhost:3000/api/auth/callback/kakao>
5. REST API 키와 Client Secret 발급
6. \`.env.local\`에 \`KAKAO_CLIENT_ID\`, \`KAKAO_CLIENT_SECRET\` 설정

### 3. Supabase (선택적)

1. [Supabase](https://supabase.com/) 프로젝트 생성
2. Project URL과 Anon Key 복사
3. \`.env.local\`에 설정

### 4. PortOne (Payment)

1. [PortOne](https://portone.io/) 가입
2. 상점 생성 및 채널 설정
3. API 키 발급
4. \`.env.local\`에 설정

## 🚀 배포

### Vercel 배포

\`\`\`bash

# Vercel CLI 설치

npm i -g vercel

# 배포

vercel
\`\`\`

또는 [Vercel Dashboard](https://vercel.com/)에서 GitHub 저장소 연결

### 환경 변수 설정

Vercel 프로젝트 설정에서 모든 환경 변수를 추가하세요.

### COOP/COEP 헤더

FFmpeg.wasm을 위한 헤더는 \`next.config.ts\`에 이미 설정되어 있습니다.

## 📋 사용 워크플로우

1. **카카오 로그인**
2. **관리자 승인 대기** (자동 이메일 알림)
3. **대시보드에서 설교 영상 업로드** 또는 스크립트 입력
4. **AI 분석 대기** (약 30초)
5. **하이라이트 3개 확인 및 선택**
6. **브라우저에서 편집 및 워터마크 추가**
7. **다운로드 또는 SNS 공유**

## 🔧 문제 해결

### FFmpeg.wasm SharedArrayBuffer 오류

- Chrome 개발자 도구 → Application → Cookies 확인
- HTTPS 또는 localhost에서만 작동
- \`next.config.ts\`의 헤더 설정 확인

### Prisma 클라이언트 오류

\`\`\`bash
npx prisma generate
\`\`\`

### NextAuth 세션 오류

- \`NEXTAUTH_SECRET\` 환경 변수 확인
- \`NEXTAUTH_URL\`이 현재 도메인과 일치하는지 확인

## 📄 라이선스

MIT License

## 👤 Author

aimen Team

## 📧 문의

<support@aimen.com>

---

**"주일의 은혜를 평일의 일상으로"** ✨
