# ClassBoard (React + Vite)

이 프로젝트는 기존 정적 HTML/JavaScript 기반 ClassBoard 대시보드를 React, TypeScript, Vite 스택으로 마이그레이션한 버전입니다. 라우트 기반 화면 전환과 컴포넌트 단위 UI 구성을 통해 유지보수성과 확장성을 강화했습니다.

## 개발 환경

- Node.js 18 이상
- npm 9 이상

## 주요 기능

- `Sidebar`, `Navbar`, `AnnouncementList` 등 UI 조각을 컴포넌트로 분리
- React Router를 이용한 `Dashboard`, `Activity`, `Ask` 라우팅
- `src/styles/tokens.css`에 디자인 토큰을 정리하여 전역 스타일 관리
- 다크 모드 토글 및 모바일 사이드바 토글 상태 관리를 React 훅으로 전환
- 기존 정적 자산은 `public/legacy` 폴더로 이동하여 보관

## 실행 방법

```bash
npm install
npm run dev
```

프로덕션 번들은 다음 명령으로 생성할 수 있습니다.

```bash
npm run build
```

## 레거시 자산

마이그레이션 이전 HTML/CSS/JS 파일은 `public/legacy` 폴더 아래에서 확인할 수 있습니다.
