# AI ClassBoard - ClassBoard Design

교육용 통합 플랫폼으로, 교사와 학생이 실시간으로 수업, 활동, 토론, 평가를 수행할 수 있습니다.

## 주요 기능 상태

기능별로 현재 제공 범위와 구현 상태를 명시합니다. **모킹**은 UI 프로토타입 단계, **예정**은 아직 구현되지 않은 기능을 의미합니다.

| 기능 | 상태 | 설명 |
| --- | --- | --- |
| 🏠 Dashboard | 모킹 | 공지, 일정, 할 일 등의 위젯이 정적 데이터와 DOM 조작으로 시연됩니다. 실시간 데이터 연동은 아직 없습니다. |
| 💡 Activity (Padlet형) | 예정 | Firestore 기반 실시간 협업 보드를 목표로 하나, 현재는 UI 레이아웃과 네비게이션만 제공됩니다. |
| 💬 Ask (Slido형) | 예정 | 실시간 Q&A 및 좋아요 정렬 기능은 로드맵 단계입니다. 현 시점에서는 링크 전환과 테이블 UI만 확인할 수 있습니다. |
| ☁️ Cloud | 예정 | WordCloud 시각화는 데모용 자리표시자이며, 실제 데이터 분석 로직은 미구현 상태입니다. |
| 🧠 Quiz | 예정 | 자동 채점, AI 연동 기능은 계획 단계로, 문제 템플릿 UI만 제공됩니다. |
| 📂 Materials | 예정 | 자료 업로드/다운로드 UI만 존재하며 Firebase Storage 연동은 아직 준비 중입니다. |
| ⚙️ Settings | 예정 | 외부 서비스 연동 및 환경 설정은 설계 단계이며, 기본 폼 UI만 제공됩니다. |

## 현재 제공되는 최소 기능

- 정적 HTML/CSS 기반의 교실 대시보드 레이아웃과 반응형 네비게이션
- 단일 브라우저 세션 내에서 작동하는 기본 UI 인터랙션 (사이드바 토글, 모달 열기/닫기 등)
- 교사용/학습자용 화면 흐름을 검증하기 위한 목업 데이터와 화면 전환 데모

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting / Vercel
- **Visualization**: Chart.js, WordCloud2.js
- **AI**: OpenAI / Gemini API

## 설치 및 실행

### 1. Firebase 프로젝트 설정

1. Firebase Console에서 새 프로젝트 생성
2. Firestore Database 활성화
3. Storage 활성화
4. 웹 앱 추가 후 설정 복사

### 2. Firebase 설정 추가

`index.html` 파일의 Firebase 설정 부분에 실제 프로젝트 정보 입력:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Firestore 보안 규칙 설정

Firebase Console에서 Firestore 보안 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if true; // 프로덕션에서는 인증 추가
    }
  }
}
```

### 4. Storage 보안 규칙 설정

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{allPaths=**} {
      allow read: if true;
      allow write: if true; // 프로덕션에서는 인증 추가
    }
  }
}
```

### 5. 로컬 실행

```bash
# HTTP 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js
npx http-server

# 브라우저에서 접속
http://localhost:8000
```

### 6. 배포

#### Firebase Hosting

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화
firebase init hosting

# 배포
firebase deploy --only hosting
```

#### Vercel

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

## 디자인 시스템

### 색상

- `--light`: #F9F9F9
- `--blue`: #3C91E6
- `--yellow`: #FFCE26
- `--orange`: #FD7238
- `--grey`: #EEE
- `--dark`: #342E37
- `--red`: #DB504A

### 폰트

- **메인**: Poppins
- **보조**: Lato

### 주요 특징

- 카드형 레이아웃
- 부드러운 전환 효과
- 반응형 디자인
- 다크 모드 지원
- 직관적인 UX

## 프로젝트 구조

```
education dashboard/
├── index.html          # 메인 HTML
├── style.css           # 스타일시트
├── script.js           # 메인 JavaScript
├── activity.js         # Activity 페이지 JavaScript
└── README.md           # 문서
```

## 사용자 역할

- 👩‍🏫 **교사**: 수업 설계, 자료 관리, 평가
- 🧑‍🎓 **학습자**: 실시간 참여, 토론, 과제 제출
- 👨‍💼 **관리자**: 시스템 관리

## 로드맵

### 1단계 (MVP 안정화)
- [ ] Firebase Authentication으로 교사/학생 로그인 분리
- [ ] Firestore 컬렉션 구조 설계 및 대시보드 기본 데이터 연동
- [ ] Cloud Storage 연동으로 자료 업로드/다운로드 기본 기능 구현
- [ ] 기본 활동/질문 생성 및 조회 기능을 Firestore와 연동하여 실사용 검증

### 2단계 (실시간 협업 고도화)
- [ ] Activity 보드의 실시간 동기화 및 멀티미디어 업로드 안정화
- [ ] Ask 모듈에 질문 추천/좋아요 정렬 및 발표자 모드 추가
- [ ] Cloud 모듈에 실시간 워드클라우드 생성 파이프라인 구축
- [ ] 통합 알림 센터(공지/활동/질문) 도입 및 대시보드 위젯 연동

### 3단계 (AI 어시스턴트 도입)
- [ ] 과제/퀴즈 자동 채점 로직에 LLM 기반 피드백 추가
- [ ] 세션 요약, 학습 리마인더 등 AI 생성 콘텐츠 기능 제공
- [ ] 질문 응답 지원을 위한 챗봇/코파일럿 인터페이스 연결
- [ ] AI 사용 로그 및 품질 측정 지표 정의

### 4단계 (분석 및 모바일 확장)
- [ ] 학습 성과 대시보드 및 활동 히트맵 시각화 구현
- [ ] 학급/학교 단위 데이터 익명화 및 리포트 생성 도구 개발
- [ ] PWA 기반 모바일 앱 패키징 및 오프라인 지원 강화
- [ ] 접근성 및 국제화(i18n) 개선 작업 수행

각 단계 완료 시점마다 세부 마일스톤을 검증하고, QA 체크리스트와 사용자 피드백을 수집하여 다음 단계 계획에 반영합니다.

## 문서 및 미디어 업데이트 원칙

- 신규 기능이 배포되면 README의 기능 상태 표와 최소 기능 목록을 즉시 갱신합니다.
- CHANGELOG에 버전별 변경 내역과 주요 이슈 링크를 기록합니다.
- 시각적 신뢰도를 높이기 위해 스크린샷·GIF·데모 링크를 업데이트하고, 주요 사용자 흐름을 단계별로 캡처합니다.
- 문서/미디어 업데이트는 기능 개발 완료 후 코드 리뷰와 동시에 진행하여 정보 비대칭을 최소화합니다.

## 라이선스

MIT License

## 기여

이슈와 풀 리퀘스트를 환영합니다!

