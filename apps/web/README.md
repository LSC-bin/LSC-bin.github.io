# ClassBoard Next Web

React + Vite 기반의 SPA 스켈레톤으로, 교사/학생 역할에 따라 커스터마이징 가능한 수업 플랫폼을 구축하기 위한 실험용 베이스입니다.

## 기술 스택

- **React 19 + Vite 7 + TypeScript 5**
- **Tailwind CSS 3** (커스텀 테마 토큰, 다크 모드)
- **React Router 7** (페이지 라우팅)
- **Zustand**: UI/인증 스토어 (`useUIStore`, `useAuthStore`)
- **React Query (@tanstack/react-query)**: 데이터 fetching & 캐시 관리
- **Firebase SDK**: Firestore/Storage/Auth 초기화 래퍼

## 프로젝트 구조

```
apps/web/
├── src/
│   ├── components/
│   │   └── layout/AppShell.tsx     # 공통 레이아웃 (헤더/모바일 내비/토스트 포함)
│   ├── config/
│   │   ├── env.ts                  # 환경 변수 검증 (zod)
│   │   └── firebase.ts             # Firebase 설정 매핑
│   ├── hooks/                      # React Query 기반 데이터 훅
│   ├── lib/firebase/               # Firebase 앱/Auth/Firestore/Storage 래퍼
│   ├── pages/                      # Landing/Teacher/Student UI
│   ├── providers/                  # Query Client Provider 설정
│   ├── services/                   # Firestore 연동 전에 사용하는 서비스 스텁
│   ├── stores/                     # Zustand 스토어
│   ├── types/                      # Classroom/Session/Activity 도메인 타입
│   └── App.tsx                     # 라우터/레이아웃 연결부
├── public/
│   └── vite.svg
├── index.html
├── package.json
└── tailwind.config.js
```

## 환경 변수

아래 키를 `.env` 또는 `.env.local`에 정의하세요. (루트 README에 예시 값이 포함되어 있습니다.)

```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=education-dashboard-local
VITE_FIREBASE_STORAGE_BUCKET=education-dashboard-local.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-your-measurement-id
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

`src/config/env.ts`가 `zod`를 이용해 위 값을 검증합니다. `FIRESTORE_EMULATOR_HOST`는 스크립트에서 자동 설정되지만, 필요 시 주석을 해제하여 고정할 수 있습니다.

## 주요 설정

- Tailwind 테마 확장 (`tailwind.config.js`): `brand`, `surface` 컬러 및 폰트 토큰 정의
- ESLint + Prettier + Tailwind 플러그인 (`eslint.config.js`, `.prettierrc`)
- `AppShell`에서 `useUIStore`로 다크/라이트 모드 전환 및 모바일 사이드바 상태 처리
- React Query 클라이언트는 `AppProviders`에서 초기화 (`src/providers/app-providers.tsx`)

## 실행 방법

1. 의존성 설치

   ```bash
   cd apps/web
   npm install
   ```

2. Firestore 에뮬레이터 실행 (새 터미널에서)

   ```bash
   npm run emulator
   ```

   - 최초 실행 시 UI 패키지를 다운로드합니다.
   - 에뮬레이터 UI: <http://127.0.0.1:4000>
   - Firestore 엔드포인트: `127.0.0.1:8080`

3. 시드 데이터 주입 (선택)

   ```bash
   npm run seed:firestore
   ```

   - `scripts/seed-firestore.ts`가 기본 클래스/세션/활동 데이터를 삽입합니다.
   - 이미 동일 ID의 데이터가 있으면 덮어씁니다.

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

   - 애플리케이션이 자동으로 에뮬레이터와 통신하며, `FIRESTORE_EMULATOR_HOST` 환경 변수로 판단합니다.

Lint & 포맷:

```bash
npm run lint
npm run format
```

## Firestore Emulator 디버깅 팁

- 에뮬레이터 UI(<http://127.0.0.1:4000/firestore>)에서 문서를 직접 생성/수정할 수 있습니다.
- `npm run seed:firestore` 실행 후 데이터를 확인하거나, 필요 시 UI에서 추가로 편집하세요.
- 에뮬레이터 종료는 실행 중인 터미널에서 `Ctrl + C`.
- 실제 Firebase 프로젝트와 연결하려면 `FIRESTORE_EMULATOR_HOST`를 제거하고 `.env`에 실 운영 프로젝트 키를 입력한 뒤 다시 `npm run dev`를 실행합니다.

## 다음 단계

- `services/*`에 구현된 모킹 데이터를 Firestore 연동 코드로 교체
- Zustand `useAuthStore`와 Firebase Auth를 연결
- React Query 뮤테이션 훅과 optimistic update/suspense 도입
- UI 컴포넌트에 Skeleton/Placeholder 적용으로 로딩 경험 개선

자세한 설계 문서는 루트 `README.md`의 “추가 문서” 섹션을 참고하세요.
