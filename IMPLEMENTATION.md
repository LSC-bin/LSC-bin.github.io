# AI ClassBoard - 전체 구현 내용 정리

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [주요 기능](#주요-기능)
5. [데이터 모델](#데이터-모델)
6. [인증 및 권한 관리](#인증-및-권한-관리)
7. [서비스 계층](#서비스-계층)
8. [프론트엔드 구현](#프론트엔드-구현)
9. [상태 관리](#상태-관리)
10. [개발 환경 설정](#개발-환경-설정)
11. [테스트](#테스트)
12. [배포 및 운영](#배포-및-운영)

---

## 프로젝트 개요

**AI ClassBoard**는 실시간 수업 참여와 협업을 지원하는 교육용 통합 대시보드입니다. 교사, 학생, 관리자 역할에 맞춘 워크플로우를 한 곳에서 운영할 수 있도록 설계되었습니다.

### 핵심 컨셉
- **통합 환경**: 수업, 활동, 소통, 평가를 하나의 플랫폼에서 제공
- **역할 기반 접근**: 교사, 학생, 보조 교사, 관리자별 맞춤 인터페이스
- **실시간 협업**: Padlet형 활동 보드, Slido형 Q&A, 실시간 채팅
- **AI 통합**: 통계 요약, 피드백 생성 (향후 확장 예정)

---

## 기술 스택

### 프론트엔드
- **프레임워크**: React 19.2.0
- **빌드 도구**: Vite 7.2.2
- **언어**: TypeScript 5.9.3
- **스타일링**: TailwindCSS 3.4.14
- **라우팅**: React Router DOM 7.9.5
- **상태 관리**:
  - React Query (@tanstack/react-query) 5.90.7 - 서버 상태 관리
  - Zustand 5.0.8 - 클라이언트 상태 관리
- **UI 라이브러리**:
  - @dnd-kit/core, @dnd-kit/sortable - 드래그 앤 드롭
  - Sonner 2.0.7 - 토스트 알림
- **검증**: Zod 4.1.12

### 백엔드 / 인프라
- **인증**: Firebase Authentication
- **데이터베이스**: Cloud Firestore
- **스토리지**: Firebase Storage
- **호스팅**: Firebase Hosting (또는 Vercel)
- **에뮬레이터**: Firebase Emulator Suite

### 개발 도구
- **테스트**: Vitest 2.1.8, Testing Library
- **린터**: ESLint 9.39.1
- **포맷터**: Prettier 3.6.2
- **타입 체크**: TypeScript

---

## 프로젝트 구조

```
education dashboard/
├── apps/web/                          # React SPA 애플리케이션
│   ├── src/
│   │   ├── components/                # 재사용 가능한 컴포넌트
│   │   │   ├── common/                # 공통 컴포넌트
│   │   │   │   ├── EmptyState.tsx    # 빈 상태 표시
│   │   │   │   └── Skeleton.tsx       # 로딩 스켈레톤
│   │   │   └── layout/                # 레이아웃 컴포넌트
│   │   │       ├── AppShell.tsx       # 앱 셸 레이아웃
│   │   │       └── AuthControls.tsx   # 인증 컨트롤
│   │   ├── pages/                     # 페이지 컴포넌트
│   │   │   ├── LandingPage.tsx        # 랜딩 페이지
│   │   │   ├── TeacherOverview.tsx    # 교사 대시보드
│   │   │   ├── StudentOverview.tsx    # 학생 참여 화면
│   │   │   └── AnalyticsOverview.tsx  # 통계 및 모니터링
│   │   ├── services/                  # 비즈니스 로직 계층
│   │   │   ├── auth-service.ts        # 인증 서비스
│   │   │   ├── classrooms-service.ts  # 클래스 관리
│   │   │   ├── activity-service.ts   # 활동/질문/채팅
│   │   │   ├── ai-service.ts         # AI 통합 (프리뷰)
│   │   │   ├── dashboard-widgets-service.ts  # 위젯 설정
│   │   │   └── firebase/             # Firebase 래퍼
│   │   ├── hooks/                     # 커스텀 훅
│   │   │   ├── use-auth.ts           # 인증 훅
│   │   │   ├── use-classrooms.ts     # 클래스 관리 훅
│   │   │   ├── use-activity.ts       # 활동 관련 훅
│   │   │   ├── use-analytics.ts      # 통계 훅
│   │   │   └── use-dashboard-widgets.ts  # 위젯 관리 훅
│   │   ├── stores/                    # Zustand 스토어
│   │   │   ├── auth-store.ts         # 인증 상태
│   │   │   └── ui-store.ts           # UI 상태 (선택된 클래스/세션)
│   │   ├── types/                     # TypeScript 타입 정의
│   │   │   ├── user.ts               # 사용자 타입
│   │   │   └── classroom.ts          # 클래스/세션 타입
│   │   ├── config/                    # 설정 파일
│   │   │   ├── firebase.ts           # Firebase 초기화
│   │   │   └── env.ts                # 환경 변수
│   │   ├── lib/                       # 유틸리티 라이브러리
│   │   │   ├── firebase/             # Firebase 래퍼
│   │   │   ├── logger.ts             # 로깅 유틸
│   │   │   └── navigation.ts         # 네비게이션 유틸
│   │   └── providers/                # React 컨텍스트 프로바이더
│   │       ├── app-providers.tsx     # 앱 전체 프로바이더
│   │       └── auth-sync.tsx         # 인증 동기화
│   ├── scripts/
│   │   └── seed-firestore.ts         # Firestore 시드 스크립트
│   ├── public/
│   │   ├── sw.js                      # 서비스 워커 (PWA)
│   │   └── manifest.webmanifest      # PWA 매니페스트
│   └── package.json
├── docs/                              # 프로젝트 문서
│   ├── current-implementation.md
│   ├── architecture-and-pipeline-plan.md
│   ├── data-and-auth-plan.md
│   └── ...
└── README.md
```

---

## 주요 기능

### 1. 교사 대시보드 (Teacher Overview)

#### 대시보드 위젯 시스템
- **커스터마이징 가능한 위젯 레이아웃**
  - Drag & Drop으로 위젯 순서 변경
  - 위젯 숨김/표시 토글
  - 위젯 크기 조정 (Small, Medium, Large)
  - 설정 저장 및 복원
  - 기본 레이아웃으로 복원 기능

#### 기본 위젯

##### 현재 표시되는 위젯 (5개)

1. **Announcements (공지사항)** - `announcements`
   - **위젯 ID**: `announcements`
   - **기본 표시**: 예
   - **크기**: Medium
   - **아이콘**: `bx bxs-bullhorn`
   - **색상**: Blue (`var(--blue)`)
   - **기능**:
     - 최근 공지사항 목록 표시
     - 날짜별 정렬 및 표시
     - 공지 개수 배지 표시 (`announcement-count`)
     - "공지 작성" 버튼으로 새 공지 작성 모달 열기
     - "전체보기" 버튼으로 모든 공지사항 모달 열기
     - "전체 삭제" 버튼으로 모든 공지 삭제
     - 빈 상태 메시지 표시 (공지가 없을 때)
   - **데이터 저장**: localStorage 기반
   - **커스터마이징**: 순서 변경, 숨기기, 크기 조정 가능

2. **Quick Links (빠른 링크)** - `quickLinks`
   - **위젯 ID**: `quickLinks`
   - **기본 표시**: 예
   - **크기**: Medium
   - **아이콘**: `bx bxs-zap`
   - **색상**: Orange (`var(--orange)`)
   - **기능**:
     - 주요 기능 페이지로 빠른 이동 링크 제공
     - Activity 페이지 이동 (주황색 아이콘)
     - Chat 페이지 이동 (파란색 아이콘)
     - Materials 페이지 이동 (노란색 아이콘)
     - Quiz 페이지 이동 (빨간색 아이콘)
     - 각 링크는 `switchPage()` 함수를 통해 페이지 전환
   - **커스터마이징**: 순서 변경, 숨기기, 크기 조정 가능

3. **Assignment Progress (과제 현황)** - `assignments`
   - **위젯 ID**: `assignments`
   - **기본 표시**: 예
   - **크기**: Medium
   - **아이콘**: `bx bxs-clipboard`
   - **색상**: Red (`var(--red)`)
   - **기능**:
     - 과제 제출 진행률 시각화 (프로그레스 바)
     - 제출 완료 통계 표시 (예: 28/35)
     - 과제 목록 표시:
       - 과제 제목
       - 마감일까지 남은 일수 (D-day 표시)
       - 우선순위 표시 (색상별 원 아이콘)
     - "전체보기" 링크로 상세 페이지 이동
   - **커스터마이징**: 순서 변경, 숨기기, 크기 조정 가능

4. **Today's Sessions (오늘의 수업)** - `todayClasses`
   - **위젯 ID**: `todayClasses`
   - **기본 표시**: 예
   - **크기**: Large
   - **아이콘**: `bx bxs-calendar`
   - **색상**: Blue (`var(--blue)`)
   - **기능**:
     - 오늘 날짜 표시 (예: 2025년 1월 15일)
     - 오늘 예정된 수업 목록 표시:
       - 수업 시간 배지 (시간별 색상 구분)
       - 수업 제목
       - 수업 장소 (온라인/오프라인)
       - 수업 상태 배지 (진행 중, 예정)
     - "전체보기" 링크로 상세 페이지 이동
   - **커스터마이징**: 순서 변경, 숨기기 가능 (크기 조정은 Large 고정)

5. **Create Session (오늘의 수업 만들기)** - `createSession`
   - **위젯 ID**: `createSession`
   - **기본 표시**: 예
   - **크기**: Medium
   - **아이콘**: `bx bx-plus-circle`
   - **색상**: Blue (`var(--blue)`)
   - **기능**:
     - 새로운 수업 세션 생성 버튼 제공
     - "수업 만들기" 버튼 클릭 시 `create-session.html`로 이동
     - 위젯 내부에 설명 텍스트 및 아이콘 표시
     - 다크 모드 지원
   - **커스터마이징**: 순서 변경, 숨기기, 크기 조정 가능

##### 숨겨진 위젯 (2개) - 편집 모드에서 추가 가능

6. **Attendance (출석 현황)** - `attendance`
   - **위젯 ID**: `attendance`
   - **기본 표시**: 아니오 (숨김)
   - **크기**: Medium
   - **아이콘**: `bx bxs-user-check`
   - **색상**: Yellow (`var(--yellow)`)
   - **기능**:
     - 클래스별 출석률 통계 표시:
       - 전체 출석률 (예: 92%)
       - 지각 학생 수 (예: 3명)
       - 결석 학생 수 (예: 2명)
     - 클래스별 출석 현황 목록:
       - 클래스명
       - 출석 상태 (출석/결석)
       - 출석 인원 수
     - 실시간 출석 데이터 연동 (향후 구현)
   - **추가 방법**: 위젯 편집 모드에서 "위젯 추가하기" 섹션에서 선택
   - **커스터마이징**: 순서 변경, 숨기기, 크기 조정 가능

7. **AI Summary (AI 인사이트)** - `aiSummary`
   - **위젯 ID**: `aiSummary`
   - **기본 표시**: 아니오 (숨김)
   - **크기**: Medium
   - **아이콘**: `bx bx-bot`
   - **색상**: Gradient (보라색 그라데이션 `linear-gradient(135deg, #6f86ff, #9d7bff)`)
   - **기능**:
     - AI 기반 수업 인사이트 요약 제공:
       - 학생 질문 분석 및 추천 사항
       - 활동 통계 및 트렌드 분석
       - 채팅 키워드 추출 및 표시
     - 인사이트 항목별 아이콘 표시:
       - 체크 아이콘: 추천 사항
       - 트렌드 아이콘: 통계 분석
       - 메시지 아이콘: 키워드 분석
     - 마지막 업데이트 시간 표시
     - 향후 OpenAI/Gemini API 연동 예정
   - **추가 방법**: 위젯 편집 모드에서 "위젯 추가하기" 섹션에서 선택
   - **커스터마이징**: 순서 변경, 숨기기, 크기 조정 가능

##### 위젯 시스템 공통 기능

- **위젯 편집 모드**:
  - 대시보드 상단의 자물쇠 아이콘 토글로 편집 모드 활성화
  - 편집 모드에서 각 위젯에 편집 컨트롤 표시
  - 드래그 앤 드롭으로 위젯 순서 변경
  - "숨기기" 버튼으로 위젯 숨김
  - 크기 조절 핸들로 위젯 크기 변경 (Small, Medium, Large)
  
- **위젯 설정 저장**:
  - 위젯 순서, 표시/숨김 상태, 크기 설정이 localStorage에 저장
  - 저장 키: `classboard-widget-preferences-v1`
  - 클래스별로 다른 설정 저장 가능 (향후 구현)

- **숨겨진 위젯 관리**:
  - 편집 모드에서 "숨겨둔 위젯" 패널 표시
  - 숨겨진 위젯 목록에서 클릭하여 다시 추가 가능
  - "위젯 추가하기" 섹션에서 사용 가능한 위젯 목록 표시

##### 위젯 추가 가이드

새로운 위젯을 추가하려면 다음 가이드를 참조하세요:

📚 **상세 가이드**: `WIDGET_ADD_GUIDE.md` 파일을 참조하세요.

**빠른 시작:**

1. `main-session.js`의 `WIDGET_LIBRARY` 객체에 위젯 정의 추가
2. `buildContent` 함수로 위젯 콘텐츠 생성
3. 필요시 CSS 스타일 추가

**기본 템플릿:**

```javascript
yourWidgetId: {
    title: '위젯 제목',
    icon: 'bx bx-icon-name',      // Boxicons 아이콘
    accent: 'var(--blue)',         // 아이콘 배경색
    defaultSize: 'medium',         // 'small', 'medium', 'large'
    defaultVisible: false,         // 기본 표시 여부
    allowAdd: true,                // 편집 모드에서 추가 가능
    buildContent: (card) => {
        // 위젯 콘텐츠 생성 로직
        const container = document.createElement('div');
        container.innerHTML = '<p>위젯 콘텐츠</p>';
        card.appendChild(container);
    }
}
```

**헬퍼 함수 사용:**

```javascript
// addWidget 함수로 위젯 추가
addWidget('myWidget', {
    title: '내 위젯',
    icon: 'bx bx-star',
    accent: 'var(--blue)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        card.innerHTML = '<p>위젯 콘텐츠</p>';
    }
});
```

자세한 내용은 `WIDGET_ADD_GUIDE.md`를 참조하세요.

##### 추천 위젯 (향후 추가 가능)

다음 위젯들은 교육 플랫폼의 효율성을 높이고 교사/학생의 사용성을 개선할 수 있는 추천 위젯입니다:

1. **Recent Activity (최근 활동)** - `recentActivity`
   - **우선순위**: 높음
   - **크기**: Medium/Large
   - **아이콘**: `bx bx-time-five` 또는 `bx bx-history`
   - **색상**: Green (`var(--green)`) 또는 Purple
   - **기능**:
     - 최근 24시간/7일간의 활동 요약
     - Activity 게시물, 질문, 채팅 메시지 통계
     - 시간대별 활동 그래프 (막대 그래프 또는 라인 차트)
     - 가장 활발한 시간대 표시
     - 클릭 시 상세 활동 페이지로 이동
   - **데이터 소스**: Firestore의 activityPosts, askQuestions, chatMessages 컬렉션
   - **사용 사례**: 교사가 수업 참여도를 한눈에 파악

2. **Student Engagement (학생 참여도)** - `studentEngagement`
   - **우선순위**: 높음
   - **크기**: Medium
   - **아이콘**: `bx bx-trending-up` 또는 `bx bx-bar-chart-alt-2`
   - **색상**: Teal 또는 Cyan
   - **기능**:
     - 클래스별 평균 참여도 점수 (0-100%)
     - 참여도가 높은/낮은 학생 Top 5
     - 주간 참여도 트렌드 (증가/감소)
     - 참여도 기준: 게시물 작성, 질문, 채팅, 퀴즈 응답 등
     - 개별 학생 상세 보기 링크
   - **데이터 소스**: 학생별 활동 데이터 집계
   - **사용 사례**: 교사가 학생들의 수업 참여 수준을 모니터링

3. **Quick Stats (빠른 통계)** - `quickStats`
   - **우선순위**: 중간
   - **크기**: Small/Medium
   - **아이콘**: `bx bx-stats` 또는 `bx bx-line-chart`
   - **색상**: Indigo 또는 Blue-Gray
   - **기능**:
     - 오늘의 핵심 지표를 카드 형태로 표시:
       - 오늘 작성된 게시물 수
       - 오늘 등록된 질문 수
       - 오늘 전송된 채팅 수
       - 오늘 제출된 과제 수
     - 전일 대비 증감률 표시 (↑/↓ 아이콘)
     - 각 통계 클릭 시 상세 페이지로 이동
   - **데이터 소스**: 실시간 Firestore 쿼리
   - **사용 사례**: 교사가 하루 활동을 빠르게 확인

4. **Calendar Widget (일정 캘린더)** - `calendar`
   - **우선순위**: 중간
   - **크기**: Medium/Large
   - **아이콘**: `bx bx-calendar-check` 또는 `bx bx-calendar-event`
   - **색상**: Orange 또는 Red
   - **기능**:
     - 월별/주별 캘린더 뷰
     - 수업 일정, 과제 마감일, 이벤트 표시
     - 오늘 날짜 하이라이트
     - 다가오는 일정 3-5개 미리보기
     - 일정 클릭 시 상세 정보 모달
     - 새 일정 추가 버튼
   - **데이터 소스**: sessions 컬렉션의 date 필드, assignments 컬렉션
   - **사용 사례**: 교사와 학생이 수업 일정을 한눈에 확인

5. **Notifications Center (알림 센터)** - `notifications`
   - **우선순위**: 높음
   - **크기**: Medium
   - **아이콘**: `bx bx-bell` 또는 `bx bx-notification`
   - **색상**: Red 또는 Orange
   - **기능**:
     - 미확인 알림 개수 배지 표시
     - 최근 알림 목록 (최대 5개):
       - 새 공지사항
       - 과제 마감 임박
       - 질문에 답변 달림
       - 새 과제 등록
       - 세션 시작 알림
     - 알림 타입별 아이콘 및 색상 구분
     - "모두 읽음" 버튼
     - "전체 보기" 링크
   - **데이터 소스**: notifications 컬렉션 또는 실시간 이벤트
   - **사용 사례**: 교사와 학생이 중요한 업데이트를 놓치지 않도록

6. **Popular Posts (인기 게시물)** - `popularPosts`
   - **우선순위**: 낮음
   - **크기**: Medium
   - **아이콘**: `bx bx-star` 또는 `bx bx-like`
   - **색상**: Yellow 또는 Gold
   - **기능**:
     - 좋아요 수가 많은 게시물 Top 5
     - 각 게시물의 좋아요 수, 댓글 수 표시
     - 게시물 미리보기 (제목, 작성자, 작성일)
     - 클릭 시 해당 게시물로 이동
     - 주간/월간 인기 게시물 필터
   - **데이터 소스**: activityPosts 컬렉션의 likes 배열
   - **사용 사례**: 학생들이 인기 있는 토론 주제를 쉽게 발견

7. **Learning Progress (학습 진행률)** - `learningProgress`
   - **우선순위**: 중간
   - **크기**: Large
   - **아이콘**: `bx bx-trophy` 또는 `bx bx-award`
   - **색상**: Purple 또는 Gradient
   - **기능**:
     - 클래스 평균 학습 진행률 (원형 프로그레스)
     - 학생별 진행률 막대 그래프
     - 완료한 세션 수 / 전체 세션 수
     - 완료한 퀴즈 수 / 전체 퀴즈 수
     - 학습 목표 달성률
     - 개별 학생 상세 보기
   - **데이터 소스**: 학생별 세션 완료, 퀴즈 완료 데이터
   - **사용 사례**: 교사가 학생들의 학습 진도를 추적

8. **Live Activity (실시간 활동)** - `liveActivity`
   - **우선순위**: 낮음
   - **크기**: Small/Medium
   - **아이콘**: `bx bx-radar` 또는 `bx bx-pulse`
   - **색상**: Green 또는 Cyan
   - **기능**:
     - 현재 활성 사용자 수 표시
     - 실시간 활동 피드 (최근 5분간):
       - "학생A가 게시물을 작성했습니다"
       - "학생B가 질문을 등록했습니다"
     - 활동 타입별 아이콘 표시
     - 자동 새로고침 (5초 간격)
   - **데이터 소스**: Firestore 실시간 리스너
   - **사용 사례**: 교사가 수업 중 실시간 참여 상황을 모니터링

9. **File Upload Status (파일 업로드 현황)** - `fileUploads`
   - **우선순위**: 낮음
   - **크기**: Small/Medium
   - **아이콘**: `bx bx-cloud-upload` 또는 `bx bx-file`
   - **색상**: Blue 또는 Teal
   - **기능**:
     - 최근 업로드된 파일 목록 (최대 5개)
     - 파일명, 업로드자, 업로드 시간
     - 파일 타입별 아이콘 (이미지, PDF, 문서 등)
     - 파일 크기 표시
     - 클릭 시 파일 다운로드 또는 미리보기
   - **데이터 소스**: Firebase Storage 메타데이터, materials 컬렉션
   - **사용 사례**: 교사가 최근 업로드된 자료를 빠르게 확인

10. **Grade Distribution (성적 분포)** - `gradeDistribution`
    - **우선순위**: 중간
    - **크기**: Medium
    - **아이콘**: `bx bx-bar-chart-square` 또는 `bx bx-pie-chart-alt-2`
    - **색상**: Indigo 또는 Purple
    - **기능**:
      - 과제/퀴즈별 평균 점수
      - 점수 분포 히스토그램 (A, B, C, D, F)
      - 클래스 평균 vs 개인 평균 비교
      - 최고/최저 점수 표시
      - 시간에 따른 성적 트렌드 그래프
    - **데이터 소스**: quiz 결과, assignment 제출 데이터
    - **사용 사례**: 교사가 학생들의 학습 성과를 분석

11. **Upcoming Deadlines (다가오는 마감일)** - `upcomingDeadlines`
    - **우선순위**: 높음
    - **크기**: Medium
    - **아이콘**: `bx bx-time` 또는 `bx bx-alarm`
    - **색상**: Red 또는 Orange
    - **기능**:
      - 마감일이 임박한 과제/이벤트 목록 (7일 이내)
      - D-day 표시 (D-3, D-1 등)
      - 우선순위별 색상 구분 (빨강: 긴급, 주황: 주의)
      - 마감일이 지난 항목 표시
      - 각 항목 클릭 시 상세 페이지로 이동
    - **데이터 소스**: assignments 컬렉션의 dueDate 필드
    - **사용 사례**: 학생과 교사가 마감일을 놓치지 않도록

12. **Class Performance (클래스 성과)** - `classPerformance`
    - **우선순위**: 중간
    - **크기**: Large
    - **아이콘**: `bx bx-trending-up` 또는 `bx bx-line-chart-down`
    - **색상**: Gradient (Blue to Green)
    - **기능**:
      - 주간/월간 클래스 성과 요약
      - 참여도, 과제 완료율, 평균 점수 통합 지표
      - 전주/전월 대비 성과 비교
      - 성과 트렌드 라인 차트
      - 개선 영역 및 강점 영역 표시
    - **데이터 소스**: 여러 데이터 소스 집계
    - **사용 사례**: 교사가 클래스 전체의 학습 성과를 종합적으로 파악

##### 위젯 우선순위 가이드

**즉시 구현 추천 (High Priority):**
- Recent Activity (최근 활동)
- Student Engagement (학생 참여도)
- Notifications Center (알림 센터)
- Upcoming Deadlines (다가오는 마감일)

**단기 구현 추천 (Medium Priority):**
- Quick Stats (빠른 통계)
- Calendar Widget (일정 캘린더)
- Learning Progress (학습 진행률)
- Grade Distribution (성적 분포)
- Class Performance (클래스 성과)

**장기 구현 추천 (Low Priority):**
- Popular Posts (인기 게시물)
- Live Activity (실시간 활동)
- File Upload Status (파일 업로드 현황)

#### 세션 관리
- **세션 생성**: 제목, 차시 번호, 날짜, 개요 입력
- **세션 목록**: 클래스별 세션 조회 및 선택
- **세션 상태 관리**: draft → live → archived 전환

#### 클래스 관리
- 클래스 선택 드롭다운
- 클래스별 구성원 조회
- 권한 기반 접근 제어

### 2. 학생 참여 화면 (Student Overview)

#### Padlet형 활동 보드
- **게시물 작성**
  - 텍스트 입력
  - 이미지 첨부 (다중 파일 지원)
  - Firebase Storage에 자동 업로드
- **게시물 조회**
  - 실시간 업데이트 (Firestore onSnapshot)
  - 작성자, 작성 시간 표시
  - 이미지 미리보기

#### 실시간 Q&A (Slido형)
- **질문 등록**: 학생이 질문 작성
- **질문 목록**: 좋아요 수 기준 정렬 (향후 구현)
- **실시간 동기화**: Firestore 실시간 리스너

#### 실시간 채팅
- **메시지 전송**: 텍스트 기반 채팅
- **메시지 목록**: 작성자별 구분 표시
- **실시간 업데이트**: 새 메시지 자동 반영

#### 클래스/세션 선택
- 클래스 선택 드롭다운
- 세션 선택 드롭다운
- URL 파라미터로 상태 동기화 (`?classId=xxx&sessionId=yyy`)

### 3. 통계 및 모니터링 (Analytics Overview)

#### 핵심 지표 카드
- **전체 학급 수**: Firestore에 등록된 클래스 수
- **전체 세션 수**: 모든 클래스의 세션 합계
- **활동 게시물**: Padlet형 게시물 총 개수
- **질문 및 채팅**: 질문과 채팅 메시지 합계

#### 세션별 참여도 분석
- 상위 5개 세션 표시
- 게시물, 질문, 채팅 메시지 수 집계
- 마지막 활동 시각 표시
- 테이블 형태로 정리

#### AI 요약 (프리뷰)
- 통계 데이터 기반 AI 요약 생성
- 현재는 로컬 템플릿 기반 (향후 OpenAI/Gemini 연동 예정)
- 버튼 클릭으로 요약 생성

#### 모니터링 도구
- 개발 모드에서 `window.__classboardTelemetry`에 이벤트 저장
- 운영 체크리스트 제공

### 4. 인증 및 권한 관리

#### Firebase Authentication 통합
- **이메일/비밀번호 인증**
  - 회원가입 (`authService.signUp`)
  - 로그인 (`authService.signIn`)
  - 로그아웃 (`authService.signOut`)
- **사용자 프로필 관리**
  - Firestore에 사용자 프로필 저장
  - 역할(role) 정보 포함
  - 자동 프로필 생성 (`ensureUserProfile`)

#### 역할 기반 접근 제어
- **역할 타입**: `teacher`, `student`, `assistant`, `admin`
- **UI 가드**: 역할에 따라 페이지 접근 제한
- **권한 체크**: 클래스 관리 권한 확인

---

## 데이터 모델

### Firestore 컬렉션 구조

```
classrooms/
  {classId}/
    - name: string
    - description?: string
    - ownerId: string
    - code: string
    - featureConfig: ClassroomFeatureConfig
    - createdAt: string
    - updatedAt: string
    
    members/
      {memberId}/
        - userId: string
        - role: 'teacher' | 'student' | 'assistant' | 'admin'
        - status: 'pending' | 'active' | 'suspended'
        - joinedAt: string
    
    sessions/
      {sessionId}/
        - classroomId: string
        - title: string
        - number: number
        - agenda?: string
        - date: string
        - status: 'draft' | 'live' | 'archived'
        - activeTools: string[]
        - createdAt: string
        - updatedAt: string
        - createdBy?: string
        - updatedBy?: string
        
        activityPosts/
          {postId}/
            - classroomId: string
            - sessionId: string
            - authorId: string
            - authorName: string
            - text: string
            - images: string[]  # Firebase Storage URL
            - likes: string[]   # userId 배열
            - createdAt: string
            - updatedAt: string
        
        askQuestions/
          {questionId}/
            - classroomId: string
            - sessionId: string
            - authorId: string
            - authorName: string
            - text: string
            - upvotes: number
            - createdAt: string
        
        chatMessages/
          {messageId}/
            - classroomId: string
            - sessionId: string
            - authorId: string
            - authorName: string
            - text: string
            - createdAt: string
    
    preferences/
      dashboardWidgets/
        - widgets: WidgetPreference[]

users/
  {userId}/
    - id: string
    - displayName: string
    - email: string
    - role: 'teacher' | 'student' | 'assistant' | 'admin'
    - createdAt: string
    - updatedAt: string
```

### Firebase Storage 구조

```
classrooms/
  {classId}/
    sessions/
      {sessionId}/
        activity/
          {timestamp}-{index}-{filename}
```

---

## 인증 및 권한 관리

### 인증 플로우

1. **회원가입**
   ```typescript
   authService.signUp({
     email: string,
     password: string,
     displayName: string,
     role: UserRole
   })
   ```
   - Firebase Auth에 사용자 생성
   - Firestore에 프로필 문서 생성

2. **로그인**
   ```typescript
   authService.signIn(email, password)
   ```
   - Firebase Auth로 인증
   - 사용자 프로필 자동 로드

3. **인증 상태 관찰**
   ```typescript
   authService.observeAuthState((user) => { ... })
   ```
   - 실시간 인증 상태 변경 감지
   - Zustand 스토어에 상태 동기화

### 권한 체크

- **페이지 레벨**: `useAuth()` 훅으로 역할 확인
- **기능 레벨**: 클래스 멤버십 확인
- **데이터 레벨**: Firestore Security Rules (향후 구현)

---

## 서비스 계층

### 1. Classrooms Service (`classrooms-service.ts`)

#### 주요 메서드
- `listClassrooms()`: 모든 클래스 목록 조회
- `getClassroom(classId)`: 클래스 상세 정보
- `listMembers(classId)`: 클래스 구성원 목록
- `listSessions(classId)`: 클래스 세션 목록
- `createSession(classId, input)`: 새 세션 생성
- `subscribeToClassrooms(callback)`: 실시간 클래스 목록 구독
- `subscribeToClassroom(classId, callback)`: 실시간 클래스 구독
- `subscribeToMembers(classId, callback)`: 실시간 구성원 구독
- `subscribeToSessions(classId, callback)`: 실시간 세션 구독

### 2. Activity Service (`activity-service.ts`)

#### 주요 메서드
- `listActivityPosts({ classId, sessionId })`: 활동 게시물 목록
- `listQuestions({ classId, sessionId })`: 질문 목록
- `listChatMessages({ classId, sessionId })`: 채팅 메시지 목록
- `createActivityPost({ classId, sessionId, data, attachments })`: 게시물 생성
  - 이미지 파일 자동 업로드 (Firebase Storage)
  - 업로드된 URL을 게시물에 포함
- `createQuestion({ classId, sessionId, data })`: 질문 생성
- `sendChatMessage({ classId, sessionId, data })`: 채팅 메시지 전송
- `subscribeToActivityPosts(...)`: 실시간 게시물 구독
- `subscribeToQuestions(...)`: 실시간 질문 구독
- `subscribeToChatMessages(...)`: 실시간 채팅 구독

### 3. Auth Service (`auth-service.ts`)

#### 주요 메서드
- `signUp(params)`: 회원가입
- `signIn(email, password)`: 로그인
- `signOut()`: 로그아웃
- `observeAuthState(callback)`: 인증 상태 관찰
- `fetchUserProfile(userId)`: 사용자 프로필 조회
- `ensureUserProfile(user)`: 프로필 자동 생성

### 4. Dashboard Widgets Service (`dashboard-widgets-service.ts`)

#### 주요 기능
- 위젯 설정 저장/로드
- 기본 설정 제공
- 클래스별 커스터마이징 지원

### 5. AI Service (`ai-service.ts`)

#### 현재 상태
- 프리뷰 모드 (로컬 템플릿 기반)
- `generateAnalyticsSummary()`: 통계 요약 생성
- 향후 OpenAI/Gemini API 연동 예정

---

## 프론트엔드 구현

### 페이지 컴포넌트

#### 1. LandingPage
- 랜딩 화면
- 인증 상태에 따른 리다이렉트

#### 2. TeacherOverview
- **사이드바 네비게이션**: Dashboard, Activity, Chat, Cloud, Quiz, Materials, Settings(커스터 마이징 가능(학생 권한은 불가))
- **대시보드 섹션**:
  - 위젯 그리드 레이아웃
  - 위젯 편집 모드 (Drag & Drop)
  - 위젯 추가/제거
- **세션 생성 폼**: 모달 형태
- **클래스/세션 선택**: 드롭다운

#### 3. StudentOverview
- **활동 보드**: 게시물 작성 및 조회
- **Q&A 섹션**: 질문 작성 및 목록
- **채팅 섹션**: 실시간 메시지
- **클래스/세션 선택**: 드롭다운

#### 4. AnalyticsOverview
- **지표 카드**: 4개 주요 지표
- **세션 참여도 테이블**: 상위 5개 세션
- **AI 요약**: 버튼 클릭으로 생성
- **모니터링 정보**: 개발 도구 안내

### 공통 컴포넌트

#### EmptyState
- 빈 상태 표시 컴포넌트
- 아이콘, 제목, 설명, 추가 콘텐츠 지원

#### Skeleton
- 로딩 스켈레톤 UI
- TailwindCSS 기반

#### AppShell
- 앱 전체 레이아웃
- 인증 컨트롤 포함
- 라우팅 통합

### 커스텀 훅

#### use-auth.ts
- `useAuth()`: 현재 인증 상태 및 사용자 정보
- `useSignIn()`: 로그인 뮤테이션
- `useSignOut()`: 로그아웃 뮤테이션

#### use-classrooms.ts
- `useClassroomsQuery()`: 클래스 목록 조회
- `useClassroomDetailQuery(classId)`: 클래스 상세
- `useClassroomMembersQuery(classId)`: 구성원 목록
- `useClassroomSessionsQuery(classId)`: 세션 목록
- `useCreateSessionMutation()`: 세션 생성

#### use-activity.ts
- `useActivityPostsQuery(classId, sessionId)`: 게시물 목록
- `useQuestionsQuery(classId, sessionId)`: 질문 목록
- `useChatMessagesQuery(classId, sessionId)`: 채팅 목록
- `useCreateActivityPostMutation()`: 게시물 생성
- `useCreateQuestionMutation()`: 질문 생성
- `useSendChatMessageMutation()`: 채팅 전송

#### use-analytics.ts
- `useAnalyticsSummary()`: 통계 요약 조회

#### use-dashboard-widgets.ts
- `useDashboardWidgetsPreferences()`: 위젯 설정 관리
- 위젯 순서, 표시/숨김, 크기 설정

---

## 상태 관리

### React Query (서버 상태)
- **캐싱**: Firestore 데이터 자동 캐싱
- **리프레시**: 백그라운드 자동 갱신
- **옵티미스틱 업데이트**: 뮤테이션 시 즉시 UI 반영
- **에러 핸들링**: 통합 에러 처리

### Zustand (클라이언트 상태)

#### auth-store.ts
```typescript
{
  user: AuthUser | null,
  isLoading: boolean,
  setUser: (user) => void,
  clearUser: () => void
}
```

#### ui-store.ts
```typescript
{
  selectedClassId: string | null,
  selectedSessionId: string | null,
  setSelectedClassId: (id) => void,
  setSelectedSessionId: (id) => void,
  initializeSelection: (params) => void
}
```

---

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Firebase CLI (에뮬레이터 사용 시)

### 환경 변수 설정

`.env` 파일 생성:
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=education-dashboard-local
VITE_FIREBASE_STORAGE_BUCKET=education-dashboard-local.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-your-measurement-id
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080  # 개발 모드에서만
```

### 설치 및 실행

```bash
# 의존성 설치
cd apps/web
npm install

# Firestore 에뮬레이터 실행 (터미널 1)
npm run emulator

# 개발 서버 실행 (터미널 2)
npm run dev
```

### 데이터 시드

```bash
# Firestore 에뮬레이터에 샘플 데이터 추가
npm run seed:firestore
```

### 접속 URL
- 교사 대시보드: `http://localhost:5173/teacher`
- 학생 참여 화면: `http://localhost:5173/student`
- 통계 모니터링: `http://localhost:5173/analytics`
- Firestore 에뮬레이터 UI: `http://localhost:4000`

---

## 테스트

### 테스트 프레임워크
- **Vitest**: 테스트 러너
- **Testing Library**: React 컴포넌트 테스트
- **jsdom**: DOM 환경 시뮬레이션

### 테스트 실행

```bash
# 테스트 실행
npm run test

# 워치 모드
npm run test:watch
```

### 테스트 파일 위치
- `src/components/common/__tests__/EmptyState.test.tsx`

---

## 배포 및 운영

### 빌드

```bash
npm run build
```

빌드 결과물은 `apps/web/dist` 디렉토리에 생성됩니다.

### 배포 옵션

#### Firebase Hosting
```bash
firebase deploy --only hosting
```

#### Vercel
```bash
vercel
```

### PWA 지원
- 서비스 워커 (`public/sw.js`)
- 웹 매니페스트 (`public/manifest.webmanifest`)
- 프로덕션 빌드 시 자동 활성화

### 운영 체크리스트
- [ ] Firestore Security Rules 설정
- [ ] Firebase Storage Rules 설정
- [ ] 환경 변수 프로덕션 설정
- [ ] CI/CD 파이프라인 구축 (향후)
- [ ] 모니터링 및 로깅 도구 연동 (향후)

---

## 프로젝트 발전 방향

### 현재 상태 분석

프로젝트는 현재 **이중 구조**로 운영되고 있습니다:

1. **React SPA (apps/web)**: 최신 기술 스택으로 구축된 메인 애플리케이션
   - TypeScript, React 19, Vite
   - Firebase 통합
   - 현대적인 상태 관리 (React Query + Zustand)
   - 컴포넌트 기반 아키텍처

2. **레거시 HTML 파일들**: 기존 프로토타입 파일들
   - `main-session.html`, `class-select.html`, `create-session.html` 등
   - Vanilla JavaScript 기반
   - Firebase 호환 모드 사용
   - 일부 기능이 여전히 활성화되어 있음

### 발전 방향

#### 1. 통합 및 마이그레이션 (우선순위: 최고)
- **목표**: 모든 레거시 HTML 파일을 React SPA로 마이그레이션
- **이유**: 
  - 코드베이스 통일로 유지보수성 향상
  - 타입 안정성 확보
  - 일관된 사용자 경험 제공
  - 성능 최적화 가능

#### 2. UI/UX 개선 (우선순위: 높음)
- **목표**: 현대적이고 일관된 디자인 시스템 구축
- **포함 사항**:
  - 반응형 디자인 완성
  - 접근성 (WCAG 2.1 AA) 준수
  - 다크 모드 완전 지원
  - 애니메이션 및 전환 효과 개선

#### 3. 코드 품질 및 안정성 (우선순위: 높음)
- **목표**: 프로덕션 준비 완료
- **포함 사항**:
  - 에러 처리 강화
  - 타입 안정성 확보
  - 메모리 누수 방지
  - 테스트 커버리지 확대

#### 4. 성능 최적화 (우선순위: 중간)
- **목표**: 빠르고 부드러운 사용자 경험
- **포함 사항**:
  - 번들 크기 최적화
  - 이미지 최적화
  - 코드 스플리팅
  - 캐싱 전략 개선

---

## 프론트엔드/GUI 우선 작업 계획

### Phase 1: 레거시 마이그레이션 (2-3주)

#### 1.1 레거시 페이지 분석 및 기능 매핑
- [ ] `main-session.html` → React 컴포넌트로 변환
  - 대시보드 위젯 시스템
  - 공지사항 기능
  - 세션 목록 표시
  - 사이드바 네비게이션
- [ ] `class-select.html` → 클래스 선택 컴포넌트 통합
- [ ] `create-session.html` → 세션 생성 모달/페이지
- [ ] `session.html` → 세션 상세 페이지
- [ ] `activity-session.html` → Activity 페이지 통합
- [ ] `ask-session.html` → Ask/Q&A 페이지 통합

#### 1.2 공통 기능 추출
- [ ] 사이드바 컴포넌트 통합
- [ ] 네비게이션 바 컴포넌트 통합
- [ ] 프로필 드롭다운 컴포넌트
- [ ] 다크 모드 토글 기능

#### 1.3 스타일 통합
- [ ] `main-session.css` → TailwindCSS로 변환
- [ ] 공통 스타일 변수 정의
- [ ] 다크 모드 스타일 완성

### Phase 2: UI/UX 개선 (2주)

#### 2.1 디자인 시스템 구축
- [ ] 색상 팔레트 표준화
- [ ] 타이포그래피 시스템
- [ ] 컴포넌트 라이브러리 문서화
- [ ] 아이콘 시스템 통일

#### 2.2 반응형 디자인
- [ ] 모바일 레이아웃 최적화
- [ ] 태블릿 레이아웃 최적화
- [ ] 데스크톱 레이아웃 개선
- [ ] 터치 제스처 지원

#### 2.3 접근성 개선
- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션 완성
- [ ] 포커스 관리 개선
- [ ] 스크린 리더 테스트
- [ ] 색상 대비 검증

### Phase 3: 코드 품질 개선 (1-2주)

#### 3.1 에러 처리 강화
- [ ] 전역 에러 바운더리 완성
- [ ] 사용자 친화적 에러 메시지
- [ ] 에러 복구 메커니즘
- [ ] 네트워크 에러 처리

#### 3.2 타입 안정성
- [ ] Zod 스키마 완성
- [ ] 런타임 타입 검증
- [ ] 타입 가드 함수 추가
- [ ] `any` 타입 제거

#### 3.3 성능 최적화
- [ ] 불필요한 리렌더링 제거
- [ ] `useMemo`, `useCallback` 최적화
- [ ] 이미지 지연 로딩
- [ ] 가상 스크롤링 (긴 목록)

### Phase 4: 고급 기능 (1-2주)

#### 4.1 애니메이션 및 전환
- [ ] 페이지 전환 애니메이션
- [ ] 로딩 스켈레톤 개선
- [ ] 마이크로 인터랙션 추가
- [ ] 성능 최적화된 애니메이션

#### 4.2 사용자 경험 개선
- [ ] 로딩 상태 일관성
- [ ] 빈 상태 메시지 개선
- [ ] 성공/실패 피드백 강화
- [ ] 폼 검증 개선

#### 4.3 PWA 기능
- [ ] 오프라인 지원
- [ ] 푸시 알림
- [ ] 설치 프롬프트
- [ ] 오프라인 데이터 동기화

---

## 향후 확장 계획

### 단기 (M2)
- [ ] 테스트 자동화 강화
- [ ] CI/CD 파이프라인 구축
- [ ] 기본 통계 대시보드 완성
- [ ] 운영 모니터링/로깅 도입

### 중기 (M3)
- [ ] AI 피드백/채점 기능 (OpenAI/Gemini)
- [ ] 클래스 코드 초대 시스템
- [ ] 실시간 협업 백엔드 연동
- [ ] 모바일 앱 (PWA) 최적화
- [ ] 접근성 (WCAG) 검증 강화

### 장기
- [ ] 퀴즈 자동 채점 시스템
- [ ] WordCloud 시각화
- [ ] 학습 자료 관리 시스템
- [ ] Classroom/Padlet 외부 연동

---

## 주요 파일 참조

### 핵심 서비스 파일
- `apps/web/src/services/classrooms-service.ts`
- `apps/web/src/services/activity-service.ts`
- `apps/web/src/services/auth-service.ts`
- `apps/web/src/services/dashboard-widgets-service.ts`
- `apps/web/src/services/ai-service.ts`

### 주요 페이지
- `apps/web/src/pages/TeacherOverview.tsx`
- `apps/web/src/pages/StudentOverview.tsx`
- `apps/web/src/pages/AnalyticsOverview.tsx`

### 타입 정의
- `apps/web/src/types/user.ts`
- `apps/web/src/types/classroom.ts`

### 설정 파일
- `apps/web/src/config/firebase.ts`
- `apps/web/package.json`

---

## 문서 참조

프로젝트의 상세 설계 및 로드맵은 `docs/` 디렉토리를 참조하세요:
- `docs/current-implementation.md`: 현재 구현 현황
- `docs/architecture-and-pipeline-plan.md`: 아키텍처 설계
- `docs/data-and-auth-plan.md`: 데이터 구조 및 인증 모델
- `docs/feature-expansion-roadmap.md`: 기능 확장 로드맵
- `docs/mobility-access-ops-plan.md`: 모바일/접근성/운영 계획

---

## 다음 단계 작업 선택 가이드

### 즉시 시작 가능한 작업 (우선순위 순)

#### 🔴 Critical - 즉시 시작
1. **레거시 HTML 마이그레이션 시작**
   - `main-session.html`의 위젯 시스템을 React로 변환
   - 기존 기능 유지하면서 점진적 마이그레이션
   - 예상 시간: 1주

2. **에러 처리 개선**
   - 전역 에러 바운더리 완성
   - 사용자 친화적 메시지 추가
   - 예상 시간: 2-3일

3. **타입 안정성 강화**
   - Zod 스키마를 Firestore 변환기에 완전 통합
   - 런타임 검증 추가
   - 예상 시간: 2-3일

#### 🟡 High - 단기 개선
4. **접근성 개선**
   - ARIA 레이블 추가
   - 키보드 네비게이션 완성
   - 예상 시간: 1주

5. **반응형 디자인 완성**
   - 모바일 레이아웃 최적화
   - 태블릿 지원
   - 예상 시간: 1주

6. **성능 최적화**
   - 불필요한 리렌더링 제거
   - 번들 크기 최적화
   - 예상 시간: 3-5일

### 작업 선택 기준

**프론트엔드/GUI 우선 작업을 선택할 때 고려사항:**

1. **사용자 영향도**: 가장 많이 사용되는 기능부터
2. **기술 부채**: 레거시 코드가 많은 부분부터
3. **개발 효율성**: 다른 작업의 기반이 되는 부분부터
4. **위험도**: 프로덕션에 영향을 주는 부분부터

### 추천 작업 순서

**Week 1-2: 기반 구축**
1. 에러 처리 개선 (Critical)
2. 타입 안정성 강화 (Critical)
3. 레거시 마이그레이션 시작 - 위젯 시스템 (Critical)

**Week 3-4: 사용자 경험**
4. 접근성 개선 (High)
5. 반응형 디자인 (High)
6. 레거시 마이그레이션 - 나머지 페이지들 (High)

**Week 5-6: 최적화**
7. 성능 최적화 (High)
8. 애니메이션 및 전환 효과 (Medium)
9. PWA 기능 강화 (Medium)

---

---

## 레거시 마이그레이션 완료 현황

### ✅ 완료된 마이그레이션 (2025-01-14)

#### 공통 컴포넌트
- ✅ **Sidebar.tsx**: 레거시 스타일 사이드바 네비게이션
- ✅ **Navbar.tsx**: 검색, 클래스/세션 선택, 프로필 드롭다운, 세션 생성 버튼
- ✅ **Announcements.tsx**: 공지사항 기능 (로컬 스토리지 기반)
- ✅ **ClassSelector.tsx**: 클래스 선택 카드 그리드
- ✅ **CreateSessionModal.tsx**: 세션 생성 모달

#### 페이지 컴포넌트
- ✅ **ActivityPage.tsx**: 공유 메모보드 (Padlet 스타일)
- ✅ **AskPage.tsx**: 실시간 WordCloud + Q&A + 채팅
- ✅ **QuizPage.tsx**: 퀴즈 페이지 (준비 중 상태)
- ✅ **MaterialsPage.tsx**: 자료실 페이지 (준비 중 상태)
- ✅ **SessionDetailPage.tsx**: 세션 상세 페이지 (탭 네비게이션)

#### 라우팅
- ✅ `/teacher` - 대시보드
- ✅ `/teacher/activity` - Activity 페이지
- ✅ `/teacher/ask` - Ask 페이지
- ✅ `/teacher/quiz` - Quiz 페이지
- ✅ `/teacher/materials` - Materials 페이지
- ✅ `/teacher/session/:sessionId` - 세션 상세 페이지

#### 라이브러리 통합
- ✅ **WordCloud2.js**: React 통합 완료 (`apps/web/src/lib/wordcloud.ts`)
- ✅ **Boxicons**: index.html에 추가
- ✅ **wordcloud npm 패키지**: 설치 완료

#### 코드 개선
- ✅ TeacherOverview에 새 레이아웃 적용
- ✅ 공지사항 위젯을 새 컴포넌트로 교체
- ✅ 클래스 선택 기능 통합
- ✅ 세션 생성 기능을 Navbar로 이동
- ✅ 사용하지 않는 코드 제거

### 📝 레거시 파일 현황

다음 레거시 파일들은 아직 사용 중이거나 향후 제거 예정입니다:

**사용 중 (점진적 제거 예정)**
- `main-session.html`, `main-session.js`, `main-session.css` - 일부 기능이 React로 마이그레이션됨
- `activity-session.html`, `activity-session.js`, `activity-session.css` - React로 마이그레이션 완료
- `ask-session.html`, `ask-session.js`, `ask-session.css` - React로 마이그레이션 완료
- `ask-standalone.js` - WordCloud 로직이 React로 통합됨

**제거 가능 (사용되지 않음)**
- `chat.html`, `chat.js`, `chat.css` - 이미 삭제됨
- `session.js` - 중복 기능, 삭제됨

---

---

## 코드 품질 개선 완료 현황

### ✅ 완료된 개선 작업 (2025-01-14)

#### 에러 처리 개선
- ✅ **에러 핸들러 강화**: Firebase 에러 코드를 한국어 메시지로 변환
- ✅ **전역 에러 바운더리**: 개발 모드에서 스택 트레이스 표시
- ✅ **에러 로깅 통일**: console.error를 logger로 교체
- ✅ **사용자 친화적 메시지**: 네트워크, 권한, 인증 등 다양한 에러 타입 처리

#### 타입 안정성 강화
- ✅ **Zod 스키마 통합**: 모든 Firestore 변환기에 스키마 적용
  - ActivityPost, Question, ChatMessage 스키마 적용
  - Classroom, Session 스키마 적용
  - 런타임 검증으로 데이터 무결성 보장
- ✅ **타입 안전한 변환기**: 개발 환경에서 검증 실패 시 즉시 에러 발생

#### 접근성 개선
- ✅ **ARIA 레이블 추가**: 
  - Sidebar: `aria-label`, `role="navigation"`, `aria-expanded`, `aria-controls`
  - Navbar: `role="banner"`, `aria-expanded`, `aria-controls`
  - 아이콘: `aria-hidden="true"` 추가
- ✅ **시맨틱 HTML**: `<nav>`, `<header>`, `<aside>` 태그 사용
- ✅ **키보드 네비게이션**: 기본 HTML 요소 사용으로 자동 지원

#### 코드 정리
- ✅ **에러 처리 통일**: 모든 컴포넌트에서 `handleError` 사용
- ✅ **로깅 통일**: `console.error`를 `logger` 또는 `handleError`로 교체

---

**최종 업데이트**: 2025-01-14
**다음 리뷰 예정**: 2025-01-21

