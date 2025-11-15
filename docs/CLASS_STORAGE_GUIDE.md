# 클래스별 데이터 분리 가이드

## 📋 개요

모든 클래스 내부의 기능은 클래스마다 독자적으로 동작해야 합니다. 이 가이드에서는 클래스별 데이터 분리를 위한 유틸리티 함수 사용법을 설명합니다.

## 🎯 핵심 원칙

1. **절대 전역 데이터 사용 금지**: 모든 클래스 관련 데이터는 클래스별로 분리되어야 합니다.
2. **일관된 유틸리티 사용**: `class-storage-utils.js`의 함수를 사용하여 데이터를 저장/로드합니다.
3. **클래스 간 간섭 방지**: 한 클래스의 데이터가 다른 클래스에 영향을 주지 않아야 합니다.

## 📦 유틸리티 함수

### 기본 함수

#### `getCurrentClassId()`
현재 선택된 클래스 ID를 가져옵니다.

```javascript
const classId = getCurrentClassId(); // '1학년_1반' 또는 'default'
```

#### `getClassStorageKey(baseKey, classId)`
클래스별 스토리지 키를 생성합니다.

```javascript
const key = getClassStorageKey('sessions'); // 'sessions_1학년_1반'
const key2 = getClassStorageKey('announcements', '2학년_1반'); // 'announcements_2학년_1반'
```

#### `getClassStorage(baseKey, defaultValue, classId)`
클래스별 데이터를 가져옵니다.

```javascript
// ❌ 잘못된 방법
const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');

// ✅ 올바른 방법
const sessions = getClassStorage('sessions', []);
```

#### `setClassStorage(baseKey, value, classId)`
클래스별 데이터를 저장합니다.

```javascript
// ❌ 잘못된 방법
localStorage.setItem('sessions', JSON.stringify(sessions));

// ✅ 올바른 방법
setClassStorage('sessions', sessions);
```

#### `removeClassStorage(baseKey, classId)`
클래스별 데이터를 삭제합니다.

```javascript
removeClassStorage('sessions');
```

### 세션별 함수

세션 ID가 포함된 데이터를 다룰 때 사용합니다.

#### `getSessionClassStorageKey(baseKey, sessionId, classId)`
세션별 클래스 스토리지 키를 생성합니다.

```javascript
const key = getSessionClassStorageKey('session_posts', 'session123');
// 'session_posts_1학년_1반_session123'
```

#### `getSessionClassStorage(baseKey, sessionId, defaultValue, classId)`
세션별 클래스 데이터를 가져옵니다.

```javascript
// ❌ 잘못된 방법
const posts = JSON.parse(localStorage.getItem(`session_posts_${sessionId}`) || '[]');

// ✅ 올바른 방법
const posts = getSessionClassStorage('session_posts', sessionId, []);
```

#### `setSessionClassStorage(baseKey, sessionId, value, classId)`
세션별 클래스 데이터를 저장합니다.

```javascript
// ❌ 잘못된 방법
localStorage.setItem(`session_posts_${sessionId}`, JSON.stringify(posts));

// ✅ 올바른 방법
setSessionClassStorage('session_posts', sessionId, posts);
```

## 📝 사용 예시

### 예시 1: 세션 목록 저장/로드

```javascript
// 세션 목록 저장
function saveSessions(sessions) {
    setClassStorage('sessions', sessions);
}

// 세션 목록 로드
function loadSessions() {
    return getClassStorage('sessions', []);
}
```

### 예시 2: 공지사항 저장/로드

```javascript
// 공지사항 저장
function saveAnnouncements(announcements) {
    setClassStorage('announcements', announcements);
}

// 공지사항 로드
function loadAnnouncements() {
    return getClassStorage('announcements', []);
}
```

### 예시 3: 세션별 게시글 저장/로드

```javascript
// 세션별 게시글 저장
function saveSessionPosts(sessionId, posts) {
    setSessionClassStorage('session_posts', sessionId, posts);
}

// 세션별 게시글 로드
function loadSessionPosts(sessionId) {
    return getSessionClassStorage('session_posts', sessionId, []);
}
```

### 예시 4: Activity 메모 저장/로드

```javascript
// Activity 메모 저장
function saveActivityMemos(sessionId, memos) {
    // activity_memos_클래스ID_세션ID 형식
    const key = getSessionClassStorageKey('activity_memos', sessionId);
    setClassStorage(key.replace(`activity_memos_${getCurrentClassId()}_`, 'activity_memos_'), memos);
    // 또는 직접 키 생성
    const storageKey = `activity_memos_${getCurrentClassId()}_${sessionId}`;
    setClassStorage(storageKey, memos);
}

// Activity 메모 로드
function loadActivityMemos(sessionId) {
    const storageKey = `activity_memos_${getCurrentClassId()}_${sessionId}`;
    return getClassStorage(storageKey, []);
}
```

## ⚠️ 주의사항

### 1. 전역 데이터 사용 금지

```javascript
// ❌ 절대 이렇게 하지 마세요
localStorage.setItem('sessions', JSON.stringify(sessions));
localStorage.setItem('announcements', JSON.stringify(announcements));

// ✅ 항상 클래스별로 분리
setClassStorage('sessions', sessions);
setClassStorage('announcements', announcements);
```

### 2. 세션별 데이터도 클래스별로 분리

```javascript
// ❌ 잘못된 방법
localStorage.setItem(`session_posts_${sessionId}`, JSON.stringify(posts));

// ✅ 올바른 방법
setSessionClassStorage('session_posts', sessionId, posts);
```

### 3. 클래스 삭제 시 모든 데이터 삭제

```javascript
// 클래스 삭제 시
deleteAllClassData(classId);
```

## 🔍 기존 코드 마이그레이션

기존 코드를 클래스별 분리로 마이그레이션할 때:

1. `localStorage.getItem('key')` → `getClassStorage('key', defaultValue)`
2. `localStorage.setItem('key', value)` → `setClassStorage('key', value)`
3. `localStorage.getItem(\`key_${sessionId}\`)` → `getSessionClassStorage('key', sessionId, defaultValue)`
4. `localStorage.setItem(\`key_${sessionId}\`, value)` → `setSessionClassStorage('key', sessionId, value)`

## 📚 관련 파일

- `class-storage-utils.js`: 유틸리티 함수 정의
- `main-session.js`: 대시보드 및 세션 관리
- `activity.js`: Activity 게시글 관리
- `activity-session.js`: Activity 세션 메모 관리
- `ask-session.js`: Ask 세션 채팅 관리

## ✅ 체크리스트

새로운 기능을 추가할 때:

- [ ] `localStorage.getItem()` 대신 `getClassStorage()` 사용
- [ ] `localStorage.setItem()` 대신 `setClassStorage()` 사용
- [ ] 세션별 데이터는 `getSessionClassStorage()` / `setSessionClassStorage()` 사용
- [ ] 클래스 삭제 시 `deleteAllClassData()` 호출 확인
- [ ] 다른 클래스의 데이터에 접근하지 않는지 확인

