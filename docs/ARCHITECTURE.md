# AI ClassBoard 아키텍처 문서

## 개요
이 문서는 리팩터링된 AI ClassBoard의 아키텍처와 설계 결정을 설명합니다.

## 아키텍처 결정

### 1. 프론트엔드 스택
- **React 18**: 컴포넌트 기반 UI
- **TypeScript**: 타입 안정성
- **Vite**: 빠른 개발 서버 및 빌드
- **React Router**: 클라이언트 사이드 라우팅

### 2. 인증 아키텍처

#### 현재 구현 (임시)
- `LocalAuthService`: localStorage 기반 인증
- 추상화 레이어로 백엔드 통합 용이

#### 향후 개선
```typescript
// API 기반 인증으로 교체 예정
class ApiAuthService implements AuthService {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    // JWT 토큰 저장
    // 리프레시 토큰 처리
  }
}
```

### 3. 상태 관리

#### 현재
- React Context API (필요시)
- 로컬 상태 (useState)

#### 향후 고려사항
- 복잡한 전역 상태가 필요하면 Zustand 도입
- 서버 상태는 React Query 고려

### 4. 스타일링 전략

#### 디자인 토큰
- CSS 변수로 중앙 관리
- 다크 모드 지원
- 테마 확장 가능

#### 컴포넌트 스타일
- CSS 모듈 방식
- 범위 지정으로 스타일 충돌 방지
- 트리 셰이킹 가능

### 5. 보안 전략

#### 클라이언트 사이드
- ✅ HTML Sanitization (DOMPurify)
- ✅ 입력값 검증 (Zod)
- ✅ XSS 방지

#### 향후 개선
- API 키를 환경 변수로 관리
- HTTPS 강제
- CSP 헤더 서버에서 설정
- JWT 토큰 사용

### 6. 성능 최적화

#### 코드 스플리팅
- Vite 자동 코드 스플리팅
- React.lazy()로 컴포넌트 지연 로딩
- 라우트별 청크 분리

#### 리소스 최적화
- 이미지 지연 로딩
- 스크립트 비동기 로딩
- 번들 크기 최적화

### 7. 접근성 전략

#### ARIA
- 모든 인터랙티브 요소에 적절한 ARIA 속성
- 라이브 영역으로 동적 콘텐츠 알림

#### 키보드 네비게이션
- 모든 기능 키보드로 접근 가능
- 포커스 관리 (트랩, 복원)
- Skip link 제공

#### 시각적 피드백
- `:focus-visible`로 키보드 포커스 표시
- 충분한 색상 대비
- 의미론적 HTML 마크업

## 데이터 흐름

```
User Action
  ↓
Component Event Handler
  ↓
Service Layer (authService, etc.)
  ↓
Storage/API
  ↓
State Update
  ↓
UI Re-render
```

## 모듈 구조

### Services
비즈니스 로직을 캡슐화하는 서비스 레이어

```typescript
// 예: 인증 서비스
authService.login(credentials)
  → 입력 검증
  → API 호출 (향후)
  → 상태 저장
  → 결과 반환
```

### Components
재사용 가능한 UI 컴포넌트

- **Layout**: 페이지 구조
- **Common**: 공통 컴포넌트
- **Pages**: 페이지 컴포넌트

### Utils
순수 함수 유틸리티

- `sanitize`: 보안 관련
- `accessibility`: 접근성 관련
- `lazy-load`: 성능 관련

## 마이그레이션 전략

### Phase 1: 인증 (완료)
- ✅ 새 인증 서비스 구현
- ✅ 로그인 페이지 마이그레이션

### Phase 2: 주요 페이지
- [ ] 클래스 선택 페이지
- [ ] 대시보드 페이지
- [ ] 세션 상세 페이지

### Phase 3: 위젯 시스템
- [ ] 위젯을 React 컴포넌트로 변환
- [ ] 상태 관리 개선

### Phase 4: 완전 전환
- [ ] 레거시 코드 제거
- [ ] 최종 테스트 및 최적화

## 테스트 전략

### 단위 테스트
- 서비스 로직 테스트
- 유틸리티 함수 테스트
- 컴포넌트 렌더링 테스트

### 통합 테스트
- 컴포넌트 간 상호작용
- 라우팅 테스트

### E2E 테스트
- 주요 사용자 플로우
- 크로스 브라우저 테스트

## 배포 전략

### 개발 환경
- Vite 개발 서버
- Hot Module Replacement

### 프로덕션 빌드
- 코드 최적화
- 번들 분석
- 성능 모니터링

## 보안 체크리스트

- [x] 입력값 검증
- [x] HTML Sanitization
- [x] XSS 방지
- [ ] CSRF 보호 (백엔드)
- [ ] HTTPS 강제
- [ ] CSP 헤더 설정
- [ ] 환경 변수로 비밀 관리

## 성능 체크리스트

- [x] 코드 스플리팅
- [x] 지연 로딩
- [x] 이미지 최적화
- [ ] 번들 크기 모니터링
- [ ] Lighthouse 점수 개선

## 접근성 체크리스트

- [x] ARIA 레이블
- [x] 키보드 네비게이션
- [x] 포커스 관리
- [x] 스크린 리더 지원
- [ ] Lighthouse 접근성 점수 100점 목표

