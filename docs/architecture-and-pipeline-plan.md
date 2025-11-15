## SPA 아키텍처 및 개발 파이프라인 설계안

### 1. 목표
- 단일 HTML/JS 기반 구조를 컴포넌트 중심 SPA로 재구성해 유지보수성과 확장성을 확보합니다.
- 교사용 커스터마이징 및 역할 기반 기능 확장을 고려한 모듈형 설계를 확립합니다.
- 빌드, 린트, 테스트, 배포 자동화를 통해 안정적인 릴리즈 파이프라인을 마련합니다.

### 2. 기술 스택 제안
- **프레임워크**: React 18 + TypeScript  
  - 대규모 컴포넌트 생태계와 풍부한 상태 관리/테스트 도구.
- **번들러**: Vite  
  - 빠른 개발 서버와 간결한 설정, React/TypeScript 템플릿 제공.
- **상태 관리**: Zustand (글로벌 상태) + React Query (서버 상태)  
  - 단순하고 컴포저블한 스토어, Firestore 연동 시 캐싱/비동기 상태 관리 수월.
- **라우팅**: React Router v7  
  - 교사/학생 뷰 분리, 클래스/세션/액티비티 등 URL 구조화.
- **UI**: Tailwind CSS + Headless UI (또는 Chakra UI)  
  - 빠른 스타일링과 접근성 지원. 디자인 시스템 확장 용이.
- **아이콘**: React Icons (Boxicons 포함)  
  - 기존 디자인과의 시각적 일관성 유지.

### 3. 프로젝트 구조 (초안)
```
education-dashboard/
├── apps/
│   └── web/                # React SPA
│       ├── src/
│       │   ├── app/        # 라우팅, 레이아웃, 전역 상태 초기화
│       │   ├── components/ # 공통 UI
│       │   ├── features/   # 도메인별 모듈 (dashboard, activity, ask 등)
│       │   ├── hooks/
│       │   ├── pages/      # 라우트 컴포넌트
│       │   ├── services/   # API/Firebase 래퍼
│       │   ├── stores/     # Zustand 스토어
│       │   └── utils/
│       ├── public/
│       └── vite.config.ts
├── packages/
│   └── ui/ (선택)          # 재사용 컴포넌트 라이브러리 (향후 확장)
├── firebase/               # Firebase 설정, 보안 규칙, 함수
└── package.json
```

### 4. 라우팅 & 레이아웃
- `/login`, `/signup` 등 인증 라우트.
- `/teacher/*`: 교사 전용 대시보드 (클래스 관리, 커스터마이징, 분석).
- `/teacher/class/:classId/session/:sessionId`: 수업 세션 뷰.
- `/student/*`: 학생 전용 대시보드 및 참여 화면.
- 공통 레이아웃(`AppShell`)으로 사이드바, 헤더, 알림 영역 관리.

### 5. 상태 관리 전략
- **Zustand 스토어**: 인증 상태, 사용자 정보, UI 상태(사이드바, 모달), 선택된 클래스/세션.
- **React Query**: Firestore/Cloud Functions에서 가져오는 서버 상태 (세션, 질문, 게시글, 자료).  
  - Optimistic update, 리페치, 캐시 전략 정의.
- **권한 관리**: `PermissionContext` 혹은 커스텀 훅(`usePermission`)으로 RBAC 정책 적용.

### 6. API/서비스 계층
- `services/firebase`에 Firestore, Storage, Auth 인스턴스 래핑.
- `services/api` 폴더에 컬렉션별 CRUD 함수 (`sessionsService`, `activityService`, `askService` 등).
- 공통 에러 처리 유틸 (`handleFirestoreError`).
- 데이터 모델은 TypeScript 인터페이스/타입으로 정의 (`Session`, `ActivityPost`, `Question`, `Material`, `Role` 등).

### 7. 디자인 시스템
- Tailwind CSS 테마 커스터마이징 (`tailwind.config.js`)으로 브랜드 컬러/폰트 설정.
- 컴포넌트 카탈로그 구축 (Storybook 도입 고려).
- Atomic Design 분류: atoms, molecules, organisms, templates, pages.
- 다크 모드 지원은 Tailwind `dark:` 클래스와 Zustand 상태 연동.

### 8. 개발 파이프라인
- **패키지 매니저**: 현재 `apps/web`은 npm 기반으로 설치(`npm install`).
  - 향후 멀티 패키지 운영을 고려하면 pnpm workspace 전환을 검토할 수 있다.
- **스크립트 현황 (`apps/web/package.json`)**:
  - `npm run dev`: Vite 개발 서버
  - `npm run build`: `tsc -b && vite build` (타입체크 + 프로덕션 빌드)
  - `npm run lint`: ESLint
  - `npm run format`: Prettier
  - `npm run preview`: Vite 프리뷰 서버
  - `npm run emulator`: Firestore Emulator 실행
  - `npm run seed:firestore`: 에뮬레이터에 데모 데이터 주입
- **ESLint/Prettier**: `eslint.config.js`, `.prettierrc`로 React + TS + Tailwind 규칙을 적용.
- **Stylelint**: 미도입 (필요 시 Tailwind 플러그인과 함께 추가 검토).
- **Husky + lint-staged**: 아직 미설정. 향후 커밋 전 자동 검사로 확장 가능.
- **Commit 규칙**: Conventional Commits 도입 검토 중 (현재는 비적용).

### 9. 테스트 전략
- **Unit**: Vitest + React Testing Library (컴포넌트/훅) *(예정)*.
- **Integration**: Vitest로 Zustand/React Query 흐름 테스트 *(예정)*.
- **E2E**: Playwright 또는 Cypress로 교사/학생 핵심 시나리오 자동화 *(예정)*.
- **CI**: GitHub Actions
  - Job 1: 설치 & 린트 & 유닛 테스트
  - Job 2: 빌드
  - Job 3: E2E (선택적으로 PR 머지 전 실행)

### 10. 배포 전략
- Firebase Hosting 또는 Vercel로 SPA 배포.
- 환경변수(`.env`) 관리: Firebase 키, OpenAI 키, API 엔드포인트.
- CI/CD 파이프라인에서 `main` 브랜치 머지 시 자동 배포.
- 프리뷰 배포: Pull Request마다 Vercel/Netlify 프리뷰 URL 제공.

### 11. 마이그레이션 로드맵 (요약)
1. Vite + React + TS 템플릿으로 `apps/web` 초기화. *(완료)*
2. Tailwind/ESLint/Prettier 설정. *(완료)*
3. 기존 HTML/CSS 레이아웃을 컴포넌트로 분해 (`AppShell`, `Landing`, `Teacher`, `Student`). *(진행됨)*
4. Zustand/React Query 스토어 기본 구조 세팅, Firestore 에뮬레이터 read-only 연동. *(완료)*
5. 기존 `localStorage` 의존 로직을 서비스 계층 + Firestore 호출로 전환. *(읽기 전용까지 진행, 쓰기/뮤테이션 예정)*
6. 교사용/학생용 라우팅 분기, RBAC 가드 적용. *(라우팅 분기 완료, RBAC 예정)*
7. 테스트 코드와 스토리북 추가, CI 파이프라인 도입. *(예정)*
8. 추가 기능(커스터마이징, 20+ 액티비티) 모듈화 및 배포 자동화. *(예정)*

위 계획을 기반으로 실 구현을 진행하면 단계별로 구조 전환과 파이프라인 구축을 체계적으로 완료할 수 있습니다.

