# 프론트엔드 문제점 분석 보고서

## 📋 개요

이 문서는 AI ClassBoard 프론트엔드 코드베이스를 분석하여 발견된 문제점들을 정리한 보고서입니다.

---

## 🔴 심각한 문제 (Critical Issues)

### 1. 타입 안정성 문제

#### 1.1 Firestore 타입 변환기 문제
**위치**: `apps/web/src/lib/firebase/firestore.ts`

```typescript
export const createConverter = <T extends DocumentData>() => ({
  toFirestore(data: WithFieldValue<T>): DocumentData {
    return data
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): T {
    return snapshot.data() as T  // ⚠️ 타입 단언만 사용, 실제 검증 없음
  },
})
```

**문제점**:
- `fromFirestore`에서 타입 단언(`as T`)만 사용하여 런타임 타입 검증이 없음
- 잘못된 데이터가 들어와도 타입 에러가 발생하지 않음
- Zod 같은 검증 라이브러리와 통합되지 않음

**영향**: 데이터 불일치 시 런타임 에러 발생 가능

---

### 2. 에러 처리 문제

#### 2.1 프로덕션 콘솔 로그 남아있음
**위치**: 여러 파일

```typescript
// apps/web/src/pages/TeacherOverview.tsx:682
console.error(error)

// apps/web/src/pages/StudentOverview.tsx:125, 344, 478, 564
console.error(error)

// apps/web/src/components/layout/AuthControls.tsx:39, 61, 71
console.error(error)
```

**문제점**:
- 프로덕션 환경에서도 `console.error`가 남아있음
- 민감한 정보가 콘솔에 노출될 수 있음
- 로깅 라이브러리(`logger.ts`)를 사용하지 않고 직접 `console` 사용

**영향**: 보안 및 디버깅 정보 노출

---

#### 2.2 에러 메시지 일관성 부족
**위치**: `apps/web/src/services/classrooms-service.ts`, `activity-service.ts`

```typescript
const handleFirestoreError = (context: string, error: unknown): never => {
  logger.error(context, {
    error: error instanceof Error ? error.message : String(error),
  })
  throw error instanceof Error ? error : new Error(context)
}
```

**문제점**:
- 사용자 친화적인 에러 메시지가 없음
- 에러 타입별 처리 로직이 없음
- 네트워크 에러, 권한 에러 등을 구분하지 않음

---

### 3. 메모리 누수 가능성

#### 3.1 실시간 구독 정리 문제
**위치**: `apps/web/src/hooks/use-classrooms.ts`, `use-activity.ts`

```typescript
useEffect(() => {
  if (!classId) return
  const unsubscribe = classroomsService.subscribeToClassroom(classId, (classroom) => {
    queryClient.setQueryData(CLASSROOM_KEYS.detail(classId), classroom)
  })
  return () => unsubscribe()
}, [classId, queryClient])
```

**문제점**:
- `queryClient`가 의존성 배열에 포함되어 있어 불필요한 재구독 가능
- `queryClient`는 안정적인 참조이지만 React Query 버전에 따라 달라질 수 있음
- 빠른 클래스 전환 시 여러 구독이 동시에 활성화될 수 있음

**영향**: 메모리 누수 및 성능 저하

---

## 🟡 중간 수준 문제 (Medium Issues)

### 4. 성능 최적화 문제

#### 4.1 불필요한 리렌더링
**위치**: `apps/web/src/pages/TeacherOverview.tsx`

```typescript
const teacherName = useMemo(() => {
  if (members?.length) {
    const primaryTeacher = members.find((member) => member.role === 'teacher')
    if (primaryTeacher) {
      return primaryTeacher.userId  // ⚠️ userId를 반환하는데 displayName이어야 할 수도
    }
  }
  return user.displayName || user.email || 'teacher-1'
}, [members, user.displayName, user.email])
```

**문제점**:
- `teacherName`이 `userId`를 반환하는데 실제로는 이름이 필요할 수 있음
- `members` 배열 전체가 변경될 때마다 재계산됨

---

#### 4.2 URL 파라미터 동기화 중복
**위치**: `apps/web/src/pages/TeacherOverview.tsx:561-569`, `StudentOverview.tsx:109-118`

```typescript
useEffect(() => {
  const params = new URLSearchParams()
  if (selectedClassId) {
    params.set('classId', selectedClassId)
  }
  if (selectedSessionId) {
    params.set('sessionId', selectedSessionId)
  }
  navigate({ pathname: '/teacher', search: params.toString() }, { replace: true })
}, [selectedClassId, selectedSessionId, navigate])
```

**문제점**:
- `navigate`가 의존성 배열에 포함되어 매번 새로운 함수 참조일 수 있음
- URL 파라미터와 상태 동기화 로직이 중복됨

---

### 5. 접근성 문제

#### 5.1 ARIA 레이블 누락
**위치**: `apps/web/src/pages/TeacherOverview.tsx`

```typescript
<button
  type="button"
  className="ghost-button"
  onClick={() => onToggleVisibility(preference.widgetId)}
>
  Hide  // ⚠️ aria-label 없음
</button>
```

**문제점**:
- 스크린 리더 사용자를 위한 `aria-label` 누락
- 키보드 네비게이션 지원 부족

---

#### 5.2 포커스 관리 부족
**위치**: `apps/web/src/components/layout/AppShell.tsx`

```typescript
<a
  href="#main-content"
  className="absolute left-4 top-4 z-50 -translate-y-20 ..."
>
  본문 바로가기
</a>
```

**문제점**:
- 포커스 시에만 보이도록 되어 있지만, 실제 포커스 이동이 제대로 작동하는지 확인 필요

---

### 6. 코드 품질 문제

#### 6.1 하드코딩된 값
**위치**: `apps/web/src/pages/TeacherOverview.tsx:575`

```typescript
return user.displayName || user.email || 'teacher-1'  // ⚠️ 하드코딩된 fallback
```

**문제점**:
- 매직 스트링 사용
- 상수로 분리되지 않음

---

#### 6.2 중복된 에러 처리 패턴
**위치**: 여러 서비스 파일

```typescript
// classrooms-service.ts
const handleFirestoreError = (context: string, error: unknown): never => { ... }

// activity-service.ts
const handleActivityError = (context: string, error: unknown): never => { ... }
```

**문제점**:
- 동일한 패턴의 에러 핸들러가 여러 파일에 중복됨
- 공통 유틸리티로 추출 가능

---

### 7. 환경 변수 검증 타이밍

#### 7.1 앱 시작 시 검증 부족
**위치**: `apps/web/src/config/env.ts`

```typescript
export const getEnv = (): EnvSchema => {
  if (cachedEnv) {
    return cachedEnv
  }

  const parsed = envSchema.safeParse(import.meta.env)

  if (!parsed.success) {
    const formatted = parsed.error.format()
    console.error('❌ Invalid environment configuration:', formatted)
    throw new Error('Failed to parse environment variables. Check your Vite env file.')
  }
  // ...
}
```

**문제점**:
- 환경 변수 검증이 지연 로딩됨
- 앱 시작 시점에 검증되지 않아 런타임에 에러 발생 가능
- `main.tsx`에서 초기 검증이 없음

---

## 🟢 경미한 문제 (Minor Issues)

### 8. 타입 정의 문제

#### 8.1 Optional 체이닝 과다 사용
**위치**: 여러 컴포넌트

```typescript
const { data: classroom } = useClassroomDetailQuery(selectedClassId ?? '')
// selectedClassId가 null일 때 빈 문자열로 쿼리 실행
```

**문제점**:
- `enabled` 옵션으로 처리되지만, 빈 문자열을 전달하는 것은 명확하지 않음

---

### 9. 사용자 경험 문제

#### 9.1 로딩 상태 일관성 부족
**위치**: `apps/web/src/pages/StudentOverview.tsx`

```typescript
{isPostsLoading ? (
  <div className="mt-4 space-y-2">
    <Skeleton className="h-16" />
    <Skeleton className="h-16" />
    <Skeleton className="h-16" />
  </div>
) : posts?.length ? (
  // ...
) : (
  <EmptyState ... />
)}
```

**문제점**:
- 로딩 스켈레톤 개수가 하드코딩됨
- 실제 데이터 개수와 일치하지 않을 수 있음

---

#### 9.2 폼 검증 부족
**위치**: `apps/web/src/components/layout/AuthControls.tsx`

```typescript
<input
  type="email"
  required
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  // ⚠️ 이메일 형식 검증 없음
/>
```

**문제점**:
- HTML5 `required`만 사용
- 이메일 형식 검증이 없음
- Zod 스키마와 통합되지 않음

---

### 10. 보안 관련 문제

#### 10.1 XSS 취약점 가능성
**위치**: `apps/web/src/pages/StudentOverview.tsx:416`

```typescript
<p className="mt-1 text-sm text-white">{post.text}</p>
```

**문제점**:
- 사용자 입력이 직접 렌더링됨
- XSS 공격 가능성 (현재는 안전하지만, 향후 HTML 지원 시 위험)

---

## 📊 문제 요약

| 심각도 | 개수 | 주요 문제 |
|--------|------|----------|
| 🔴 Critical | 3 | 타입 안정성, 에러 처리, 메모리 누수 |
| 🟡 Medium | 4 | 성능, 접근성, 코드 품질, 환경 변수 |
| 🟢 Minor | 3 | 타입 정의, UX, 보안 |

---

## 🔧 권장 해결 방안

### 우선순위 1 (즉시 수정)

1. **타입 검증 강화**
   - Zod 스키마를 Firestore 변환기에 통합
   - 런타임 타입 검증 추가

2. **에러 처리 개선**
   - 프로덕션 환경에서 `console.error` 제거
   - 에러 바운더리 추가
   - 사용자 친화적인 에러 메시지

3. **메모리 누수 방지**
   - `queryClient` 의존성 제거 또는 `useRef` 사용
   - 구독 정리 로직 강화

### 우선순위 2 (단기 개선)

4. **성능 최적화**
   - 불필요한 리렌더링 제거
   - `useMemo`, `useCallback` 최적화

5. **접근성 개선**
   - ARIA 레이블 추가
   - 키보드 네비게이션 지원

6. **코드 품질**
   - 중복 코드 제거
   - 상수 분리
   - 공통 유틸리티 추출

### 우선순위 3 (장기 개선)

7. **환경 변수 검증**
   - 앱 시작 시점 검증
   - 개발/프로덕션 환경 분리

8. **사용자 경험**
   - 로딩 상태 개선
   - 폼 검증 강화
   - 에러 복구 메커니즘

---

## 📝 참고 사항

- 모든 문제는 실제 사용자 영향도를 고려하여 우선순위를 정했습니다.
- 일부 문제는 현재 구현 상태에서는 큰 영향이 없을 수 있으나, 향후 확장 시 문제가 될 수 있습니다.
- 테스트 커버리지가 낮은 영역에서 발견된 문제들이 많습니다.

---

**생성일**: 2025-01-14
**분석 범위**: `apps/web/src` 디렉토리 전체

