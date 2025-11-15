## 데이터/상태 구조 표준화 및 API·스토어 베이스라인

### 1. 목표
- Firestore 데이터 모델과 프론트엔드 상태 관리를 일관성 있게 연결합니다.
- API 호출 레이어와 Zustand/React Query 스토어 구조를 미리 정의해 기능 추가 시 중복을 최소화합니다.

### 2. 네임스페이스 & 타입 규칙
- **Firestore 컬렉션 ↔ TypeScript 인터페이스** 1:1 매핑.
- `apps/web/src/types`에 `Classroom`, `ClassroomMember`, `ClassroomFeatureConfig`, `Session`, `ActivityPost`, `Question`, `ChatMessage` 등 도메인 타입이 정의되어 있으며, 각 인터페이스는 `id`, `createdAt`, `updatedAt` 등의 공통 필드를 포함합니다.
- Timestamp ↔ Date 변환은 `services/firebase`에서 converter 유틸을 통해 단일화할 예정입니다.
- 도구(액티비티) 정의는 현재 `ClassroomFeatureConfig`에서 사이드바 구성 형태로 표현되며, 향후 `ToolDefinition` 인터페이스를 추가해 확장성을 확보할 계획입니다.

### 3. React Query 구조
- 현재 구현된 Query 키:
  - `['classrooms']`, `['classrooms', classId]`
  - `['classrooms', classId, 'members']`
  - `['classrooms', classId, 'sessions']`
  - `['activityPosts', classId, sessionId]`
  - `['questions', classId, sessionId]`
  - `['chatMessages', classId, sessionId]`
- Mutation 훅은 아직 미구현. 도입 시 기능명 기반(`useCreateSessionMutation`, `useUpsertFeatureConfigMutation`)으로 구성할 예정입니다.
- 현재 Firestore read-only 호출(`getDocs`)을 사용하며, 향후 `onSnapshot`과 `queryClient.setQueryData`를 통해 실시간 캐시 동기화를 적용할 계획입니다.

### 4. Zustand 스토어 구조
- `useUIStore`: 테마(`theme`), 사이드바(열림/닫힘), 선택된 클래스/세션 ID, URL 파라미터 초기화(`initializeSelection`)를 담당하며 `persist` 미들웨어로 저장.
- `useAuthStore`: 인증 상태 스텁으로 사용자 정보/토큰을 저장할 준비만 되어 있음. Firebase Auth 연동 예정.
- 추가 예정 스토어:
  - `useFeatureConfigStore`: 기능 사이드바/프리셋 상태 관리.
  - `usePermissionStore`: 역할/권한 캐시.
- 원칙: UI·컨트롤 상태는 Zustand, 서버 데이터는 React Query가 관리.

### 5. 서비스 계층 현황
- `apps/web/src/services`:
  - `classrooms-service.ts`: `listClassrooms`, `getClassroom`, `listMembers`, `listSessions`가 Firestore 에뮬레이터에서 데이터를 조회 (read-only).
  - `activity-service.ts`: `listActivityPosts`, `listQuestions`, `listChatMessages`를 Firestore에서 조회.
  - 향후 추가: 세션/멤버 생성, 활동 작성, 질문 좋아요, 채팅 전송 등 mutation 함수.
- `services/firebase`: Firebase app/auth/firestore/storage 래퍼와 `paths` 유틸을 제공. converter 정비 예정.

### 6. 에러 처리 & 로깅
- 현재는 Firestore 호출 실패 시 콘솔 로그 및 토스트(`sonner`)를 활용하는 수준. `AppError` 유틸과 Sentry 연동은 예정.

### 7. 권한 검사 유틸
- 아직 구현되지 않았으며, RBAC 도입 시 `usePermission` 훅과 Firestore rules를 연계할 예정.

### 8. 데이터 동기화 패턴
- 현재는 Firestore에서 `getDocs`로 읽어온 데이터를 React Query 캐시에 저장하는 read-only 흐름.
- 실시간 업데이트(`onSnapshot`), optimistic update, 로컬 큐 등은 향후 구현 목표.

### 9. 도구(액티비티) 확장 인터페이스
- 아직 코드에는 미구현. 문서상의 `ToolModule`/`toolRegistry` 설계를 추후 `ClassroomFeatureConfig`와 연계해 구현할 계획.

### 10. 초기 베이스라인 태스크 (진행 현황)
1. Firebase SDK 초기화 + `.env` 검증 (`apps/web/src/config/firebase.ts`, `env.ts`). *(완료)*
2. React Query `QueryClient` 설정 (`AppProviders`). *(완료)*
3. Zustand 스토어(`useUIStore`, `useAuthStore`) 생성. *(완료) — FeatureConfig/Permission 스토어는 예정*
4. 서비스 계층 스켈레톤 구현 (Classroom, Activity) → Firestore 에뮬레이터 read-only 조회까지 구현. *(진행됨)*
5. 교사/학생 라우트 분기 (`App.tsx` + React Router). RBAC 가드는 추후 도입. *(진행됨)*
6. 예시 페이지에서 React Query + Zustand 통합 (클래스/세션/활동 조회). *(완료)*
7. Mutation/실시간 구독 흐름, Auth 연동, 테스트 도입은 향후 단계. *(예정)*

위 베이스라인을 토대로 기능을 확장하면, 일관된 데이터 흐름과 테스트 가능한 구조를 유지하며 20개 이상의 도구를 손쉽게 추가할 수 있습니다.

