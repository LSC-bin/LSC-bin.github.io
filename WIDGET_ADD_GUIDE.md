# 위젯 추가 가이드

이 문서는 AI ClassBoard 대시보드에 새로운 위젯을 추가하는 방법을 설명합니다.

## 📋 목차

1. [위젯 추가 기본 절차](#위젯-추가-기본-절차)
2. [위젯 템플릿](#위젯-템플릿)
3. [위젯 속성 설명](#위젯-속성-설명)
4. [위젯 콘텐츠 빌드 함수](#위젯-콘텐츠-빌드-함수)
5. [스타일링 가이드](#스타일링-가이드)
6. [실제 예제](#실제-예제)

---

## 위젯 추가 기본 절차

### 1단계: WIDGET_LIBRARY에 위젯 정의 추가

`main-session.js` 파일의 `WIDGET_LIBRARY` 객체에 새로운 위젯을 추가합니다.

```javascript
const WIDGET_LIBRARY = {
    // ... 기존 위젯들 ...
    
    // 새 위젯 추가
    yourWidgetId: {
        title: '위젯 제목',
        icon: 'bx bx-icon-name',
        accent: 'var(--blue)',
        defaultSize: 'medium',
        defaultVisible: false,  // true면 기본 표시, false면 숨김
        allowAdd: true,         // 편집 모드에서 추가 가능 여부
        buildContent: (card) => {
            // 위젯 콘텐츠 생성 로직
        }
    }
};
```

### 2단계: HTML에 위젯 카드 추가 (선택사항)

기본 표시되는 위젯(`defaultVisible: true`)인 경우, `main-session.html`의 `dashboard-widget-grid`에 HTML을 추가할 수 있습니다. 하지만 JavaScript로 동적 생성하는 것을 권장합니다.

### 3단계: 스타일 추가 (필요시)

위젯에 특별한 스타일이 필요한 경우 `main-session.css`에 CSS를 추가합니다.

### 4단계: 데이터 로드 함수 추가 (필요시)

Firestore나 다른 데이터 소스에서 데이터를 가져와야 하는 경우, 별도의 함수를 작성합니다.

---

## 위젯 템플릿

### 기본 템플릿 (정적 콘텐츠)

```javascript
yourWidgetId: {
    title: '위젯 제목',
    description: '위젯 설명 (선택사항)',
    icon: 'bx bx-icon-name',  // Boxicons 아이콘 클래스
    accent: 'var(--blue)',     // 위젯 아이콘 배경색
    defaultSize: 'medium',     // 'small', 'medium', 'large'
    defaultVisible: false,      // 기본 표시 여부
    allowAdd: true,            // 편집 모드에서 추가 가능 여부
    className: 'custom-widget-class',  // 추가 CSS 클래스 (선택사항)
    buildContent: (card) => {
        // card는 위젯 카드 DOM 요소
        const container = document.createElement('div');
        container.className = 'widget-content';
        container.innerHTML = `
            <p>위젯 콘텐츠</p>
        `;
        card.appendChild(container);
    }
}
```

### 동적 데이터 로드 템플릿

```javascript
yourWidgetId: {
    title: '위젯 제목',
    icon: 'bx bx-icon-name',
    accent: 'var(--blue)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: async (card) => {
        // 로딩 상태 표시
        const loadingEl = document.createElement('div');
        loadingEl.className = 'widget-loading';
        loadingEl.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> 로딩 중...';
        card.appendChild(loadingEl);
        
        try {
            // 데이터 로드
            const data = await loadYourWidgetData();
            
            // 로딩 제거
            loadingEl.remove();
            
            // 콘텐츠 생성
            const container = document.createElement('div');
            container.className = 'widget-content';
            container.innerHTML = renderWidgetContent(data);
            card.appendChild(container);
        } catch (error) {
            loadingEl.innerHTML = '<p>데이터를 불러올 수 없습니다.</p>';
            console.error('위젯 데이터 로드 실패:', error);
        }
    }
}
```

### 실시간 업데이트 템플릿

```javascript
yourWidgetId: {
    title: '위젯 제목',
    icon: 'bx bx-icon-name',
    accent: 'var(--blue)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'widget-content';
        card.appendChild(container);
        
        // 실시간 리스너 설정
        const unsubscribe = subscribeToData((data) => {
            container.innerHTML = renderWidgetContent(data);
        });
        
        // 위젯이 제거될 때 리스너 정리 (선택사항)
        // 이 기능은 향후 위젯 시스템에 추가될 예정
    }
}
```

---

## 위젯 속성 설명

### 필수 속성

- **title** (string): 위젯 헤더에 표시될 제목
- **icon** (string): Boxicons 아이콘 클래스 (예: `'bx bx-icon-name'`)
- **accent** (string): 위젯 아이콘 배경색 (CSS 변수 또는 색상 값)
- **defaultSize** (string): 기본 크기 (`'small'`, `'medium'`, `'large'`)
- **defaultVisible** (boolean): 기본적으로 표시될지 여부
- **allowAdd** (boolean): 편집 모드에서 추가 가능 여부

### 선택 속성

- **description** (string): 위젯 설명 (현재는 사용되지 않지만 문서화용)
- **className** (string): 위젯 카드에 추가할 CSS 클래스
- **buildContent** (function): 위젯 콘텐츠를 생성하는 함수
  - 매개변수: `card` (DOM 요소) - 위젯 카드 컨테이너
  - 반환값: 없음 (DOM 조작으로 콘텐츠 추가)

---

## 위젯 콘텐츠 빌드 함수

### 기본 패턴

```javascript
buildContent: (card) => {
    // 1. 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'your-widget-content';
    
    // 2. HTML 콘텐츠 생성
    container.innerHTML = `
        <div class="widget-section">
            <h4>섹션 제목</h4>
            <p>콘텐츠</p>
        </div>
    `;
    
    // 3. 카드에 추가
    card.appendChild(container);
    
    // 4. 이벤트 리스너 추가 (필요시)
    const button = container.querySelector('.your-button');
    if (button) {
        button.addEventListener('click', () => {
            // 버튼 클릭 처리
        });
    }
}
```

### 다크 모드 지원

```javascript
buildContent: (card) => {
    const container = document.createElement('div');
    container.innerHTML = `
        <h4>제목</h4>
        <p>내용</p>
    `;
    
    // 다크 모드 체크
    if (document.body.classList.contains('dark')) {
        const h4 = container.querySelector('h4');
        const p = container.querySelector('p');
        if (h4) h4.style.setProperty('color', 'var(--light)');
        if (p) p.style.setProperty('color', '#AAA');
    }
    
    card.appendChild(container);
}
```

### 데이터 바인딩

```javascript
buildContent: (card) => {
    const container = document.createElement('div');
    container.className = 'widget-content';
    
    // 데이터 로드
    const data = getWidgetData(); // 동기 또는 비동기
    
    // 템플릿 렌더링
    container.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">${data.label}</span>
            <span class="stat-value">${data.value}</span>
        </div>
    `;
    
    card.appendChild(container);
}
```

---

## 스타일링 가이드

### CSS 변수 사용

위젯 스타일은 ClassBoard Design 시스템의 CSS 변수를 사용합니다:

```css
.your-widget-content {
    padding: 1rem;
    background: var(--light);
    border-radius: var(--radius-md);
    color: var(--dark);
}

body.dark .your-widget-content {
    background: rgba(255, 255, 255, 0.05);
    color: var(--light);
}
```

### 사용 가능한 CSS 변수

- 색상: `var(--blue)`, `var(--orange)`, `var(--red)`, `var(--yellow)`, `var(--green)`
- 텍스트: `var(--dark)`, `var(--light)`, `var(--grey)`
- 반경: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`
- 그림자: `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`

### 인라인 스타일 (비권장)

가능하면 CSS 클래스를 사용하고, 인라인 스타일은 최소화합니다.

---

## 실제 예제

### 예제 1: 간단한 통계 위젯

```javascript
quickStats: {
    title: '빠른 통계',
    icon: 'bx bx-stats',
    accent: 'var(--blue)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'quick-stats-widget';
        
        // 통계 데이터 (실제로는 API에서 가져옴)
        const stats = [
            { label: '오늘 게시물', value: '12', icon: 'bx bx-edit' },
            { label: '오늘 질문', value: '5', icon: 'bx bx-question-mark' },
            { label: '오늘 채팅', value: '28', icon: 'bx bx-message' }
        ];
        
        container.innerHTML = `
            <div class="stats-grid">
                ${stats.map(stat => `
                    <div class="stat-card">
                        <i class="${stat.icon}"></i>
                        <div class="stat-info">
                            <span class="stat-value">${stat.value}</span>
                            <span class="stat-label">${stat.label}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        card.appendChild(container);
    }
}
```

### 예제 2: Firestore 데이터를 사용하는 위젯

```javascript
recentActivity: {
    title: '최근 활동',
    icon: 'bx bx-time-five',
    accent: 'var(--green)',
    defaultSize: 'large',
    defaultVisible: false,
    allowAdd: true,
    buildContent: async (card) => {
        const container = document.createElement('div');
        container.className = 'recent-activity-widget';
        
        // 로딩 표시
        container.innerHTML = '<div class="loading">로딩 중...</div>';
        card.appendChild(container);
        
        try {
            // Firestore에서 데이터 가져오기
            const activities = await getRecentActivities();
            
            if (activities.length === 0) {
                container.innerHTML = '<p class="empty">최근 활동이 없습니다.</p>';
                return;
            }
            
            // 활동 목록 렌더링
            container.innerHTML = `
                <div class="activity-list">
                    ${activities.map(activity => `
                        <div class="activity-item">
                            <i class="${getActivityIcon(activity.type)}"></i>
                            <div class="activity-content">
                                <p>${activity.text}</p>
                                <span class="activity-time">${formatTime(activity.createdAt)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = '<p class="error">데이터를 불러올 수 없습니다.</p>';
            console.error('활동 데이터 로드 실패:', error);
        }
    }
}
```

### 예제 3: 실시간 업데이트 위젯

```javascript
liveActivity: {
    title: '실시간 활동',
    icon: 'bx bx-radar',
    accent: 'var(--green)',
    defaultSize: 'small',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'live-activity-widget';
        container.innerHTML = '<div class="activity-feed"></div>';
        card.appendChild(container);
        
        const feed = container.querySelector('.activity-feed');
        
        // Firestore 실시간 리스너
        const unsubscribe = db.collection('activities')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .onSnapshot((snapshot) => {
                const activities = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                feed.innerHTML = activities.map(activity => `
                    <div class="activity-item">
                        <span class="activity-text">${activity.text}</span>
                        <span class="activity-time">${formatTime(activity.createdAt)}</span>
                    </div>
                `).join('');
            });
        
        // 위젯 제거 시 리스너 정리 (향후 구현)
        // card.addEventListener('remove', () => unsubscribe());
    }
}
```

---

## 체크리스트

새 위젯을 추가할 때 다음 사항을 확인하세요:

- [ ] `WIDGET_LIBRARY`에 위젯 정의 추가
- [ ] 위젯 ID가 고유한지 확인 (기존 위젯과 중복 없음)
- [ ] `buildContent` 함수가 올바르게 구현되었는지 확인
- [ ] 다크 모드 지원 (필요시)
- [ ] 에러 처리 구현 (데이터 로드 실패 시)
- [ ] 로딩 상태 표시 (비동기 데이터 로드 시)
- [ ] CSS 스타일 추가 (필요시)
- [ ] IMPLEMENTATION.md에 위젯 문서화
- [ ] 테스트 (위젯 추가/제거/크기 조정)

---

## 문제 해결

### 위젯이 표시되지 않을 때

1. `defaultVisible: true`로 설정했는지 확인
2. `allowAdd: true`로 설정하고 편집 모드에서 추가했는지 확인
3. 브라우저 콘솔에서 에러 확인
4. `buildContent` 함수가 올바르게 실행되는지 확인

### 위젯 콘텐츠가 업데이트되지 않을 때

1. 데이터 로드 함수가 올바르게 작동하는지 확인
2. 실시간 리스너가 제대로 설정되었는지 확인
3. Firestore 보안 규칙 확인

### 스타일이 적용되지 않을 때

1. CSS 클래스명이 올바른지 확인
2. CSS 파일이 올바르게 로드되었는지 확인
3. 다크 모드 스타일이 필요한지 확인

---

## 추가 리소스

- [Boxicons](https://boxicons.com/) - 아이콘 참조
- [ClassBoard Design System](./IMPLEMENTATION.md#classboard-design-system) - 디자인 가이드
- [Firebase Firestore 문서](https://firebase.google.com/docs/firestore) - 데이터베이스 참조

---

**마지막 업데이트**: 2025-01-15


