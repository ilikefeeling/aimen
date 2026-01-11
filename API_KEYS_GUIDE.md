# API Keys Setup Guide for aimen

## ✅ 1. Google Gemini API Key - 완료

**상태:** 이미 발급됨
**키 이름:** AI-men
**생성일:** 2026. 1. 9.

### 사용 방법

1. Google AI Studio (<https://aistudio.google.com/app/api-keys)에서> "AI-men" 키 확인
2. 키 값을 복사하여 `.env.local` 파일에 추가

---

## 🔑 2. Kakao OAuth 설정 (필수)

### Kakao Developers Console 접속

1. <https://developers.kakao.com/> 접속
2. 로그인 (카카오 계정 필요)
3. **내 애플리케이션** 클릭

### 새 애플리케이션 생성

1. **애플리케이션 추가하기** 클릭
2. 앱 이름: `aimen` (또는 원하는 이름)
3. 회사명: 선택사항
4. **저장** 클릭

### 앱 설정

1. 생성된 앱 선택
2. **앱 키** 탭에서:
   - **REST API 키** 복사 → 이것이 `KAKAO_CLIENT_ID`
   - **JavaScript 키** 복사 (보조용)

### Client Secret 발급

1. 왼쪽 메뉴에서 **제품 설정 > 카카오 로그인** 선택
2. **Kakao 로그인 활성화** → ON
3. **보안** 탭으로 이동
4. **Client Secret 발급** 클릭
5. 코드 발급 후 **활성화** 상태로 변경
6. Client Secret 값 복사 → 이것이 `KAKAO_CLIENT_SECRET`

### Redirect URI 설정

1. **제품 설정 > 카카오 로그인** 메뉴
2. **Redirect URI** 섹션에서 **Redirect URI 등록** 클릭
3. 개발 환경:

   ```
   http://localhost:3000/api/auth/callback/kakao
   ```

4. 프로덕션 환경 (배포 후):

   ```
   https://yourdomain.com/api/auth/callback/kakao
   ```

---

## 💳 3. PortOne (구 아임포트) 설정 (선택사항)

### 회원가입 및 로그인

1. <https://portone.io/> 접속
2. **시작하기** 또는 **로그인** 클릭
3. 이메일로 회원가입

### 상점 생성

1. 대시보드에서 **새 프로젝트 만들기** 클릭
2. 프로젝트명: `aimen`
3. 환경: **테스트 모드** 선택 (개발 시)

### API 키 발급

1. **설정** > **시스템 설정** > **내 식별코드·API Keys** 메뉴
2. 다음 값들을 복사:
   - **가맹점 식별코드** → `NEXT_PUBLIC_PORTONE_STORE_ID`
   - **REST API Key** → `PORTONE_API_SECRET`
   - **채널 키** → `NEXT_PUBLIC_PORTONE_CHANNEL_KEY`

### PG 설정 (실제 결제 시)

1. **결제연동** > **PG 설정** 메뉴
2. 원하는 PG사 선택:
   - **토스페이먼츠** (추천)
   - **KG이니시스**
   - **나이스페이먼츠**
3. PG사 계약 후 정보 입력

> **Note**: 개발 단계에서는 테스트 모드로 충분합니다. 실제 결제는 나중에 설정 가능합니다.

---

## 📝 체크리스트

- [x] Google Gemini API 키 발급 (AI-men)
- [ ] Kakao REST API 키 발급
- [ ] Kakao Client Secret 발급
- [ ] Kakao Redirect URI 등록
- [ ] PortOne 프로젝트 생성 (선택)
- [ ] PortOne API 키 발급 (선택)

---

## ⚠️ 주의사항

1. **API 키는 절대 GitHub에 커밋하지 마세요!**
   - `.env.local` 파일은 `.gitignore`에 포함됨

2. **Kakao는 필수, PortOne은 선택사항**
   - 결제 기능 없이도 나머지 기능 사용 가능

3. **프로덕션 배포 시**
   - Kakao Redirect URI에 실제 도메인 추가
   - Vercel 환경 변수에 모든 키 등록
   - PortOne을 실제 모드로 전환

---

다음 단계: `.env.local` 파일 생성
