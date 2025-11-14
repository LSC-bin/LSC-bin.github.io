# AI ClassBoard

실시간 수업 참여와 협업을 지원하는 교육용 통합 대시보드입니다. 교사·학생·관리자 역할에 맞춘 워크플로우를 한 곳에서 운영할 수 있도록 설계했습니다.

## 현재 구현 상태

- [o] Firebase Authentication 통합 · Firestore / Storage 실연동 기본 흐름
- [o] 역할 기반 UI 가드 · 세션 작성자 기록 · 서비스 계층 에러 핸들링 강화
- [ ] AI 피드백·채점(OpenAI / Gemini) 연동
- [ ] 클래스 코드 초대, 실시간 협업 백엔드 연동
- [ ] 프로덕션 품질 수준의 전체 기능 완성

세부 구현 범위는 `docs/current-implementation.md`에서 확인할 수 있습니다.

## 빠른 시작

```bash
npm install
npm run emulator   # 터미널 1: Firestore 에뮬레이터
npm run dev        # 터미널 2: Vite 개발 서버
```

- 교사용 화면: `http://localhost:5173/teacher`
- 학생용 화면: `http://localhost:5173/student`
- 통계·모니터링: `http://localhost:5173/analytics`
- 기본 Firestore 데이터 투입: `npm run seed:firestore`
- 테스트 실행: `npm run test` (Vitest 기반), `npm run test:watch`
- PWA 설치: 프로덕션 빌드(`npm run build` → 정적 호스팅) 시 서비스 워커·웹 매니페스트가 활성화되어 브라우저에서 “앱 설치” 버튼을 사용할 수 있습니다.
- 배포 후보: Firebase Hosting(`firebase deploy --only hosting`) 혹은 Vercel(`vercel`)

### 대시보드 위젯 커스터마이징

- 교사용 페이지 `/teacher`에서 “위젯 편집” 버튼을 누르면 Drag & Drop으로 카드 순서를 변경할 수 있고, 숨김/표시 및 크기 조정(S/M/L)도 가능합니다.
- 변경 사항은 `classrooms/{classId}/preferences/dashboardWidgets` 문서에 저장되며, 다시 표시하면 이전 설정과 콘텐츠가 그대로 복원됩니다.
- 기본 레이아웃으로 되돌리는 버튼을 제공하므로, 여러 실험 후에도 빠르게 초기 상태로 복귀할 수 있습니다.

## 주요 기능

- Dashboard: 공지, 빠른 링크, 과제 현황, 오늘의 수업 요약
- Activity(Padlet형): 실시간 협업 게시판, 이미지 첨부, 좋아요·댓글
- Ask(Slido형): 실시간 Q&A, 좋아요 정렬, 교사 답변 표시
- Cloud: WordCloud 시각화, 단어 빈도 분석
- Quiz: 자동 채점·난이도 조정(예정)
- Materials / Settings: 학습 자료 업로드, Classroom·Padlet 연동 관리(예정)

## 개발 환경 요약

- `apps/web`: Vite + React 19 + TypeScript
- 스타일: TailwindCSS, 디자인 토큰 기반 테마
- 상태: React Query, Zustand
- Firebase SDK: Auth / Firestore / Storage 래퍼, 에뮬레이터 지원
- 테스트: Vitest + Testing Library (`vitest.setup.ts`에서 jest-dom 활성화)

환경 변수 예시 (`apps/web/.env`):

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

## 문서 모음

- `docs/current-implementation.md`: 목표 스펙 대비 구현 현황
- `docs/architecture-and-pipeline-plan.md`: SPA 전환 및 파이프라인 설계
- `docs/data-and-auth-plan.md`: 데이터 구조 & 인증 모델
- `docs/state-and-api-baseline.md`: 상태 관리 / API 표준화
- `docs/feature-expansion-roadmap.md`: 기능 확장 로드맵
- `docs/mobility-access-ops-plan.md`: 모바일·접근성·운영 계획
- `docs/firestore-integration-plan.md`, `docs/firestore-rollout-plan.md`

## 프로젝트 구조 (요약)

```
education dashboard/
├── index.html / index.css / index.js         # 기존 정적 화면
├── apps/web/                                 # Vite + React SPA
│   ├── src/components/common/EmptyState.tsx
│   ├── src/components/common/__tests__/…     # Vitest + RTL
│   ├── src/pages/TeacherOverview.tsx
│   ├── src/pages/StudentOverview.tsx
│   ├── src/services/                         # Firestore 서비스 계층
│   └── vitest.setup.ts
└── docs/                                     # 설계 및 로드맵 문서
```

## 사용자 역할

- 교사: 수업 설계, 자료 관리, 평가
- 학습자: 실시간 참여, 토론, 과제 제출
- 관리자: 시스템 및 운영 관리

## 로드맵 (요약)

- [o] M1: Firebase Authentication 통합 및 Firestore / Storage 실연동 완료
- [o] M1: 역할 기반 권한 · 에러 처리 · 데이터 영속성 API 정비
- [ ] M2: 테스트 자동화(Vitest / Cypress) · CI/CD 파이프라인 구축
- [ ] M2: 기본 통계 대시보드 · 운영 모니터링/로깅 도입
- [ ] M3: AI 피드백·요약 기능 연동 및 사용자 피드백 루프 확립
- [o] M3: 모바일 앱(PWA) · 반응형·접근성(WCAG) 검증 강화

세부 과제는 `docs/feature-expansion-roadmap.md`를 참고하세요.

## 기여 & 라이선스

- 이슈와 풀 리퀘스트를 환영합니다.
- 라이선스: MIT
