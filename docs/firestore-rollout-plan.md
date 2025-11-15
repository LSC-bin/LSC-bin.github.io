# Firestore Rollout Communication & Test Strategy

Firestore 실연동 이후의 커뮤니케이션 플랜과 테스트 전략을 정리합니다.

## 1. 커뮤니케이션 계획

### 1.1 내부 팀 알림
- **Slack / Teams 채널**: “Firestore 연동 완료” 알림 및 주요 변경 사항 공유
- **문서 업데이트**: README, `apps/web/README.md`, Notion/Wiki에 새로운 데이터 흐름 및 배포 방법 기록
- **에뮬레이터 가이드 공유**: `npm run emulator`, `npm run seed:firestore`, `npm run dev` 순으로 로컬 테스트할 수 있는 단계별 안내를 문서와 함께 전달
- **동료 교육**: 짧은 데모 세션으로 실제 데이터 흐름, 장애 대응 방법 소개

### 1.2 사용자 공지 (교사/학생)
- **사전 안내**: 연동 계획과 영향 범위를 메일/공지로 전달
- **릴리즈 노트**: Firestore 연동 후 주요 기능(실시간 데이터, 링크 공유 등)을 중심으로 강조
- **대응 연락처**: 문제 발생 시 연락할 이메일/슬랙 채널 안내

### 1.3 위험 관리
- 연동 초기에는 모니터링 대시보드(Firebase Analytics, LogRocket 등)를 통해 오류/성능 이슈 추적
- 장애 대응 플랜(롤백/Emulator 환경 재연결) 마련

## 2. 테스트 전략

### 2.1 유닛/통합 테스트
- **서비스 레이어**: Firestore Emulator 기반 테스트 (`classroomsService`, `activityService`)
- **React Query 훅**: Zustand 상태/URL 파라미터 변화에 따른 데이터 Fetch 검증
- **Auth 흐름**: `useAuthStore` + Firebase Auth Mock 테스트 (로그인/로그아웃/권한 제어)
- **시드 검증**: 테스트 시작 전 `npm run seed:firestore` 또는 테스트용 시드 헬퍼를 호출해 정해진 데이터 상태를 확보한다.

### 2.2 E2E 테스트
- 기본 플로우: 클래스 선택 → 세션 선택 → 활동/질문/채팅 데이터 표시 *(seed 데이터 기반으로 현재 수동 확인 중)*
- 링크 공유: URL 파라미터에 따른 동일 화면 재현 확인 *(Teacher/Student 페이지의 링크 복사 기능)*
- 에러 처리: Firestore 권한, 네트워크 장애 시 Skeleton/에러 안내 표시 여부 확인 *(문서만 존재, 테스트 자동화 예정)*.
- 실시간 반응: onSnapshot 도입 후 UI 갱신 검증을 추가 예정.

### 2.3 QA 체크리스트
- Skeleton/EmptyState가 적절히 표시되는지 *(현재 Teacher/Student 화면에서 수동 확인 가능)*
- 링크 복사 및 공유된 링크가 올바른 화면으로 연결되는지 *(실제 기능 구현 완료, QA 필요)*
- Firestore 보안 규칙: 권한 없는 접근에 대한 차단 여부 *(규칙/테스트 미구현, TODO)*
- 로그/에러 모니터링 설정 검증 *(Sentry/Analytics 미도입, TODO)*

이 문서는 Firestore 연동 완료 시점에 확인/업데이트하며, 주요 커뮤니케이션과 테스트 활동이 누락되지 않도록 가이드로 활용합니다.

