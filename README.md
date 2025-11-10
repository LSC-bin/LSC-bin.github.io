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

- **Frontend**: HTML5, SCSS, JavaScript (ES6)
- **Build Tooling**: Vite, ESLint, Prettier, Jest
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting / Vercel
- **Visualization**: Chart.js, WordCloud2.js
- **AI**: OpenAI / Gemini API

### 🔐 AI API 키 관리

- 개발 환경(`npm run dev`)에서는 `/utils/mock-ai.js`가 제공하는 더미 응답을 통해 프런트엔드 흐름을 확인합니다.
- 실제 배포 시에는 백엔드 프록시(`/api/ai/chat`)에서 서버 환경 변수로 AI API 키를 주입해 호출하도록 구성하세요. 프런트엔드 번들에는 키를 직접 포함하지 않습니다.

## 설치 및 실행

### 1. Firebase 프로젝트 설정

1. Firebase Console에서 새 프로젝트 생성
2. Firestore Database 활성화
3. Storage 활성화
4. 웹 앱 추가 후 설정 복사

### 2. Firebase 설정 추가

`main-session.html` 파일의 Firebase 설정 부분에 실제 프로젝트 정보 입력:

```javascript
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
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

### 5. 개발 환경 준비

프로젝트 루트에는 `.nvmrc`가 포함되어 있으며 Node.js 18 LTS를 사용합니다.

```bash
# nvm을 사용하는 경우
nvm install
nvm use

# asdf를 사용하는 경우 (.tool-versions 지원)
asdf install
```

### 6. 의존성 설치 및 스크립트

```bash
npm install       # 패키지 설치
npm run dev       # Vite 개발 서버 (http://localhost:5173)
npm run lint      # ESLint + Prettier 검사
npm run test      # Jest 단위 테스트 (테스트가 없으면 통과)
npm run build     # 정적 자산 번들링 (dist/)
```

### 7. 배포

`npm run build` 실행 후 생성되는 `dist/` 폴더를 배포 대상에 업로드합니다.

#### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

#### Vercel

```bash
npm install -g vercel
vercel --prod
```

## 디자인 시스템

### 디자인 토큰

`styles/_tokens.scss` 파일은 공통 색상, 그림자, 간격, 폰트 등을 SCSS 변수로 정의하고 `:root` 커스텀 프로퍼티로 노출합니다. 대표적인 토큰은 다음과 같습니다.

- `--color-primary`: #3C91E6 (주요 포인트 컬러)
- `--color-secondary`: #845EF7 (보조 포인트 컬러)
- `--color-accent`: #FD7238 (강조 컬러)
- `--color-background`: #F5F7FB (기본 배경)
- `--color-surface`: #FFFFFF (카드/패널 배경)
- `--shadow-soft`: 0 8px 32px 0 rgba(31, 38, 135, 0.1)
- `--spacing-lg`: 1.5rem, `--radius-lg`: 16px 등 간격/모서리 값

### SCSS 믹스인

`styles/_mixins.scss`에는 공통 레이아웃과 효과를 위한 믹스인이 포함되어 있습니다.

- `glass-panel`: 글래스모피즘 배경/보더/그림자를 한번에 적용
- `flex-stack`: 반복되는 flex 레이아웃(방향/정렬/간격) 정의
- `card-surface`: 카드형 패널의 배경, 그림자, 패딩 적용
- `text-gradient`: 그라디언트 텍스트 효과

모든 페이지 SCSS는 필요한 토큰과 믹스인을 불러와 재사용합니다.

## 프로젝트 구조

```
LSC-bin.github.io/
├── activity-session.html
├── activity-session.scss
├── ask-session.html
├── ask-session.scss
├── chat.html
├── chat.scss
├── index.html
├── index.js
├── main-session.html
├── main-session.js
├── style.scss
├── session.html
├── session.scss
├── styles/
│   ├── _mixins.scss
│   └── _tokens.scss
├── vite.config.js
├── eslint.config.js
├── jest.config.cjs
├── package.json
├── .nvmrc
└── .github/workflows/ci.yml
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

