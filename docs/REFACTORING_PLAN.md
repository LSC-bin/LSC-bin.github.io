# AI ClassBoard 리팩터링 계획

## 목표
프로토타입을 프로덕션급 웹 앱으로 업그레이드

## 주요 작업

### 1. 프로젝트 구조
```
src/
├── services/          # 비즈니스 로직 (인증, 데이터 등)
├── components/        # React 컴포넌트
│   ├── layout/       # 레이아웃 컴포넌트
│   ├── common/       # 공통 컴포넌트
│   └── pages/        # 페이지 컴포넌트
├── styles/           # CSS 모듈
│   ├── tokens/       # 디자인 토큰
│   ├── base/         # 기본 스타일
│   └── components/   # 컴포넌트 스타일
├── utils/            # 유틸리티 함수
├── hooks/            # React 커스텀 훅
└── types/            # TypeScript 타입 정의
```

### 2. 인증/세션 서비스
- localStorage 추상화 레이어
- 보안 강화 (평문 저장 방지)
- 입력 검증
- 중앙 집중화된 로그아웃

### 3. CSS 모듈화
- 디자인 토큰 분리
- 범위 지정 스타일
- 유틸리티 클래스
- 트리 셰이킹 가능한 임포트

### 4. 접근성
- ARIA 레이블/롤
- 키보드 네비게이션
- 포커스 관리
- 의미론적 마크업

### 5. 보안 및 성능
- HTML sanitization
- 지연 로딩
- CSP 친화적 패턴
- 비밀/API 키 보호

