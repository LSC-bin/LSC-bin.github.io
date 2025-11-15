## 현재 구현 현황 요약

| README 상 기능 구분 | README 설명 | 실제 코드 구현 상태 | 비고 |
| --- | --- | --- | --- |
| SPA 전환/레이아웃 | React + Vite 기반 SPA, Router·상태관리 도입 | `apps/web`에 React 19 + Vite + Tailwind + Zustand + React Query 셋업 완료. AppShell/라우팅/공용 컴포넌트 구현됨 | Firestore는 Emulator 대상으로 read-only 조회 |
| Dashboard (랜딩) | 공지/빠른 링크/수업 카드, 기술 로드맵 안내 | `apps/web/src/pages/LandingPage.tsx`에서 문서/체크리스트 링크와 샘플 클래스 미리보기. Firestore 데이터 없을 때 에뮬레이터/시드 안내 표시 | 실데이터 연결 전; seed 후 목록 확인 가능 |
| Teacher Overview | 클래스/세션 선택, 커스터마이징 가이드 | React Query + Firestore(에뮬레이터) `onSnapshot`으로 `classrooms`, `sessions`, `members` 실시간 조회. 시드 실행 가이드 제공 | 세션 생성 mutation은 서비스 레벨 구현, UI 연결 예정. 배너에 연동 예정 문구 유지 |
| Student Overview | 활동/질문/채팅 뷰, 공유 링크 | Firestore 실시간 구독으로 활동/질문/채팅이 자동 반영. 학생 화면에서 게시물/질문/채팅 작성 폼 제공 (데모 사용자 기준). EmptyState에 시드/에뮬레이터 안내 추가 | 좋아요/업보트 등 추가 기능은 미구현 |
| Activity (Padlet형) | 실시간 동기화, 이미지 업로드 | React Query + `subscribeToActivityPosts`로 실시간 조회. `createActivityPost` API 추가됨. 이미지/좋아요 기능은 미구현 | seed된 기본 텍스트 게시물만 표시 |
| Ask (Slido형) | 실시간 Q&A + 좋아요 정렬 | 질문 목록 실시간 구독, `createQuestion` mutation 제공. upvote 로직 미구현 | 정렬/좋아요 로직 미구현 |
| Chat | 실시간 채팅 | 메시지 실시간 구독 + `sendChatMessage` mutation 제공 | UI에서 전송 버튼 연결 예정 |
| Materials | Firebase Storage 업로드 | UI/로직 미구현 | 계획 단계 |
| Authentication | Firebase Auth + RBAC | `apps/web`에 Zustand `useAuthStore`만 스텁. Firebase Auth 연동과 Firestore 프로필 동기화 미구현 | README 문서에서는 RBAC 설계 제시 |
| 실시간 협업 | 세션별 액티비티/채팅 동기화 | 현재는 Firestore read + React Query polling. 실시간 `onSnapshot`/presence 구현 예정 | |
| AI/Generative | AI 분석/추천 | 코드 내 구현 없음. 문서에만 향후 계획 | |
| 구 레거시 HTML | 기존 `main-session.html` 등 | 리포지토리에 남아 있으나 개발 포커스는 `apps/web` SPA로 이동 | 기술 부채로 분류, 제거/마이그레이션 필요 |

### 핵심 관찰
- 프론트엔드 전역 상태(전역 변수·`localStorage`)와 DOM 직접 조작 패턴이 주된 구조이며 SPA 아키텍처를 따르지 않습니다.
- README에 명시된 Firebase 연동, AI 기능, 실시간 동기화는 아직 구현되지 않았습니다.
- 로그인·권한·데이터 영속성 등 핵심 인프라가 모두 목업 상태로, 문서와 실제 제공 기능 사이에 큰 차이가 있습니다.

README 업데이트 시 위 내용을 참고하여 현재 제공 범위와 향후 계획을 명확히 구분해야 합니다. Firestore 연동 문서에는 에뮬레이터 실행(`npm run emulator`)과 시드(`npm run seed:firestore`) 절차가 반영되어 있으며, 실 데이터 연결 전에는 해당 단계로 데모 환경을 준비해야 합니다.

