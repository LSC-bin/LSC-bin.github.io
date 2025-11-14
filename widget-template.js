/**
 * 위젯 템플릿
 * 
 * 이 파일은 새로운 위젯을 만들 때 참고용 템플릿입니다.
 * 실제로 사용하려면 main-session.js의 WIDGET_LIBRARY에 복사하여 추가하세요.
 * 
 * 사용 방법:
 * 1. 아래 템플릿 중 하나를 선택
 * 2. 위젯 ID와 내용을 수정
 * 3. main-session.js의 WIDGET_LIBRARY 객체에 추가
 * 4. 필요시 CSS 스타일 추가
 */

// ============================================
// 템플릿 1: 기본 정적 위젯
// ============================================
const basicWidgetTemplate = {
    title: '위젯 제목',
    description: '위젯 설명 (선택사항)',
    icon: 'bx bx-icon-name',  // Boxicons 아이콘 클래스
    accent: 'var(--blue)',    // 아이콘 배경색 (CSS 변수 또는 색상 값)
    defaultSize: 'medium',   // 'small', 'medium', 'large'
    defaultVisible: false,    // 기본 표시 여부
    allowAdd: true,           // 편집 모드에서 추가 가능 여부
    className: 'custom-widget-class',  // 추가 CSS 클래스 (선택사항)
    buildContent: (card) => {
        // card는 위젯 카드 DOM 요소
        const container = document.createElement('div');
        container.className = 'widget-content';
        container.innerHTML = `
            <p>위젯 콘텐츠를 여기에 작성하세요.</p>
        `;
        card.appendChild(container);
    }
};

// ============================================
// 템플릿 2: 동적 데이터 로드 위젯
// ============================================
const asyncDataWidgetTemplate = {
    title: '데이터 위젯',
    icon: 'bx bx-data',
    accent: 'var(--green)',
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
            // 데이터 로드 함수 호출 (실제 구현 필요)
            const data = await loadWidgetData();
            
            // 로딩 제거
            loadingEl.remove();
            
            // 콘텐츠 생성
            const container = document.createElement('div');
            container.className = 'widget-content';
            container.innerHTML = `
                <div class="data-display">
                    <h4>${data.title}</h4>
                    <p>${data.content}</p>
                </div>
            `;
            card.appendChild(container);
        } catch (error) {
            loadingEl.innerHTML = '<p class="error">데이터를 불러올 수 없습니다.</p>';
            console.error('위젯 데이터 로드 실패:', error);
        }
    }
};

// ============================================
// 템플릿 3: Firestore 실시간 위젯
// ============================================
const firestoreRealtimeWidgetTemplate = {
    title: '실시간 위젯',
    icon: 'bx bx-radar',
    accent: 'var(--cyan)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'widget-content';
        container.innerHTML = '<div class="realtime-list"></div>';
        card.appendChild(container);
        
        const list = container.querySelector('.realtime-list');
        
        // Firestore 실시간 리스너 설정
        // 주의: 실제 Firebase 설정이 필요합니다
        /*
        const unsubscribe = db.collection('yourCollection')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                list.innerHTML = items.map(item => `
                    <div class="list-item">
                        <p>${item.text}</p>
                        <span class="time">${formatTime(item.createdAt)}</span>
                    </div>
                `).join('');
            });
        */
        
        // 임시 데이터 표시
        list.innerHTML = '<p>실시간 데이터 연결 필요</p>';
    }
};

// ============================================
// 템플릿 4: 통계 카드 위젯
// ============================================
const statsCardWidgetTemplate = {
    title: '통계 위젯',
    icon: 'bx bx-stats',
    accent: 'var(--indigo)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'stats-widget';
        
        // 통계 데이터 (실제로는 API에서 가져옴)
        const stats = [
            { label: '항목 1', value: '100', icon: 'bx bx-check', color: 'var(--green)' },
            { label: '항목 2', value: '50', icon: 'bx bx-x', color: 'var(--red)' },
            { label: '항목 3', value: '75', icon: 'bx bx-info-circle', color: 'var(--blue)' }
        ];
        
        container.innerHTML = `
            <div class="stats-grid">
                ${stats.map(stat => `
                    <div class="stat-card">
                        <div class="stat-icon" style="background: ${stat.color};">
                            <i class="${stat.icon}"></i>
                        </div>
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
};

// ============================================
// 템플릿 5: 리스트 위젯
// ============================================
const listWidgetTemplate = {
    title: '리스트 위젯',
    icon: 'bx bx-list-ul',
    accent: 'var(--purple)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'list-widget';
        
        // 리스트 데이터 (실제로는 API에서 가져옴)
        const items = [
            { title: '항목 1', subtitle: '부제목 1', time: '5분 전' },
            { title: '항목 2', subtitle: '부제목 2', time: '10분 전' },
            { title: '항목 3', subtitle: '부제목 3', time: '15분 전' }
        ];
        
        container.innerHTML = `
            <div class="list-container">
                ${items.map(item => `
                    <div class="list-item" onclick="handleItemClick('${item.title}')">
                        <div class="item-content">
                            <h5>${item.title}</h5>
                            <p>${item.subtitle}</p>
                        </div>
                        <span class="item-time">${item.time}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        card.appendChild(container);
    }
};

// ============================================
// 사용 예제
// ============================================

// 예제 1: addWidget 함수 사용
/*
addWidget('myCustomWidget', {
    title: '내 커스텀 위젯',
    icon: 'bx bx-star',
    accent: 'var(--blue)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'my-widget-content';
        container.innerHTML = '<p>커스텀 위젯 콘텐츠</p>';
        card.appendChild(container);
    }
});
*/

// 예제 2: WIDGET_LIBRARY에 직접 추가
/*
const WIDGET_LIBRARY = {
    // ... 기존 위젯들 ...
    
    myCustomWidget: {
        title: '내 커스텀 위젯',
        icon: 'bx bx-star',
        accent: 'var(--blue)',
        defaultSize: 'medium',
        defaultVisible: false,
        allowAdd: true,
        buildContent: (card) => {
            const container = document.createElement('div');
            container.className = 'my-widget-content';
            container.innerHTML = '<p>커스텀 위젯 콘텐츠</p>';
            card.appendChild(container);
        }
    }
};
*/

// ============================================
// 다크 모드 지원 예제
// ============================================
const darkModeWidgetTemplate = {
    title: '다크 모드 위젯',
    icon: 'bx bx-moon',
    accent: 'var(--blue)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'dark-mode-widget';
        
        container.innerHTML = `
            <h4>제목</h4>
            <p>내용</p>
        `;
        
        // 다크 모드 체크 및 스타일 적용
        if (document.body.classList.contains('dark')) {
            const h4 = container.querySelector('h4');
            const p = container.querySelector('p');
            if (h4) h4.style.setProperty('color', 'var(--light)');
            if (p) p.style.setProperty('color', '#AAA');
        }
        
        card.appendChild(container);
    }
};

// ============================================
// 이벤트 리스너 예제
// ============================================
const eventListenerWidgetTemplate = {
    title: '이벤트 위젯',
    icon: 'bx bx-mouse',
    accent: 'var(--orange)',
    defaultSize: 'medium',
    defaultVisible: false,
    allowAdd: true,
    buildContent: (card) => {
        const container = document.createElement('div');
        container.className = 'event-widget';
        
        container.innerHTML = `
            <button class="widget-button" id="widget-action-btn">
                클릭하세요
            </button>
            <div class="result" id="widget-result"></div>
        `;
        
        card.appendChild(container);
        
        // 이벤트 리스너 추가
        const button = container.querySelector('#widget-action-btn');
        const result = container.querySelector('#widget-result');
        
        if (button && result) {
            button.addEventListener('click', () => {
                result.textContent = '버튼이 클릭되었습니다!';
            });
        }
    }
};


