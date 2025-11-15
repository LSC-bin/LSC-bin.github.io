# 리팩터링 가이드

## 완료된 작업

### 1. 프로젝트 구조 ✅
- Vite + React + TypeScript 설정
- 모듈화된 디렉토리 구조
- 경로 별칭 설정

### 2. 인증/세션 서비스 ✅
- `src/services/auth/` 모듈화
- localStorage 추상화 (`LocalAuthStorage`)
- 입력 검증 (`zod` 사용)
- 보안 강화 (sanitization)

### 3. CSS 모듈화 ✅
- 디자인 토큰 분리 (`src/styles/tokens/`)
- 범위 지정 스타일
- 유틸리티 클래스
- 컴포넌트별 CSS 모듈

## 다음 단계

### 4. React 컴포넌트 완성
- [ ] 모든 페이지 컴포넌트 마이그레이션
- [ ] 위젯 시스템 컴포넌트화
- [ ] 상태 관리 (Context API 또는 Zustand)

### 5. 접근성 강화
- [ ] 모든 인터랙티브 요소에 ARIA 레이블
- [ ] 키보드 네비게이션 완성
- [ ] 포커스 관리 개선
- [ ] 스크린 리더 테스트

### 6. 보안 및 성능
- [ ] 모든 동적 HTML sanitize
- [ ] 지연 로딩 구현
- [ ] CSP 헤더 설정
- [ ] 번들 최적화

### 7. 테스트
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 접근성 테스트

## 사용 방법

### 개발 서버 실행
```bash
npm install
npm run dev
```

### 빌드
```bash
npm run build
```

### 테스트
```bash
npm test
npm run test:e2e
```

## 마이그레이션 전략

기존 프로토타입과 새 구조를 병행 운영하면서 점진적으로 마이그레이션:

1. **Phase 1**: 새 구조로 로그인/인증만 마이그레이션
2. **Phase 2**: 주요 페이지 컴포넌트화
3. **Phase 3**: 위젯 시스템 리팩터링
4. **Phase 4**: 완전 전환 및 레거시 코드 제거

