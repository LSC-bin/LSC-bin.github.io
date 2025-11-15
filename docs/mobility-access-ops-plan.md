## 모바일·접근성·외부 연동 및 운영/보안 계획

### 1. 모바일 & PWA 전략
- **Responsive Design**: Tailwind Breakpoints (`sm`, `md`, `lg`, `xl`) 기반으로 컴포넌트 재배치. `AppShell`에서 기본 반응형 헤더/내비 구현됨.
- **모바일 전용 UX**: 사이드바 → 하단 탭 전환, 제스처 기반 네비, 풀스크린 활동 뷰는 미구현. 현재는 데스크톱 우선 레이아웃으로, 추후 모바일 맞춤 레이아웃 추가 예정.
- **Progressive Web App**:
  - `manifest.json`, Service Worker 등은 아직 도입되지 않음. Vite PWA 플러그인 적용 계획.
  - 오프라인 캐싱, 백그라운드 동기화는 향후 구현 항목으로 분류.
- **네이티브 Wrapper (향후)**: Capacitor/React Native로 하이브리드 앱 확장은 장기 로드맵.

### 2. 접근성 (A11y)
- WCAG 2.1 AA 준수 목표는 유지.
- 현재 상태:
  - 기본적인 semantic 요소/헤딩 구조만 존재, Skip Link나 `aria` 강화 미구현.
  - 색 대비는 Tailwind 커스텀 팔레트에서 다크 모드 기준으로 설계했으나, 실제 대비 검증 미수행.
- 향후 작업:
  - 키보드 내비게이션(포커스 스타일), `aria-live` 영역, 접근성 토스트 지원.
  - 동영상/오디오 자료 업로드 기능 구현 시 자막/트랜스크립트 필수화.
  - 다국어(i18n) 세팅 및 언어 전환 UI 도입.

### 3. 외부 서비스 연동
- 현재는 외부 연동 미구현.
- 중기 계획:
  - **학습 플랫폼**: Google Classroom, Microsoft Teams API와의 일정/명단 싱크.
  - **캘린더**: Google Calendar/Outlook OAuth → 세션 일정 자동 등록.
  - **스토리지**: Google Drive, OneDrive, Dropbox 링크 임베드.
  - **LTI 1.3**: Canvas/Blackboard 등 표준 LMS 연동 준비.
  - **인증 연동**: SSO (OAuth2/SAML) 고려, 교육청 계정 연동 검토.

### 4. 운영 & 모니터링
- 현재: 브라우저 콘솔 로그 + 개발자 수동 확인 수준.
- 구축 예정:
  - **로깅**: Firebase Analytics + GA4.
  - **에러 추적**: Sentry (프론트), Cloud Logging (백엔드).
  - **성능 모니터링**: Firebase Performance Monitoring, Web Vitals 리포트.
  - **알림 모니터링**: Cloud Functions 실행 로그, 실패 재시도 알림.
  - **Ops 대시보드**: 관리자용 현황판 (사용자 수, 활성 클래스, 에러 카운트).

### 5. 보안 & 규정 준수
- 현재: Firebase Hosting/Firestore 기본 보안 설정에 의존. Auth/RBAC 미구현으로 실사용 제한.
- 계획:
  - HTTPS 강제 (Firebase Hosting) 및 CSP 구성.
  - Rate Limiting: Cloud Functions + Firestore Rules 조건, App Check 고려.
  - 데이터 암호화: TLS + Firebase 자동 암호화, 민감 데이터 별도 암호화.
  - 개인정보 보호: 최소 수집, 삭제 요청 대응 프로세스, GDPR/K-12 정책 검토.
  - 백업/복구: Firestore Export 주기적 실행, Storage 버전 관리.

### 6. 문서화 & 교육
- 현재: README 및 여러 설계 문서가 작성됨 (Architecture, Data/Auth, Roadmap 등). 운영 매뉴얼/튜토리얼 영상은 미작성.
- 향후:
  - 개발자 문서: ADR, API 레퍼런스, 데이터 딕셔너리 확장.
  - 운영 매뉴얼: 관리자/교사용 가이드, FAQ, 튜토리얼 영상 제작.
  - 교육 프로그램: 교사용 온보딩 세션, 학생 안내 슬라이드/영상.
  - 커뮤니티: 슬랙/디스코드 채널, GitHub Discussions, Issue 템플릿.

### 7. 릴리즈 & 배포 정책
- 현재: 로컬 개발 + Firestore 에뮬레이터 중심. 배포/CI 파이프라인 미구현.
- 계획:
  - 환경 분리: `dev`, `staging`, `prod` Firebase 프로젝트.
  - Feature Flags: LaunchDarkly 또는 Firestore `featureFlags` 컬렉션.
  - 배포 채널: main → prod 자동배포, staging → QA 검증.
  - 릴리즈 노트: GitHub Releases + in-app changelog 모달.

위 계획을 바탕으로 모바일 환경 대응과 접근성, 외부 연동, 운영 보안을 종합적으로 준비할 수 있습니다.

