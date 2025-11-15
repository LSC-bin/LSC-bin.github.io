## 데이터 영속성 및 인증·권한 모델 설계

### 1. 핵심 요구
- 교사는 클래스를 개설하고, 수업(세션)을 생성/편집/아카이브할 수 있다.
- 학생은 클래스 코드/초대 링크로 참여하며, 교사가 허용한 기능만 사용할 수 있다.
- 20개 이상의 수업 도구(액티비티)를 안전하게 저장/조회하며, 실시간 동기화가 가능해야 한다.
- 모든 데이터는 Firestore/Storage에 영속화되고, 보안 규칙으로 역할 기반 접근을 제어한다.

### 2. 인증 구조
- **Firebase Authentication**
  - 이메일/비밀번호, Google OAuth 지원.
  - 사용자 최초 가입 시 Cloud Functions 트리거로 `profiles/{uid}` 문서 생성.
- **프로필 문서 (`profiles/{uid}`)**  
  ```ts
  interface UserProfile {
    displayName: string;
    email: string;
    photoURL?: string;
    role: 'teacher' | 'student' | 'assistant' | 'admin';
    organizations: string[]; // 향후 멀티 조직 지원
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  ```
- **세션 토큰**: Firebase Auth 세션, ID 토큰 검증 → 프론트는 React Query + `onAuthStateChanged`.

### 3. 역할 및 권한 (RBAC)
| 역할 | 주요 권한 |
| --- | --- |
| `admin` | 조직 전체 관리, 모든 클래스/사용자 액세스, 보안 규칙 관리 (Cloud Functions 전용) |
| `teacher` | 클래스 생성/삭제, 세션/액티비티 CRUD, 학생 승인, 기능 커스터마이징 |
| `assistant` | 교사 위임 작업(자료 업로드, 공지), 권한 범위는 교사가 지정 |
| `student` | 허용된 기능 사용(질문, 채팅, 투표 등), 개인 자료 열람 |

- 권한 검증은
  1. **클라이언트**: `usePermission` 훅으로 UI 제어
  2. **Firestore Rules**: 서버 측에서 재검증

### 4. 데이터 모델 (Firestore)

```
classrooms/{classId}
  ├── metadata
  │   ├── name, code, ownerId, description
  │   ├── featureConfig (사이드바 커스터마이징)
  │   ├── schedule (수업 일정)
  │   └── createdAt/updatedAt
  ├── members/{memberId}
  │   ├── userId, role, status(pending|active|suspended)
  │   └── permissions (세부 기능 권한 오버라이드)
  ├── sessions/{sessionId}
  │   ├── title, number, date, agenda, status(live|archived|draft)
  │   ├── activeTools (활성화된 기능 목록)
  │   └── createdAt/updatedAt
  │
  │   ├── activityPosts/{postId}
  │   ├── askQuestions/{questionId}
  │   ├── chatMessages/{messageId}
  │   ├── materials/{materialId}
  │   └── analytics/{analyticsId} (집계 결과)
  └── presets/{presetId} (커스터마이징 템플릿)

profiles/{uid}
invites/{inviteId} // 클래스 초대 관리
```

- **사이드바 구성**: `classrooms/{classId}/metadata.featureConfig`
  ```ts
  interface FeatureConfig {
    sidebar: Array<{
      toolId: string;           // e.g. 'activity', 'quiz', 'timer'
      visibility: 'teacher' | 'student' | 'all';
      order: number;
      settings: Record<string, any>;
    }>;
    presets: string[];          // 저장된 구성을 참조
  }
  ```

- **학생 제한 권한**: `members/{memberId}.permissions`  
  ```ts
  interface MemberPermissionOverride {
    toolId: string;
    actions: {
      create?: boolean;
      update?: boolean;
      delete?: boolean;
      moderate?: boolean;
    };
  }
  ```

### 5. Storage 구조
- `materials/{classId}/{sessionId}/{materialId}/{filename}`  
  - 메타데이터는 Firestore `materials/{materialId}`에 저장 (`downloadURL`, `mimeType`, `size`, `uploadedBy` 등).
- 이미지/동영상: Firestore 문서에 썸네일 URL, Storage에 원본.
- 업로드 전 Cloud Functions로 파일 유형/크기 검증 가능.

### 6. 로컬 개발용 더미 데이터
- Firestore Emulator를 실행한 뒤 `apps/web` 디렉터리에서 `npm run seed:firestore`를 실행하면 기본 클래스/세션/활동 데이터가 생성된다.
- 생성되는 데이터는 교사용 흐름(클래스, 세션, 구성원)과 학생용 활동(게시물, 질문, 채팅)을 모두 포함해 주요 화면이 즉시 확인 가능하도록 구성한다.
- 필요 시 `scripts/seed-firestore.ts`를 수정하거나 복제해 테스트 전용 시드 시나리오를 추가하고, Emulator UI에서 직접 데이터를 보정할 수 있다.

### 7. 실시간 동기화
- Firestore `onSnapshot`으로 Activity/Ask/Chat/Materials를 구독. React Query 캐시와 연동해 UI가 자동 갱신됨.
- React Query + `useEffect` 구독 패턴으로 서버 상태를 관리하고, UI 상태는 Zustand가 담당.
- 현재는 활동/질문/채팅, 클래스/세션/구성원에 대해 실시간 구독을 구현한 상태이며, 대규모 메시지(채팅)는 Firestore `chatMessages` 서브컬렉션 + 제한(예: 최근 200개) + Cursor 기반 페이지네이션으로 확장 예정.

### 8. 보안 규칙 개요
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isTeacherOf(classId) {
      return exists(/databases/$(database)/documents/classrooms/$(classId)/members/$(request.auth.uid))
        && get(/databases/$(database)/documents/classrooms/$(classId)/members/$(request.auth.uid)).data.role in ['teacher', 'assistant'];
    }

    function isStudentOf(classId) {
      return exists(/databases/$(database)/documents/classrooms/$(classId)/members/$(request.auth.uid))
        && get(...).data.role == 'student'
        && get(...).data.status == 'active';
    }

    match /classrooms/{classId} {
      allow read: if isTeacherOf(classId) || isStudentOf(classId);
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isTeacherOf(classId);

      match /members/{memberId} {
        allow read: if isTeacherOf(classId) || (isStudentOf(classId) && request.auth.uid == memberId);
        allow create, update: if isTeacherOf(classId);
        allow delete: if isTeacherOf(classId) && memberId != classOwnerId;
      }
      // 세션, 액티비티, 채팅 등 서브컬렉션에 대해 역할별 allow 조건 정의
    }
  }
}
```
- Storage 규칙도 클래스/세션/업로드한 유저 ID로 접근 제한.

### 9. 클래스 참여 흐름
1. 교사가 클래스 생성 → `classrooms/{classId}` 문서 + `code` 발급.
2. 학생이 코드 입력 → `invites` 컬렉션에 신청 기록.
3. 교사가 승인하면 `members/{studentUid}` 문서 `status: 'active'`.
4. 승인 후 학생은 실시간으로 사이드바/기능 구성이 반영된 수업 뷰를 사용.

### 10. 서비스 계층 API (프론트)
- `ClassroomsService`: `listClassrooms`, `getClassroom`, `listMembers`, `listSessions`, `subscribeTo*`, `createSession`.
  - ➜ TODO: `createClassroom`, `updateFeatureConfig`, `joinClassroomWithCode`, optimistic update.
- `ActivityService`: `listActivityPosts`, `listQuestions`, `listChatMessages`, `subscribeTo*`, `createActivityPost`, `createQuestion`, `sendChatMessage`.
  - ➜ TODO: `toggleLike`, `addComment`, `delete*` 및 에러 처리/optimistic update.
- `AskService`: 질문 관련 기능이 `ActivityService`로 통합되어 있으며, upvote/정렬은 미구현 상태.
- `ChatService`: 채팅 목록 실시간 구독 및 `sendChatMessage`로 메시지 전송 지원.
- `MaterialsService`: 추후 Firebase Storage 연동 시 구현 예정 (`uploadMaterial`, `deleteMaterial`, `getMaterials`).
- 모든 서비스는 Firebase SDK 래퍼와 TypeScript 타입을 사용하며, 에뮬레이터 호스트를 자동 감지한다.

### 11. 감사 로깅 & 백업
- Firestore `activityLog` 컬렉션에 주요 이벤트 기록 (Cloud Functions `onWrite` 트리거).
- 비정상 권한 요청, 데이터 삭제 등은 별도 로깅.
- 주기적 백업: Firebase Scheduled Export 또는 GCS 백업.

위 구조를 기준으로 Firestore/Storage 규칙과 서비스 계층을 구현하면, 역할 기반 권한 통제와 데이터 영속성을 고도화할 수 있습니다.

