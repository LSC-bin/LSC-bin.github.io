# 마이그레이션 노트

## 파일 구조

### 기존 프로토타입 (현재 사용 중)
- `index.html` - 기존 프로토타입 로그인 페이지
- `index.js` - 기존 프로토타입 JavaScript
- `index.css` - 기존 프로토타입 스타일

### 새 React 구조 (리팩터링 버전)
- `index-react.html` - React 앱용 HTML (Vite 개발 서버에서 사용)
- `src/` - React 컴포넌트 및 모듈
- `src/main.tsx` - React 앱 진입점

## 사용 방법

### 기존 프로토타입 사용 (현재)
브라우저에서 `index.html`을 직접 열거나 정적 서버로 제공:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

### 새 React 구조 사용 (리팩터링 버전)
```bash
npm install
npm run dev
```
그러면 `index-react.html`이 자동으로 사용됩니다 (Vite 설정).

## 마이그레이션 전략

1. **현재**: 기존 프로토타입(`index.html`) 계속 사용
2. **점진적 마이그레이션**: 새 페이지를 하나씩 React로 변환
3. **완전 전환**: 모든 페이지 마이그레이션 후 `index.html`을 `index-react.html`로 교체

## 주의사항

- 기존 프로토타입과 새 React 구조는 **병행 운영** 가능
- `index.html`은 기존 프로토타입용으로 복원됨
- `index-react.html`은 새 React 앱용 (Vite가 자동으로 사용)

