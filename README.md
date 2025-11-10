# AI ClassBoard - ClassBoard Design

교육용 통합 플랫폼으로, 교사와 학생이 실시간으로 수업, 활동, 토론, 평가를 수행할 수 있습니다.

## 주요 기능

### 🏠 Dashboard
- 공지사항, 빠른 링크, 과제 현황, 오늘의 수업을 2×2 그리드로 구성
- 최근 활동 실시간 표시

### 💡 Activity (Padlet형)
- 실시간 협업 게시판
- Firebase Firestore 실시간 동기화
- 이미지 업로드 및 미리보기
- 좋아요 및 댓글 기능
- 자유로운 게시글 배치

### 💬 Ask (Slido형)
- 실시간 Q&A
- 좋아요 정렬
- 교사 답변 시스템

### ☁️ Cloud
- WordCloud 시각화
- 실시간 단어 빈도 분석

### 🧠 Quiz
- 자동 채점형 문제
- AI 채점 및 난이도 조정

### 📂 Materials
- 자료 업로드 및 다운로드
- Firebase Storage 기반

### ⚙️ Settings
- Classroom·Padlet 연동 관리
- 환경 설정

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

- [ ] Firebase Authentication 통합
- [ ] AI 피드백 기능
- [ ] AI 요약 기능
- [ ] 통계 대시보드
- [ ] 모바일 앱 (PWA)

## 라이선스

MIT License

## 기여

이슈와 풀 리퀘스트를 환영합니다!

