# Firestore Integration Plan

이 문서는 현재 `apps/web`의 모킹된 서비스 레이어를 실제 Firestore 기반 데이터 흐름으로 전환하기 위한 단계별 계획을 정리한 것입니다.

## 1. 준비 작업

- Firebase 프로젝트 생성 및 콘솔에서 Firestore/Storage/Auth 활성화
- `.env` 파일에 실 프로젝트 키 입력 (`apps/web/README.md` 참고)
- Firebase CLI 설치 후 로컬에서 `firebase login`, `firebase init` 실행
- Firestore Emulator 사용 시 `.firebaserc`, `firestore.rules`, `firestore.indexes.json` 구성
- 로컬 데이터 검증이 필요하면 `npm run emulator` 실행 후 별도 터미널에서 `npm run seed:firestore`를 실행해 데모 클래스를 주입한다.
- Emulator UI(기본: <http://127.0.0.1:4000>)에서 시드 데이터가 생성되었는지 확인하고 필요 시 직접 수정한다.

## 2. 데이터 스키마 정의

| 컬렉션 | 설명 | 필드 예시 |
| --- | --- | --- |
| `classrooms` | 수업 클래스 | `name`, `description`, `ownerId`, `code`, `featureConfig` |
| `classrooms/{classId}/members` | 클래스 구성원 | `userId`, `role`, `status`, `permissions` |
| `classrooms/{classId}/sessions` | 세션(차시) | `title`, `number`, `agenda`, `status`, `activeTools` |
| `classrooms/{classId}/sessions/{sessionId}/activityPosts` | Padlet형 게시글 | `authorId`, `text`, `images`, `likes` |
| `classrooms/{classId}/sessions/{sessionId}/askQuestions` | 질문 | `authorId`, `text`, `upvotes` |
| `classrooms/{classId}/sessions/{sessionId}/chatMessages` | 채팅 | `authorId`, `text` |

## 3. 서비스 레이어 리팩터링

1. `src/services/classrooms-service.ts`
   - ✅ 현재: Firestore 에뮬레이터에서 `listClassrooms`, `getClassroom`, `listMembers`, `listSessions` 조회 + `subscribeTo*` 실시간 구독(onSnapshot)으로 React Query 캐시 자동 갱신.
   - ✅ `createSession` API를 추가해 세션 문서를 생성하면 실시간 구독을 통해 UI가 즉시 갱신됩니다.
   - ➜ 다음: `createClassroom`, `updateFeatureConfig` 등 나머지 mutation과 optimistic update 도입.

2. `src/services/activity-service.ts`
   - ✅ 현재: Firestore 서브컬렉션에서 `listActivityPosts`, `listQuestions`, `listChatMessages` 조회 + `subscribeTo*` 구독으로 게시물/질문/채팅 실시간 반영.
   - ✅ `createActivityPost`, `createQuestion`, `sendChatMessage` mutation을 추가해 작성 기능을 API 레벨에서 지원합니다.
   - ➜ 다음: 좋아요/업보트 토글, 에러 처리, optimistic update, UI 연동 강화.

3. 공통 Firestore 유틸
   - `src/services/firebase` 래퍼에서 app/auth/firestore/storage 초기화 및 에뮬레이터 연결 처리 완료.
   - ➜ 다음: `withConverter` 도입, Timestamp 변환 유틸, 에러 핸들링(`toast.error`, Sentry 연동) 강화.

## 4. 인증 연계

- Firebase Auth와 `useAuthStore` 연결 (`onAuthStateChanged`)
- 로그인 사용자 정보를 `profiles/{uid}`에서 가져와 권한 검증
- Role에 따라 UI 제어 (예: 교사만 세션 생성 버튼 노출)

## 5. 테스트 및 QA

- Firestore Emulator 기반 유닛/통합 테스트 작성 (Vitest + React Testing Library)
- 데이터 시나리오: 클래스 생성 → 세션 생성 → 활동/질문/채팅 → 아카이브
- 테스트 전 `npm run seed:firestore`로 초기 데이터를 주입하거나, 테스트 스위트에서 전용 시드 함수를 호출해 일관된 상태를 확보한다.
- Smoke 테스트: 링크 공유, Skeleton/EmptyState 동작, Auth 흐름 검증

## 6. 배포/운영

- Firestore 보안 규칙 (`data-and-auth-plan.md` 기반) 적용 및 테스트
- CI/CD에서 `npm run lint`, `npm run test` 실행
- 실서버 배포 전 staging 환경에서 Firestore/Storage 연동 확인

상기 단계별 작업이 완료되면, README의 체크리스트 항목을 순차적으로 업데이트합니다.

