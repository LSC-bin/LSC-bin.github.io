# 📁 프로젝트 구조

## 디렉토리 구조

```
education-dashboard/
│
├── src/                          # ✨ 새 React 앱 소스 코드
│   ├── components/              # React 컴포넌트
│   │   ├── common/              # 공통 컴포넌트
│   │   └── layout/              # 레이아웃 컴포넌트
│   ├── services/                # 비즈니스 로직
│   │   └── auth/                # 인증 서비스
│   ├── styles/                  # CSS 모듈
│   │   ├── tokens/              # 디자인 토큰
│   │   ├── base/                # 기본 스타일
│   │   └── components/          # 컴포넌트 스타일
│   ├── utils/                   # 유틸리티 함수
│   ├── types/                   # TypeScript 타입
│   └── pages/                   # 페이지 컴포넌트
│
├── prototype/                    # 📦 기존 프로토타입 파일들
│   ├── *.html                   # HTML 파일들
│   ├── *.js                     # JavaScript 파일들
│   └── *.css                    # CSS 파일들
│
├── docs/                        # 📚 문서
│   ├── REFACTORING_PLAN.md
│   ├── REFACTORING_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── MIGRATION_NOTES.md
│   └── ...
│
├── config/                      # ⚙️ 설정 파일들
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   └── .eslintrc.cjs
│
├── e2e/                         # 🧪 E2E 테스트
│   └── *.spec.ts
│
└── 루트 파일들
    ├── package.json
    ├── README.md
    ├── index-react.html         # React 앱 진입점
    └── PROJECT_STRUCTURE.md     # 이 파일
```

## 파일 설명

### src/
새로 리팩터링된 React 앱의 소스 코드입니다.

### prototype/
기존 프로토타입 파일들입니다. 현재 사용 중인 정적 HTML/CSS/JS 파일들이 여기에 있습니다.

### docs/
모든 문서 파일들입니다.

### config/
모든 설정 파일들입니다 (Vite, TypeScript, 테스트 등).

### e2e/
E2E 테스트 파일들입니다.

## 사용 방법

### 기존 프로토타입 사용
```bash
# prototype/index.html을 브라우저에서 열기
open prototype/index.html
```

### 새 React 앱 사용
```bash
npm install
npm run dev
```
