/**
 * AI ClassBoard - JavaScript
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * ClassBoard Design 인터랙션 로직 & 공통 함수
 */

// DOM 요소 선택 (전역 변수로 선언)
let sidebar = null;
let menuBtn = null;
let navbarSidebarToggle = null;
let switchMode = null;
const body = document.body;

// DOM 로드 후 요소 초기화
function initDOMElements() {
    sidebar = document.getElementById('sidebar');
    menuBtn = document.getElementById('menu-btn');
    navbarSidebarToggle = document.getElementById('navbar-sidebar-toggle');
    switchMode = document.getElementById('switch-mode');
}

// =========================
// 위젯 커스터마이징 설정
// =========================
// 
// 📚 위젯 추가 가이드:
// 새로운 위젯을 추가하려면 WIDGET_ADD_GUIDE.md 파일을 참조하세요.
// 
// 빠른 시작:
// 1. WIDGET_LIBRARY 객체에 새 위젯 정의 추가
// 2. buildContent 함수로 위젯 콘텐츠 생성
// 3. 필요시 CSS 스타일 추가
// 
// 예제:
//   yourWidgetId: {
//       title: '위젯 제목',
//       icon: 'bx bx-icon-name',
//       accent: 'var(--blue)',
//       defaultSize: 'medium',
//       defaultVisible: false,
//       allowAdd: true,
//       buildContent: (card) => { /* 콘텐츠 생성 */ }
//   }
//
// =========================

const WIDGET_STORAGE_KEY_BASE = 'classboard-widget-preferences-v1';
const widgetGrid = document.getElementById('dashboard-widget-grid');
const hiddenWidgetPanel = document.getElementById('hidden-widget-panel');
const hiddenWidgetList = document.getElementById('hidden-widget-list');
const dashboardContent = document.getElementById('dashboard-content');
const widgetAddInline = document.getElementById('widget-add-inline');
const widgetAddInlineList = document.getElementById('widget-add-inline-list');
const widgetAddInlineEmpty = document.getElementById('widget-add-inline-empty');

const widgetCardMap = new Map();
let widgetDefaultPreferences = null;
let widgetPreferences = null;
let widgetDraftPreferences = null;
let isWidgetEditMode = false;
let widgetDragSourceId = null;
let widgetEditToggleDefaultLabel = '';

/**
 * 위젯 라이브러리
 * 
 * 새로운 위젯을 추가하려면 이 객체에 위젯 정의를 추가하세요.
 * 
 * @type {Object<string, WidgetDefinition>}
 * 
 * @typedef {Object} WidgetDefinition
 * @property {string} title - 위젯 제목 (필수)
 * @property {string} icon - Boxicons 아이콘 클래스 (필수, 예: 'bx bx-icon-name')
 * @property {string} accent - 위젯 아이콘 배경색 (필수, CSS 변수 또는 색상 값)
 * @property {'small'|'medium'|'large'} defaultSize - 기본 크기 (필수)
 * @property {boolean} defaultVisible - 기본 표시 여부 (필수)
 * @property {boolean} allowAdd - 편집 모드에서 추가 가능 여부 (필수)
 * @property {string} [description] - 위젯 설명 (선택사항)
 * @property {string} [className] - 추가 CSS 클래스 (선택사항)
 * @property {function(card: HTMLElement): void} [buildContent] - 콘텐츠 생성 함수 (선택사항)
 */
const WIDGET_LIBRARY = {
    announcements: {
        title: '공지사항',
        icon: 'bx bxs-bullhorn',
        accent: 'var(--blue)',
        defaultSize: 'medium',
        defaultVisible: true,
        allowAdd: false
    },
    quickLinks: {
        title: '빠른 링크',
        icon: 'bx bxs-zap',
        accent: 'var(--orange)',
        defaultSize: 'medium',
        defaultVisible: true,
        allowAdd: false
    },
    assignments: {
        title: '과제 현황',
        icon: 'bx bxs-clipboard',
        accent: 'var(--red)',
        defaultSize: 'medium',
        defaultVisible: true,
        allowAdd: false
    },
    todayClasses: {
        title: '오늘의 수업',
        icon: 'bx bxs-calendar',
        accent: 'var(--blue)',
        defaultSize: 'large',
        defaultVisible: true,
        allowAdd: false
    },
    createSession: {
        title: '오늘의 수업 만들기',
        description: '새로운 수업 세션을 생성하세요.',
        icon: 'bx bx-plus-circle',
        accent: 'var(--blue)',
        defaultSize: 'medium',
        defaultVisible: true,
        allowAdd: false,
        buildContent: (card) => {
            const container = document.createElement('div');
            container.className = 'create-session-widget';
            container.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; min-height: 150px;';
            container.innerHTML = `
                <div style="width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), #6fa3ff); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; box-shadow: 0 8px 20px rgba(60, 145, 230, 0.3);">
                    <i class="bx bx-plus" style="font-size: 2rem; color: white;"></i>
                </div>
                <h4 style="font-size: 1.1rem; font-weight: 600; color: var(--dark); margin-bottom: 0.5rem;">새로운 수업 만들기</h4>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 1.5rem; line-height: 1.5;">오늘의 수업 세션을 생성하고<br>학생들과 함께 시작해보세요</p>
                <button class="create-session-widget-btn" id="widget-create-session-btn" style="padding: 0.75rem 1.5rem; background: var(--blue); color: white; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s ease;">
                    <i class="bx bx-plus"></i>
                    수업 만들기
                </button>
            `;
            
            // 다크모드 체크
            if (document.body.classList.contains('dark')) {
                const h4 = container.querySelector('h4');
                const p = container.querySelector('p');
                if (h4) h4.style.setProperty('color', 'var(--light)');
                if (p) p.style.setProperty('color', '#AAA');
            }
            
            card.appendChild(container);
            
            // 버튼 이벤트 리스너 추가
            const btn = container.querySelector('#widget-create-session-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    if (typeof navigateWithClassCode === 'function') {
                    navigateWithClassCode('create-session.html');
                } else {
                    window.location.href = 'create-session.html';
                }
                });
            }
        }
    },
    attendance: {
        title: '출석 현황',
        description: '클래스별 출석률과 결석 학생을 한눈에 확인하세요.',
        icon: 'bx bxs-user-check',
        accent: 'var(--yellow)',
        defaultSize: 'medium',
        defaultVisible: false,
        allowAdd: true,
        buildContent: (card) => {
            const summary = document.createElement('div');
            summary.className = 'attendance-summary';
            summary.innerHTML = `
                <div class="attendance-metrics">
                    <div class="attendance-chip">
                        <span>전체 출석률</span>
                        <strong>92%</strong>
                    </div>
                    <div class="attendance-chip">
                        <span>지각</span>
                        <strong>3명</strong>
                    </div>
                    <div class="attendance-chip">
                        <span>결석</span>
                        <strong>2명</strong>
                    </div>
                </div>
                <div class="attendance-list">
                    <div class="attendance-item">
                        <strong>3학년 2반</strong>
                        <span class="attendance-status present">24명 출석</span>
                    </div>
                    <div class="attendance-item">
                        <strong>2학년 1반</strong>
                        <span class="attendance-status present">28명 출석</span>
                    </div>
                    <div class="attendance-item">
                        <strong>AI 심화반</strong>
                        <span class="attendance-status absent">결석 1명</span>
                    </div>
                </div>
            `;
            card.appendChild(summary);
        }
    },
    aiSummary: {
        title: 'AI 인사이트',
        description: 'AI가 오늘 수업의 주요 흐름과 피드백을 요약합니다.',
        icon: 'bx bx-bot',
        accent: 'linear-gradient(135deg, #6f86ff, #9d7bff)',
        defaultSize: 'medium',
        defaultVisible: false,
        allowAdd: true,
        buildContent: (card) => {
            const container = document.createElement('div');
            container.className = 'ai-summary';
            container.innerHTML = `
                <div class="ai-summary__header">
                    <i class="bx bx-bulb"></i>
                    <span>오늘의 AI 인사이트</span>
                </div>
                <div class="ai-summary__body">
                    <div class="ai-summary__list">
                        <div class="ai-summary__item">
                            <i class="bx bx-check-circle"></i>
                            <span>학생 질문의 68%가 프로젝트 방향성에 집중되어 있으며, 다음 수업에서 데모 방향을 정리해주는 것이 좋겠습니다.</span>
                        </div>
                        <div class="ai-summary__item">
                            <i class="bx bx-trending-up"></i>
                            <span>지난 주 대비 Padlet 활동이 24% 증가했습니다. 가이드 템플릿을 유지하는 것이 효과적입니다.</span>
                        </div>
                        <div class="ai-summary__item">
                            <i class="bx bx-message-dots"></i>
                            <span>채팅에서 반복되는 키워드: <strong>#생성형AI</strong>, <strong>#데이터셋</strong>, <strong>#윤리</strong></span>
                        </div>
                    </div>
                </div>
                <div class="ai-summary__footer">업데이트 · 5분 전</div>
            `;
            card.appendChild(container);
        }
    }
};

function createWidgetControls(selectedSize = 'medium') {
    const wrapper = document.createElement('div');
    wrapper.className = 'widget-edit-controls';
    wrapper.setAttribute('data-widget-control', '');
    wrapper.hidden = true;

    // 이동 핸들 제거 (카드 드래그로 이동 가능하므로 불필요)

    const hideButton = document.createElement('button');
    hideButton.type = 'button';
    hideButton.className = 'widget-edit-hide';
    hideButton.setAttribute('data-widget-hide', '');
    hideButton.setAttribute('aria-label', '위젯 숨기기');
    hideButton.innerHTML = '<i class="bx bx-x"></i>';
    wrapper.appendChild(hideButton);

    // 리사이즈 핸들 추가
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'widget-resize-handle';
    resizeHandle.setAttribute('data-widget-resize', '');
    resizeHandle.innerHTML = '<i class="bx bx-resize"></i>';
    resizeHandle.title = '크기 조절 (드래그)';
    wrapper.appendChild(resizeHandle);
    
    return wrapper;
}

function placeCardInGrid(card) {
    if (!widgetGrid || !card) return;
    widgetGrid.appendChild(card);
}

/**
 * 위젯 요소 생성
 * 
 * 위젯 정의를 기반으로 DOM 요소를 생성합니다.
 * 
 * @param {string} widgetId - 위젯 ID
 * @param {WidgetDefinition} definition - 위젯 정의 객체
 * @returns {HTMLElement} 생성된 위젯 카드 요소
 */
function createWidgetElement(widgetId, definition) {
    const card = document.createElement('div');
    const classNames = ['dashboard-card'];
    if (definition.className) {
        classNames.push(definition.className);
    }
    card.className = classNames.join(' ');
    card.dataset.widgetId = widgetId;
    card.dataset.widgetSize = definition.defaultSize || 'medium';

    const header = document.createElement('div');
    header.className = 'card-header';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'card-icon';
    if (definition.accent) {
        iconWrapper.style.background = definition.accent;
    }
    iconWrapper.innerHTML = `<i class="${definition.icon}"></i>`;
    header.appendChild(iconWrapper);

    const titleEl = document.createElement('h3');
    titleEl.textContent = definition.title;
    header.appendChild(titleEl);

    const controls = createWidgetControls(definition.defaultSize || 'medium');
    header.appendChild(controls);

    card.appendChild(header);

    // buildContent 함수가 있으면 실행, 없으면 description 표시
    if (typeof definition.buildContent === 'function') {
        try {
            definition.buildContent(card);
        } catch (error) {
            console.error(`위젯 "${widgetId}" 콘텐츠 생성 실패:`, error);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'widget-error';
            errorMsg.innerHTML = '<p>위젯 콘텐츠를 불러올 수 없습니다.</p>';
            card.appendChild(errorMsg);
        }
    } else if (definition.description) {
        const description = document.createElement('p');
        description.className = 'text-muted';
        description.textContent = definition.description;
        card.appendChild(description);
    }

    return card;
}

/**
 * 위젯 추가 헬퍼 함수
 * 
 * 새로운 위젯을 쉽게 추가할 수 있도록 도와주는 헬퍼 함수입니다.
 * 
 * @param {string} widgetId - 위젯 ID (고유해야 함)
 * @param {WidgetDefinition} definition - 위젯 정의 객체
 * @returns {boolean} 성공 여부
 * 
 * @example
 * // 간단한 위젯 추가
 * addWidget('myWidget', {
 *     title: '내 위젯',
 *     icon: 'bx bx-star',
 *     accent: 'var(--blue)',
 *     defaultSize: 'medium',
 *     defaultVisible: false,
 *     allowAdd: true,
 *     buildContent: (card) => {
 *         card.innerHTML = '<p>위젯 콘텐츠</p>';
 *     }
 * });
 */
function addWidget(widgetId, definition) {
    // 위젯 ID 중복 체크
    if (WIDGET_LIBRARY[widgetId]) {
        console.warn(`위젯 ID "${widgetId}"가 이미 존재합니다. 기존 위젯을 덮어씁니다.`);
    }
    
    // 필수 속성 검증
    const required = ['title', 'icon', 'accent', 'defaultSize', 'defaultVisible', 'allowAdd'];
    for (const prop of required) {
        if (!(prop in definition)) {
            console.error(`위젯 "${widgetId}"에 필수 속성 "${prop}"가 없습니다.`);
            return false;
        }
    }
    
    // 위젯 라이브러리에 추가
    WIDGET_LIBRARY[widgetId] = definition;
    
    console.log(`위젯 "${widgetId}"가 추가되었습니다.`);
    return true;
}

function ensureWidgetElement(widgetId) {
    if (!widgetGrid) return null;

    if (widgetCardMap.has(widgetId)) {
        return widgetCardMap.get(widgetId);
    }

    let card = widgetGrid.querySelector(`.dashboard-card[data-widget-id="${widgetId}"]`);
    if (!card) {
        const definition = WIDGET_LIBRARY[widgetId];
        if (!definition) return null;
        card = createWidgetElement(widgetId, definition);
        placeCardInGrid(card);
    }

    widgetCardMap.set(widgetId, card);
    attachWidgetCardListeners(card);
    return card;
}

// =========================
// 사이드바 메뉴 커스터마이징 설정
// =========================
// 
// 📚 사이드바 메뉴 커스터마이징:
// 대시보드 위젯 시스템과 유사하게 사이드바 메뉴도 커스터마이징 가능합니다.
// - 드래그 앤 드롭으로 메뉴 순서 변경
// - 메뉴 아이템 숨기기/표시
// - 편집 모드 토글
// - 설정 저장/로드
//
// =========================

const SIDEBAR_MENU_STORAGE_KEY_BASE = 'classboard-sidebar-menu-preferences-v1';
const sidebarMenu = document.getElementById('sidebar-menu') || document.querySelector('.sidebar-menu');
const sidebarMenuMap = new Map();
let sidebarMenuDefaultPreferences = null;
let sidebarMenuPreferences = null;
let sidebarMenuDraftPreferences = null;
let isSidebarMenuEditMode = false;

/**
 * 사이드바 메뉴 라이브러리
 * 
 * 사이드바에 표시될 메뉴 아이템들을 정의합니다.
 * 
 * @type {Object<string, MenuItemDefinition>}
 * 
 * @typedef {Object} MenuItemDefinition
 * @property {string} title - 메뉴 제목 (필수)
 * @property {string} icon - Boxicons 아이콘 클래스 (필수)
 * @property {string} href - 링크 주소 (필수, 예: '#dashboard')
 * @property {string} tooltip - 툴팁 텍스트 (선택사항)
 * @property {boolean} defaultVisible - 기본 표시 여부 (필수)
 * @property {boolean} allowHide - 숨기기 가능 여부 (필수)
 * @property {number} defaultOrder - 기본 순서 (필수, 낮을수록 위에 표시)
 */
const MENU_LIBRARY = {
    dashboard: {
        title: '대시보드',
        icon: 'bx bxs-home',
        href: '#dashboard',
        tooltip: '대시보드',
        defaultVisible: true,
        allowHide: true,  // 숨길 수 있지만 모달에서 다시 추가 가능
        defaultOrder: 1
    },
    activity: {
        title: '활동',
        icon: 'bx bxs-grid-alt',
        href: '#activity',
        tooltip: '활동',
        defaultVisible: true,
        allowHide: true,
        defaultOrder: 2
    },
    ask: {
        title: '채팅',
        icon: 'bx bxs-chat',
        href: '#ask',
        tooltip: '채팅',
        defaultVisible: true,
        allowHide: true,
        defaultOrder: 3
    },
    cloud: {
        title: '클라우드',
        icon: 'bx bxs-cloud',
        href: '#cloud',
        tooltip: '클라우드',
        defaultVisible: true,
        allowHide: true,
        defaultOrder: 4
    },
    quiz: {
        title: '퀴즈',
        icon: 'bx bxs-brain',
        href: '#quiz',
        tooltip: '퀴즈',
        defaultVisible: true,
        allowHide: true,
        defaultOrder: 5
    },
    materials: {
        title: '자료',
        icon: 'bx bxs-folder',
        href: '#materials',
        tooltip: '자료',
        defaultVisible: true,
        allowHide: true,
        defaultOrder: 6
    },
    settings: {
        title: '설정',
        icon: 'bx bxs-cog',
        href: '#settings',
        tooltip: '설정',
        defaultVisible: true,
        allowHide: true,  // 숨길 수 있지만 모달에서 다시 추가 가능
        defaultOrder: 7
    }
};

/**
 * 사이드바 메뉴 아이템 생성
 * 
 * @param {string} menuId - 메뉴 ID
 * @param {MenuItemDefinition} definition - 메뉴 정의 객체
 * @returns {HTMLElement} 생성된 메뉴 아이템 요소
 */
function createMenuItemElement(menuId, definition) {
    const li = document.createElement('li');
    li.className = 'menu-item';
    li.dataset.menuId = menuId;
    li.draggable = isSidebarMenuEditMode;
    
    const link = document.createElement('a');
    link.href = definition.href;
    link.className = 'menu-link';
    link.setAttribute('data-tooltip', definition.tooltip || definition.title);
    
    const icon = document.createElement('i');
    icon.className = definition.icon;
    link.appendChild(icon);
    
    const text = document.createElement('span');
    text.className = 'menu-text';
    text.textContent = definition.title;
    link.appendChild(text);
    
    // 편집 모드 컨트롤
    if (isSidebarMenuEditMode && definition.allowHide) {
        const hideBtn = document.createElement('button');
        hideBtn.className = 'menu-hide-btn';
        hideBtn.type = 'button';
        hideBtn.setAttribute('data-menu-hide', '');
        hideBtn.innerHTML = '<i class="bx bx-x"></i>';
        hideBtn.setAttribute('aria-label', '메뉴 숨기기');
        li.appendChild(hideBtn);
    }
    
    li.appendChild(link);
    
    return li;
}

/**
 * 사이드바 메뉴 기본 설정 생성
 * 
 * @returns {Object} 기본 설정 객체
 */
function buildDefaultSidebarMenuPreferences() {
    const menuIds = Object.keys(MENU_LIBRARY);
    const order = menuIds.sort((a, b) => {
        const orderA = MENU_LIBRARY[a].defaultOrder || 999;
        const orderB = MENU_LIBRARY[b].defaultOrder || 999;
        return orderA - orderB;
    });
    
    const settings = {};
    menuIds.forEach(id => {
        settings[id] = {
            isVisible: MENU_LIBRARY[id].defaultVisible !== false
        };
    });
    
    return { order, settings };
}

/**
 * 사이드바 메뉴 설정 로드
 * 
 * @param {Object} defaults - 기본 설정
 * @returns {Object} 로드된 설정
 */
function loadSidebarMenuPreferences(defaults) {
    try {
        // 클래스별 스토리지 키 사용
        const storageKey = getClassStorageKey(SIDEBAR_MENU_STORAGE_KEY_BASE);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            // 기본 설정과 병합
            return {
                order: parsed.order || defaults.order,
                settings: { ...defaults.settings, ...(parsed.settings || {}) }
            };
        }
    } catch (error) {
        console.error('사이드바 메뉴 설정 로드 실패:', error);
    }
    return defaults;
}

/**
 * 사이드바 메뉴 설정 저장
 * 
 * @param {Object} preferences - 저장할 설정
 */
function persistSidebarMenuPreferences(preferences) {
    try {
        // 클래스별 스토리지 키 사용
        const storageKey = getClassStorageKey(SIDEBAR_MENU_STORAGE_KEY_BASE);
        localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
        console.error('사이드바 메뉴 설정 저장 실패:', error);
    }
}

/**
 * 사이드바 메뉴 렌더링
 */
function renderSidebarMenu() {
    if (!sidebarMenu) return;
    
    const preferences = sidebarMenuDraftPreferences || sidebarMenuPreferences || sidebarMenuDefaultPreferences;
    if (!preferences) return;
    
    const { order, settings } = preferences;
    
    // 표시 가능한 메뉴만 필터링
    const visibleMenuIds = order.filter(id => {
        const setting = settings[id];
        return setting && setting.isVisible !== false;
    });
    
    // 기존 메뉴와 새 메뉴 비교하여 애니메이션 처리
    const existingMenuIds = Array.from(sidebarMenuMap.keys());
    const newMenuIds = visibleMenuIds;
    
    // 제거할 메뉴 찾기
    const toRemove = existingMenuIds.filter(id => !newMenuIds.includes(id));
    toRemove.forEach(menuId => {
        const menuItem = sidebarMenuMap.get(menuId);
        if (menuItem) {
            menuItem.classList.add('menu-item-removing');
            setTimeout(() => {
                menuItem.remove();
                sidebarMenuMap.delete(menuId);
            }, 300);
        }
    });
    
    // 새로 추가할 메뉴 찾기
    const toAdd = newMenuIds.filter(id => !existingMenuIds.includes(id));
    
    // 기존 메뉴 순서 업데이트
    const existingItems = Array.from(sidebarMenu.querySelectorAll('.menu-item:not(.menu-item-removing)'));
    const menuItemMap = new Map();
    existingItems.forEach(item => {
        const menuId = item.dataset.menuId;
        if (menuId) menuItemMap.set(menuId, item);
    });
    
    // 순서에 맞게 재배치
    visibleMenuIds.forEach((menuId, index) => {
        const existingItem = menuItemMap.get(menuId);
        if (existingItem) {
            // 순서가 변경된 경우 애니메이션과 함께 이동
            const currentIndex = Array.from(sidebarMenu.children).indexOf(existingItem);
            if (currentIndex !== index) {
                existingItem.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    sidebarMenu.insertBefore(existingItem, sidebarMenu.children[index] || null);
                }, 10);
            }
        } else {
            // 새 메뉴 추가
            const definition = MENU_LIBRARY[menuId];
            if (!definition) return;
            
            const menuItem = createMenuItemElement(menuId, definition);
            menuItem.style.opacity = '0';
            menuItem.style.transform = 'translateX(-20px)';
            
            const insertBefore = sidebarMenu.children[index] || null;
            if (insertBefore) {
                sidebarMenu.insertBefore(menuItem, insertBefore);
            } else {
                sidebarMenu.appendChild(menuItem);
            }
            
            sidebarMenuMap.set(menuId, menuItem);
            attachMenuItemListeners(menuItem, menuId);
            
            // 페이드 인 애니메이션
            requestAnimationFrame(() => {
                menuItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                menuItem.style.opacity = '1';
                menuItem.style.transform = 'translateX(0)';
            });
        }
    });
    
    // 드래그 앤 드롭 설정
    if (isSidebarMenuEditMode) {
        attachSidebarMenuDragListeners();
    }
}

/**
 * 메뉴 아이템 이벤트 리스너 추가
 * 
 * @param {HTMLElement} menuItem - 메뉴 아이템 요소
 * @param {string} menuId - 메뉴 ID
 */
function attachMenuItemListeners(menuItem, menuId) {
    const link = menuItem.querySelector('.menu-link');
    if (!link) return;
    
    // 중복 리스너 방지
    if (menuItem.dataset.listenerAdded === 'true') return;
    menuItem.dataset.listenerAdded = 'true';
    
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 이벤트 버블링 방지
        
        // 모든 메뉴에서 active 제거
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 현재 메뉴에 active 추가
        menuItem.classList.add('active');
        
        // 페이지 전환
        const href = link.getAttribute('href');
        if (href && window.switchPage) {
            console.log('메뉴 클릭 - 페이지 전환:', href);
            window.switchPage(href);
        } else {
            console.warn('switchPage 함수를 찾을 수 없거나 href가 없습니다:', href);
        }
        
        // 모바일에서 사이드바 닫기
        const sidebarEl = document.getElementById('sidebar');
        if (window.innerWidth <= 768 && sidebarEl) {
            sidebarEl.classList.remove('active');
        }
        
        return false; // 추가 안전장치
    });
    
    // 숨기기 버튼 이벤트
    const hideBtn = menuItem.querySelector('[data-menu-hide]');
    if (hideBtn) {
        hideBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const definition = MENU_LIBRARY[menuId];
            const menuTitle = definition?.title || '메뉴';
            
            // 확인 메시지
            if (confirm(`${menuTitle} 메뉴를 숨기시겠습니까? 숨긴 메뉴는 '메뉴 추가' 버튼을 통해 다시 추가할 수 있습니다.`)) {
                hideMenuItem(menuId);
            }
        });
    }
}

/**
 * 메뉴 아이템 숨기기
 * 
 * @param {string} menuId - 메뉴 ID
 */
function hideMenuItem(menuId) {
    if (!sidebarMenuDraftPreferences) return;
    
    const setting = sidebarMenuDraftPreferences.settings[menuId];
    if (setting) {
        const menuItem = sidebarMenuMap.get(menuId);
        if (menuItem) {
            // 페이드 아웃 애니메이션
            menuItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            menuItem.style.opacity = '0';
            menuItem.style.transform = 'translateX(-20px)';
            menuItem.style.maxHeight = menuItem.offsetHeight + 'px';
            
            setTimeout(() => {
                setting.isVisible = false;
                renderSidebarMenu();
            }, 300);
        } else {
            setting.isVisible = false;
            renderSidebarMenu();
        }
    }
}

/**
 * 사이드바 메뉴 드래그 앤 드롭 리스너 설정
 */
function attachSidebarMenuDragListeners() {
    if (!sidebarMenu) return;
    
    const menuItems = sidebarMenu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.draggable = true;
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.menuId);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const dragging = sidebarMenu.querySelector('.dragging');
            if (!dragging || dragging === item) return;
            
            // 드래그 오버 표시
            item.classList.add('drag-over');
            
            const items = Array.from(sidebarMenu.querySelectorAll('.menu-item:not(.dragging)'));
            const afterElement = getDragAfterElement(sidebarMenu, e.clientY);
            
            if (afterElement == null) {
                sidebarMenu.appendChild(dragging);
            } else {
                sidebarMenu.insertBefore(dragging, afterElement);
            }
        });
        
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const menuId = e.dataTransfer.getData('text/plain');
            updateMenuOrder(menuId);
        });
    });
}

/**
 * 드래그 후 위치 계산
 * 
 * @param {HTMLElement} container - 컨테이너 요소
 * @param {number} y - 마우스 Y 좌표
 * @returns {HTMLElement|null} 삽입 위치 요소
 */
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.menu-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * 메뉴 순서 업데이트
 * 
 * @param {string} draggedMenuId - 드래그된 메뉴 ID
 */
function updateMenuOrder(draggedMenuId) {
    if (!sidebarMenuDraftPreferences) return;
    
    const menuItems = Array.from(sidebarMenu.querySelectorAll('.menu-item'));
    const newOrder = menuItems.map(item => item.dataset.menuId);
    
    sidebarMenuDraftPreferences.order = newOrder;
    renderSidebarMenu();
}

/**
 * 사이드바 메뉴 편집 모드 토글
 * 
 * @param {boolean} enabled - 편집 모드 활성화 여부
 */
function toggleSidebarMenuEditMode(enabled) {
    isSidebarMenuEditMode = enabled;
    
    const addBtnContainer = document.getElementById('sidebar-menu-add-btn-container');
    
    if (enabled) {
        sidebarMenu?.classList.add('edit-mode');
        renderSidebarMenu();
        renderHiddenMenuPanel();
        
        // 메뉴 추가 버튼 표시
        if (addBtnContainer) {
            addBtnContainer.hidden = false;
        }
    } else {
        sidebarMenu?.classList.remove('edit-mode');
        // 변경사항 저장
        if (sidebarMenuDraftPreferences) {
            sidebarMenuPreferences = JSON.parse(JSON.stringify(sidebarMenuDraftPreferences));
            persistSidebarMenuPreferences(sidebarMenuPreferences);
            sidebarMenuDraftPreferences = JSON.parse(JSON.stringify(sidebarMenuPreferences));
        }
        renderSidebarMenu();
        
        // 메뉴 추가 버튼 숨김
        if (addBtnContainer) {
            addBtnContainer.hidden = true;
        }
        
        // 모달 닫기
        const modal = document.getElementById('sidebar-menu-add-modal');
        if (modal) {
            modal.hidden = true;
        }
    }
}

/**
 * 숨겨진 메뉴 패널 렌더링
 */
function renderHiddenMenuPanel() {
    // 향후 구현: 숨겨진 메뉴 목록 표시
    // 대시보드 위젯 시스템과 유사하게 구현 가능
}

/**
 * 사용 가능한 메뉴 ID 목록 가져오기
 * 
 * @returns {string[]} 추가 가능한 메뉴 ID 배열
 */
function getAvailableMenuIds() {
    if (!sidebarMenuDraftPreferences) return [];
    
    const { order, settings } = sidebarMenuDraftPreferences;
    const visibleMenuIds = new Set();
    
    // 현재 표시 중인 메뉴 ID
    order.forEach(id => {
        const setting = settings[id];
        if (setting && setting.isVisible !== false) {
            visibleMenuIds.add(id);
        }
    });
    
    // 모든 메뉴 중에서 숨겨진 메뉴만 반환
    return Object.keys(MENU_LIBRARY).filter(id => {
        return !visibleMenuIds.has(id);
    });
}

/**
 * 메뉴 추가 모달 열기
 */
function openMenuAddModal() {
    const modal = document.getElementById('sidebar-menu-add-modal');
    const menuList = document.getElementById('available-menu-list');
    const emptyState = document.getElementById('available-menu-empty');
    
    if (!modal || !menuList) return;
    
    const availableMenuIds = getAvailableMenuIds();
    
    // 기존 목록 제거
    menuList.innerHTML = '';
    
    if (availableMenuIds.length === 0) {
        // 추가 가능한 메뉴가 없음
        if (emptyState) {
            emptyState.hidden = false;
        }
        menuList.hidden = true;
    } else {
        // 추가 가능한 메뉴 목록 표시
        if (emptyState) {
            emptyState.hidden = true;
        }
        menuList.hidden = false;
        
        // 기본 순서대로 정렬
        const sortedMenuIds = availableMenuIds.sort((a, b) => {
            const orderA = MENU_LIBRARY[a]?.defaultOrder || 999;
            const orderB = MENU_LIBRARY[b]?.defaultOrder || 999;
            return orderA - orderB;
        });
        
        sortedMenuIds.forEach(menuId => {
            const definition = MENU_LIBRARY[menuId];
            if (!definition) return;
            
            const menuItem = document.createElement('div');
            menuItem.className = 'available-menu-item';
            menuItem.dataset.menuId = menuId;
            
            // 메뉴 아이템 전체 클릭 가능
            menuItem.style.cursor = 'pointer';
            
            menuItem.innerHTML = `
                <div class="available-menu-icon" style="background: ${definition.accent || 'var(--blue)'};">
                    <i class="${definition.icon}"></i>
                </div>
                <div class="available-menu-info">
                    <h4>${definition.title}</h4>
                    ${definition.description ? `<p>${definition.description}</p>` : ''}
                </div>
                <button class="available-menu-add-btn" type="button" aria-label="메뉴 추가">
                    <i class="bx bx-plus"></i>
                </button>
            `;
            
            // 메뉴 아이템 전체 클릭 이벤트
            menuItem.addEventListener('click', (e) => {
                // 버튼 클릭이 아닌 경우에만
                if (!e.target.closest('.available-menu-add-btn')) {
                    restoreMenuItem(menuId);
                    modal.hidden = true;
                }
            });
            
            // 추가 버튼 클릭 이벤트
            const addBtn = menuItem.querySelector('.available-menu-add-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    restoreMenuItem(menuId);
                    // 모달 닫기
                    modal.hidden = true;
                });
            }
            
            menuList.appendChild(menuItem);
        });
    }
    
    // 모달 표시
    modal.hidden = false;
}

/**
 * 메뉴 추가 모달 닫기
 */
function closeMenuAddModal() {
    const modal = document.getElementById('sidebar-menu-add-modal');
    if (modal) {
        modal.hidden = true;
    }
}

/**
 * 숨겨진 메뉴 다시 추가
 * 
 * @param {string} menuId - 메뉴 ID
 */
function restoreMenuItem(menuId) {
    if (!sidebarMenuDraftPreferences) return;
    
    const definition = MENU_LIBRARY[menuId];
    if (!definition) {
        console.warn(`메뉴 ID "${menuId}"를 찾을 수 없습니다.`);
        return;
    }
    
    // 설정이 없으면 생성
    if (!sidebarMenuDraftPreferences.settings[menuId]) {
        sidebarMenuDraftPreferences.settings[menuId] = {
            isVisible: true
        };
    } else {
        sidebarMenuDraftPreferences.settings[menuId].isVisible = true;
    }
    
    // order에 없으면 기본 순서에 맞게 추가
    if (!sidebarMenuDraftPreferences.order.includes(menuId)) {
        const defaultOrder = definition.defaultOrder || 999;
        const insertIndex = sidebarMenuDraftPreferences.order.findIndex(id => {
            const otherDef = MENU_LIBRARY[id];
            return otherDef && (otherDef.defaultOrder || 999) > defaultOrder;
        });
        
        if (insertIndex === -1) {
            sidebarMenuDraftPreferences.order.push(menuId);
        } else {
            sidebarMenuDraftPreferences.order.splice(insertIndex, 0, menuId);
        }
    }
    
    // 메뉴 다시 렌더링
    renderSidebarMenu();
}

function getAvailableWidgetIds(preferences = widgetDraftPreferences || widgetPreferences || widgetDefaultPreferences) {
    if (!preferences) return [];
    const order = preferences.order ?? [];
    const settings = preferences.settings ?? {};
    
    // visible인 위젯 ID만 제외 (숨겨진 위젯은 포함)
    const visibleWidgetIds = new Set();
    
    order.forEach(id => {
        const setting = settings[id];
        // isVisible이 명시적으로 false가 아니면 visible로 간주
        // setting이 없거나 isVisible이 undefined이면 기본값 true로 간주
        if (!setting || setting.isVisible !== false) {
            visibleWidgetIds.add(id);
        }
    });
    
    // 모든 위젯 ID 가져오기 (allowAdd와 관계없이, 숨겨진 위젯은 추가 가능하도록)
    const allWidgetIds = Object.keys(WIDGET_LIBRARY);
    
    // visible하지 않은 위젯만 반환 (숨겨진 위젯 포함)
    // order에 있지만 숨겨진 위젯(isVisible === false)은 포함
    // order에 없는 위젯 중 allowAdd !== false인 위젯도 포함
    return allWidgetIds.filter((id) => {
        // visible한 위젯은 제외
        if (visibleWidgetIds.has(id)) {
            return false;
        }
        
        // order에 있으면 숨겨진 위젯이므로 포함 (allowAdd와 무관)
        if (order.includes(id)) {
            return true;
        }
        
        // order에 없으면 allowAdd !== false인 위젯만 포함
        const definition = WIDGET_LIBRARY[id];
        return definition && definition.allowAdd !== false;
    });
}

function collectWidgetCards() {
    widgetCardMap.clear();
    if (!widgetGrid) return;

    const cards = widgetGrid.querySelectorAll('.dashboard-card[data-widget-id]');
    cards.forEach(card => {
        const widgetId = card.getAttribute('data-widget-id');
        if (!widgetId) return;
        widgetCardMap.set(widgetId, card);
        attachWidgetCardListeners(card);
    });
}

function buildDefaultWidgetPreferences() {
    const order = [];
    const settings = {};

    Object.entries(WIDGET_LIBRARY).forEach(([widgetId, definition]) => {
        const defaultSize = normalizeWidgetSize(definition.defaultSize, 'medium');
        const isVisible = definition.defaultVisible !== false;
        settings[widgetId] = {
            isVisible,
            size: defaultSize,
        };
        if (isVisible) {
            ensureWidgetElement(widgetId);
            if (!order.includes(widgetId)) {
                order.push(widgetId);
            }
        }
    });

    return { order, settings };
}

function normalizeWidgetSize(size, fallback = 'medium') {
    if (size === 'small' || size === 'medium' || size === 'large') {
        return size;
    }
    return fallback;
}

function clonePreferences(preferences) {
    return {
        order: Array.isArray(preferences?.order) ? [...preferences.order] : [],
        settings: preferences?.settings
            ? Object.keys(preferences.settings).reduce((acc, key) => {
                  acc[key] = { ...preferences.settings[key] };
                  return acc;
              }, {})
            : {}
    };
}

function mergeStoredPreferences(stored, defaults) {
    const merged = clonePreferences(defaults);
    if (!stored || typeof stored !== 'object') {
        return merged;
    }

    const storedOrder = Array.isArray(stored.order) ? stored.order : [];
    const uniqueOrder = [];
    storedOrder.forEach(id => {
        if (!uniqueOrder.includes(id) && defaults.settings[id]) {
            uniqueOrder.push(id);
        }
    });
    defaults.order.forEach(id => {
        if (!uniqueOrder.includes(id)) {
            uniqueOrder.push(id);
        }
    });
    merged.order = uniqueOrder;

    merged.order.forEach(id => {
        const defaultSetting = defaults.settings[id] || { isVisible: true, size: 'medium' };
        const storedSetting = stored.settings?.[id] || {};
        merged.settings[id] = {
            isVisible: typeof storedSetting.isVisible === 'boolean' ? storedSetting.isVisible : defaultSetting.isVisible,
            size: normalizeWidgetSize(storedSetting.size, defaultSetting.size)
        };
    });

    return merged;
}

function loadWidgetPreferences(defaults) {
    try {
        // 클래스별 스토리지 키 사용
        const storageKey = getClassStorageKey(WIDGET_STORAGE_KEY_BASE);
        const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
        return mergeStoredPreferences(stored, defaults);
    } catch (error) {
        console.error('위젯 설정을 불러오는 중 오류가 발생했습니다.', error);
        return clonePreferences(defaults);
    }
}

function persistWidgetPreferences(preferences) {
    try {
        // 클래스별 스토리지 키 사용
        const storageKey = getClassStorageKey(WIDGET_STORAGE_KEY_BASE);
        localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
        console.error('위젯 설정을 저장하는 중 오류가 발생했습니다.', error);
    }
}

function commitDraftPreferences() {
    widgetPreferences = clonePreferences(widgetDraftPreferences);
    persistWidgetPreferences(widgetPreferences);
    widgetDraftPreferences = clonePreferences(widgetPreferences);
}

function setStatusMessage(message, iconClass = 'bx bx-layout') {
    // 상태 메시지 UI는 선택적 요소이므로 존재할 때만 업데이트
    const statusText = document.getElementById('widget-status-text');
    const statusIcon = document.getElementById('widget-status-icon');
    if (statusText) {
        statusText.textContent = message;
    }
    if (statusIcon) {
        statusIcon.className = iconClass;
    }
}

function renderWidgetState(preferences, { editing = true } = {}) {
    if (!widgetGrid) return;

    const pref = preferences;
    pref.order.forEach(ensureWidgetElement);
    collectWidgetCards();

    const defaults = widgetDefaultPreferences?.settings || {};

    const normalizedOrder = [];
    pref.order.forEach(id => {
        if (widgetCardMap.has(id) && !normalizedOrder.includes(id)) {
            normalizedOrder.push(id);
        }
    });
    widgetCardMap.forEach((_, id) => {
        if (!normalizedOrder.includes(id)) {
            normalizedOrder.push(id);
        }
    });
    pref.order = normalizedOrder;

    const hiddenIds = [];

    normalizedOrder.forEach(id => {
        const card = ensureWidgetElement(id);
        if (!card) return;

        const defaultSetting = defaults[id] || { isVisible: true, size: 'medium' };
        const currentSetting = pref.settings[id] || { ...defaultSetting };
        pref.settings[id] = currentSetting;

        const isVisible = currentSetting.isVisible !== false;
        const size = normalizeWidgetSize(currentSetting.size, defaultSetting.size);
        currentSetting.size = size;

        card.classList.remove('widget-drop-target', 'widget-dragging');

        if (isVisible) {
            card.dataset.hidden = 'false';
            card.style.display = '';
            card.setAttribute('data-widget-size', size);
            placeCardInGrid(card);
        } else {
            card.dataset.hidden = 'true';
            card.style.display = 'none';
            hiddenIds.push(id);
        }

        // 편집 모드에서 크기는 data-widget-size 속성으로 관리됨
    });

    if (editing && hiddenWidgetPanel && hiddenWidgetList) {
        hiddenWidgetList.innerHTML = '';
        if (hiddenIds.length === 0) {
            hiddenWidgetPanel.hidden = true;
        } else {
            hiddenWidgetPanel.hidden = false;
            hiddenIds.forEach(id => {
                const card = widgetCardMap.get(id);
                if (!card) return;
                const title = card.querySelector('.card-header h3')?.textContent ?? id;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'hidden-widget-button';
                button.dataset.widgetId = id;
                button.innerHTML = `<i class="bx bx-show"></i>${title}`;
                button.addEventListener('click', () => handleWidgetShow(id));
                hiddenWidgetList.appendChild(button);
            });
        }
    } else if (hiddenWidgetPanel && hiddenWidgetList) {
        hiddenWidgetPanel.hidden = true;
        hiddenWidgetList.innerHTML = '';
    }

    setCardsDraggable(editing);
    refreshWidgetPicker(pref);
}

function setCardsDraggable(enabled) {
    const cardsArray = Array.from(widgetCardMap.values());
    
    cardsArray.forEach((card, index) => {
        card.setAttribute('draggable', enabled ? 'true' : 'false');
        
        // 위젯 테두리 리사이즈 기능 추가/제거
        if (enabled) {
            // 편집 모드 활성화: 테두리 드래그 기능 추가
            attachWidgetResizeListeners(card);
        } else {
            // 편집 모드 비활성화: 리사이즈 영역 제거
            const resizeArea = card.querySelector('.widget-resize-area');
            if (resizeArea) {
                resizeArea.remove();
            }
            card.style.cursor = '';
        }
        
        // 각 위젯마다 약간씩 딜레이를 주어 순차적으로 나타나게
        setTimeout(() => {
            if (enabled) {
                // 편집 모드 활성화: 자연스러운 입체 효과
                card.classList.add('widget-edit-mode-active');
                card.style.transition = 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.transform = 'perspective(1000px) translateZ(15px) rotateX(-1.5deg)';
            } else {
                // 편집 모드 비활성화: 부드럽게 원래 위치로
                card.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.transform = 'perspective(1000px) translateZ(0px) rotateX(0deg)';
                
                setTimeout(() => {
                    card.classList.remove('widget-edit-mode-active');
                    card.style.transition = '';
                    card.style.transform = '';
                }, 300);
            }
        }, index * 20); // 각 위젯마다 20ms씩 딜레이 (더 빠른 순차 효과)
    });
    
    // 위젯 편집 컨트롤 표시/숨김
    const editControls = document.querySelectorAll('[data-widget-control]');
        editControls.forEach((control, index) => {
        if (enabled) {
            control.removeAttribute('hidden');
            // 컨트롤도 순차적으로 나타나도록 (더 부드럽게)
            control.style.opacity = '0';
            control.style.transform = 'scale(0.9)';
            setTimeout(() => {
                control.style.transition = 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                control.style.opacity = '1';
                control.style.transform = 'scale(1)';
                setTimeout(() => {
                    control.style.transition = '';
                }, 250);
            }, cardsArray.length * 20 + 150 + index * 20);
        } else {
            control.setAttribute('hidden', '');
            control.style.opacity = '';
            control.style.transform = '';
            control.style.transition = '';
        }
    });
}

function refreshWidgetPicker(preferences) {
    if (!widgetAddInline) return;
    const availableIds = getAvailableWidgetIds(preferences);

    if (!availableIds.length) {
        if (widgetAddInlineList) {
            widgetAddInlineList.innerHTML = '';
        }
        if (widgetAddInlineEmpty) {
            widgetAddInlineEmpty.hidden = false;
        }
        widgetAddInline.hidden = false;
        return;
    }

    populateWidgetAddOptions(availableIds);
    widgetAddInline.hidden = false;
    if (widgetAddInlineEmpty) {
        widgetAddInlineEmpty.hidden = true;
    }
}

function populateWidgetAddOptions(availableIds) {
    if (!widgetAddInlineList) return;
    widgetAddInlineList.innerHTML = '';
    let hasOptions = false;
    availableIds.forEach((widgetId) => {
        const definition = WIDGET_LIBRARY[widgetId];
        if (!definition) return;
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'widget-add-option';
        option.dataset.widgetId = widgetId;

        const icon = document.createElement('span');
        icon.className = 'widget-add-option__icon';
        if (definition.accent) {
            icon.style.background = definition.accent;
        }
        icon.style.color = '#fff';
        icon.innerHTML = `<i class="${definition.icon}"></i>`;

        const content = document.createElement('span');
        content.className = 'widget-add-option__content';

        const title = document.createElement('span');
        title.className = 'widget-add-option__title';
        title.textContent = definition.title;

        const desc = document.createElement('span');
        desc.className = 'widget-add-option__desc';
        desc.textContent =
            definition.description ?? '대시보드에 바로 사용할 수 있는 위젯입니다.';

        const meta = document.createElement('span');
        meta.className = 'widget-add-option__meta';
        const sizeLabel =
            definition.defaultSize === 'large'
                ? '큼'
                : definition.defaultSize === 'small'
                    ? '작음'
                    : '보통';
        meta.textContent = `기본 크기 · ${sizeLabel}`;

        content.append(title, desc, meta);
        option.append(icon, content);
        option.addEventListener('click', () => handleWidgetOptionSelect(widgetId));
        widgetAddInlineList.appendChild(option);
        hasOptions = true;
    });
    if (widgetAddInlineEmpty) {
        widgetAddInlineEmpty.hidden = hasOptions;
    }
}

function handleWidgetOptionSelect(widgetId) {
    if (!widgetDraftPreferences) return;
    if (!widgetDraftPreferences.order.includes(widgetId)) {
        widgetDraftPreferences.order.push(widgetId);
    }
    
    const definition = WIDGET_LIBRARY[widgetId] || {};
    
    // 기존 설정이 있으면 유지하고, 없으면 새로 생성 (이전 내용 보존)
    const existingSettings = widgetDraftPreferences.settings[widgetId];
    if (existingSettings) {
        // 기존 설정 유지, visible만 true로 변경
        existingSettings.isVisible = true;
        widgetDraftPreferences.settings[widgetId] = existingSettings;
    } else {
        // 새 위젯이면 기본 설정 생성
    widgetDraftPreferences.settings[widgetId] = {
        isVisible: true,
        size: normalizeWidgetSize(definition.defaultSize, 'medium'),
    };
    }
    
    ensureWidgetElement(widgetId);
    commitDraftPreferences();
    renderWidgetState(widgetDraftPreferences, { editing: true });
    refreshWidgetPicker(widgetDraftPreferences);
    
    const title = definition.title ?? '위젯';
    if (existingSettings) {
        setStatusMessage(`${title}을 다시 추가했습니다. 이전 내용이 보존되었습니다.`, 'bx bx-check-circle');
    } else {
        setStatusMessage(`${title}을 추가했습니다. 변경 사항이 저장되었습니다.`, 'bx bx-check-circle');
    }
}

function handleWidgetHide(widgetId) {
    if (!widgetDraftPreferences) return;
    const settings = widgetDraftPreferences.settings[widgetId] || { isVisible: true, size: 'medium' };
    
    // 위젯의 현재 데이터 저장 (이전 내용 보존)
    const card = widgetCardMap.get(widgetId);
    if (card) {
        // 위젯의 데이터를 settings에 저장 (내용 보존)
        // 이미 settings에 저장된 내용은 유지됨
    }
    
    // 숨김 처리
    settings.isVisible = false;
    widgetDraftPreferences.settings[widgetId] = settings;
    
    // 변경사항 저장 (이전 내용 포함하여 저장)
    commitDraftPreferences();
    
    // 상태 렌더링 (위젯을 그리드에서 제거)
    renderWidgetState(widgetDraftPreferences, { editing: true });
    
    // 위젯 선택 카드 업데이트 (숨겨진 위젯을 추가 목록에 표시)
    refreshWidgetPicker(widgetDraftPreferences);
    
    // 위젯 추가 카드가 숨겨져 있으면 표시
    if (widgetAddInline && widgetAddInline.hidden) {
        widgetAddInline.hidden = false;
    }
    
    // 위젯 추가 카드로 스크롤
    if (widgetAddInline) {
        setTimeout(() => {
            widgetAddInline.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
    
    setStatusMessage('위젯을 숨겼습니다. 위젯 선택 카드에서 다시 추가할 수 있습니다.', 'bx bx-low-vision');
}

function handleWidgetShow(widgetId) {
    if (!widgetDraftPreferences) return;
    const settings = widgetDraftPreferences.settings[widgetId] || { isVisible: true, size: 'medium' };
    settings.isVisible = true;
    widgetDraftPreferences.settings[widgetId] = settings;
    commitDraftPreferences();
    renderWidgetState(widgetDraftPreferences, { editing: true });
    refreshWidgetPicker(widgetDraftPreferences);
    setStatusMessage('위젯을 다시 표시합니다.', 'bx bx-show');
}

function handleWidgetSizeChange(widgetId, size) {
    if (!widgetDraftPreferences) return;
    const normalized = normalizeWidgetSize(size);
    const settings = widgetDraftPreferences.settings[widgetId] || { isVisible: true, size: 'medium' };
    settings.size = normalized;
    widgetDraftPreferences.settings[widgetId] = settings;
    commitDraftPreferences();
    
    // 애니메이션 완료 후 상태 업데이트 (부드러운 전환을 위해)
    setTimeout(() => {
    renderWidgetState(widgetDraftPreferences, { editing: true });
    refreshWidgetPicker(widgetDraftPreferences);
    }, 250); // CSS transition 시간과 일치
}

function attachWidgetCardListeners(card) {
    if (!card || card.dataset.widgetInitialized === 'true') return;
    card.dataset.widgetInitialized = 'true';

    card.addEventListener('dragstart', handleWidgetDragStart);
    card.addEventListener('dragend', handleWidgetDragEnd);
    card.addEventListener('dragover', handleWidgetCardDragOver);
    card.addEventListener('dragenter', handleWidgetDragEnter);
    card.addEventListener('dragleave', handleWidgetDragLeave);
    card.addEventListener('drop', handleWidgetDrop);

    const hideButton = card.querySelector('[data-widget-hide]');
    if (hideButton) {
        hideButton.addEventListener('click', () => handleWidgetHide(card.getAttribute('data-widget-id')));
    }
    // 리사이즈 핸들 숨기기 (테두리 드래그 방식 사용)
    const resizeHandle = card.querySelector('[data-widget-resize]');
    if (resizeHandle) {
        resizeHandle.style.display = 'none';
    }
}

// 리사이즈 핸들 드래그 이벤트 처리 (전역 변수 - 테두리 드래그용)
let isResizing = false;
let resizeCurrentCard = null;

// 위젯 테두리 드래그로 크기 조절
function attachWidgetResizeListeners(card) {
    if (!isWidgetEditMode) return;
    
    let resizeStartX = 0;
    let resizeStartY = 0;
    let resizeStartSize = null;
    let isResizing = false;
    let resizeDirection = null; // 'se' (오른쪽 아래), 'sw' (왼쪽 아래), 'ne' (오른쪽 위), 'nw' (왼쪽 위)
    
    // 위젯에 리사이즈 영역 추가
    const resizeArea = document.createElement('div');
    resizeArea.className = 'widget-resize-area';
    card.appendChild(resizeArea);
    
    // 마우스 이벤트 핸들러
    const handleMouseDown = (event) => {
        if (!isWidgetEditMode) return;
        if (event.target === card || card.contains(event.target)) {
            // 리사이즈 영역이나 테두리 근처에서만 리사이즈 시작
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const threshold = 15; // 테두리에서 15px 이내
            
            // 어느 가장자리인지 확인
            const isRightEdge = x >= rect.width - threshold;
            const isBottomEdge = y >= rect.height - threshold;
            const isLeftEdge = x <= threshold;
            const isTopEdge = y <= threshold;
            
            if (isRightEdge || isBottomEdge || isLeftEdge || isTopEdge) {
                event.preventDefault();
                event.stopPropagation();
                
                isResizing = true;
                resizeCurrentCard = card;
                resizeStartX = event.clientX;
                resizeStartY = event.clientY;
                const currentSize = card.getAttribute('data-widget-size') || 'medium';
                resizeStartSize = currentSize;
                
                // 방향 결정
                if (isRightEdge && isBottomEdge) {
                    resizeDirection = 'se';
                    document.body.style.cursor = 'nwse-resize';
                } else if (isRightEdge) {
                    resizeDirection = 'e';
                    document.body.style.cursor = 'ew-resize';
                } else if (isBottomEdge) {
                    resizeDirection = 's';
                    document.body.style.cursor = 'ns-resize';
                } else if (isLeftEdge) {
                    resizeDirection = 'w';
                    document.body.style.cursor = 'ew-resize';
                } else if (isTopEdge) {
                    resizeDirection = 'n';
                    document.body.style.cursor = 'ns-resize';
                }
                
                document.body.style.userSelect = 'none';
                card.classList.add('widget-resizing');
                
                // 마우스 이동 및 해제 이벤트
                document.addEventListener('mousemove', handleResizeMove);
                document.addEventListener('mouseup', handleResizeEnd);
            }
        }
    };
    
    const handleResizeMove = (event) => {
        if (!isResizing || !resizeCurrentCard) return;
        
        const deltaX = event.clientX - resizeStartX;
        const deltaY = event.clientY - resizeStartY;
        
        // 현재 크기 가져오기
        const currentSize = resizeCurrentCard.getAttribute('data-widget-size') || 'medium';
        const sizeOrder = ['small', 'medium', 'large'];
        let currentIndex = sizeOrder.indexOf(currentSize);
        if (currentIndex === -1) currentIndex = 1;
        
        // 직관적인 크기 변경: 드래그 방향으로 결정
        let newSize = currentSize;
        const threshold = 60; // 적절한 임계값
        
        // 드래그 거리 계산
        const dragDistance = Math.abs(deltaX) > Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY);
        
        // 좌우 모서리: deltaX 방향에 따라 크기 결정
        if (resizeDirection === 'e' || resizeDirection === 'w') {
            // 오른쪽 모서리에서 오른쪽으로 드래그 (deltaX > 0) → 증가
            // 왼쪽 모서리에서 오른쪽으로 드래그 (deltaX > 0) → 증가
            if (deltaX > threshold && currentIndex < sizeOrder.length - 1) {
                newSize = sizeOrder[currentIndex + 1];
            }
            // 오른쪽 모서리에서 왼쪽으로 드래그 (deltaX < 0) → 감소
            // 왼쪽 모서리에서 왼쪽으로 드래그 (deltaX < 0) → 감소
            else if (deltaX < -threshold && currentIndex > 0) {
                newSize = sizeOrder[currentIndex - 1];
            }
        }
        // 상하 모서리: deltaY 방향에 따라 크기 결정
        else if (resizeDirection === 's' || resizeDirection === 'n') {
            // 아래 모서리에서 아래로 드래그 (deltaY > 0) → 증가
            // 위 모서리에서 아래로 드래그 (deltaY > 0) → 증가
            if (deltaY > threshold && currentIndex < sizeOrder.length - 1) {
                newSize = sizeOrder[currentIndex + 1];
            }
            // 아래 모서리에서 위로 드래그 (deltaY < 0) → 감소
            // 위 모서리에서 위로 드래그 (deltaY < 0) → 감소
            else if (deltaY < -threshold && currentIndex > 0) {
                newSize = sizeOrder[currentIndex - 1];
            }
        }
        // 모서리 (대각선): deltaX + deltaY 방향에 따라 크기 결정
        else if (resizeDirection === 'se' || resizeDirection === 'nw') {
            // 오른쪽 아래 모서리에서 오른쪽 아래로 드래그 → 증가
            // 왼쪽 위 모서리에서 오른쪽 아래로 드래그 → 증가
            if ((deltaX + deltaY) > threshold && dragDistance > threshold && currentIndex < sizeOrder.length - 1) {
                newSize = sizeOrder[currentIndex + 1];
            }
            // 오른쪽 아래 모서리에서 왼쪽 위로 드래그 → 감소
            // 왼쪽 위 모서리에서 왼쪽 위로 드래그 → 감소
            else if ((deltaX + deltaY) < -threshold && dragDistance > threshold && currentIndex > 0) {
                newSize = sizeOrder[currentIndex - 1];
            }
        }
        else if (resizeDirection === 'sw' || resizeDirection === 'ne') {
            // 왼쪽 아래 모서리에서 오른쪽 위로 드래그 → 증가
            // 오른쪽 위 모서리에서 오른쪽 위로 드래그 → 증가
            if ((deltaX - deltaY) > threshold && dragDistance > threshold && currentIndex < sizeOrder.length - 1) {
                newSize = sizeOrder[currentIndex + 1];
            }
            // 왼쪽 아래 모서리에서 왼쪽 아래로 드래그 → 감소
            // 오른쪽 위 모서리에서 왼쪽 아래로 드래그 → 감소
            else if ((deltaX - deltaY) < -threshold && dragDistance > threshold && currentIndex > 0) {
                newSize = sizeOrder[currentIndex - 1];
            }
        }
        
        // 크기가 변경되었을 때 즉시 업데이트
        if (newSize !== currentSize) {
            const widgetId = resizeCurrentCard.getAttribute('data-widget-id');
            
            // DOM 업데이트
            resizeCurrentCard.setAttribute('data-widget-size', newSize);
            resizeCurrentCard.dataset.widgetSize = newSize;
            
            // 그리드 레이아웃 즉시 업데이트
            resizeCurrentCard.style.gridColumn = newSize === 'large' ? 'span 2' : 'span 1';
            
            // preferences에 업데이트 (드래그 종료 시 저장)
            if (widgetId && widgetDraftPreferences) {
                const settings = widgetDraftPreferences.settings[widgetId] || { isVisible: true, size: 'medium' };
                settings.size = newSize;
                widgetDraftPreferences.settings[widgetId] = settings;
            }
            
            // 드래그 시작 위치 업데이트 (연속적인 크기 변경을 위해)
            // resizeStartSize는 원래 시작 크기를 유지해야 하므로 변경하지 않음
            resizeStartX = event.clientX;
            resizeStartY = event.clientY;
        }
    };
    
    const handleResizeEnd = (event) => {
        if (!isResizing || !resizeCurrentCard) return;
        
        const finalSize = resizeCurrentCard.getAttribute('data-widget-size') || resizeStartSize;
        const widgetId = resizeCurrentCard.getAttribute('data-widget-id');
        
        // 크기 변경이 있었는지 확인 (최초 시작 크기와 비교)
        if (finalSize !== resizeStartSize && widgetId && widgetDraftPreferences) {
            // 최종 크기를 preferences에 저장
            const settings = widgetDraftPreferences.settings[widgetId] || { isVisible: true, size: 'medium' };
            settings.size = finalSize;
            widgetDraftPreferences.settings[widgetId] = settings;
            
            // localStorage에 저장 (모든 변경사항 저장)
            commitDraftPreferences();
            
            // 상태 렌더링 (부드러운 전환을 위해)
            setTimeout(() => {
                renderWidgetState(widgetDraftPreferences, { editing: true });
                refreshWidgetPicker(widgetDraftPreferences);
            }, 250);
            
            setStatusMessage('위젯 크기가 저장되었습니다.', 'bx bx-check-circle');
        }
        
        // 리사이즈 상태 제거 (transition 복구를 위해 약간의 딜레이)
        setTimeout(() => {
            if (resizeCurrentCard) {
                resizeCurrentCard.classList.remove('widget-resizing');
            }
        }, 50);
        
        // 정리
        isResizing = false;
        resizeCurrentCard = null;
        resizeStartX = 0;
        resizeStartY = 0;
        resizeStartSize = null;
        resizeDirection = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // 이벤트 리스너 제거
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    // 위젯에 마우스 이벤트 추가
    card.addEventListener('mousedown', handleMouseDown);
    
    // 마우스 오버 시 커서 변경
    card.addEventListener('mousemove', (event) => {
        if (!isWidgetEditMode) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const threshold = 15;
        
        const isRightEdge = x >= rect.width - threshold;
        const isBottomEdge = y >= rect.height - threshold;
        const isLeftEdge = x <= threshold;
        const isTopEdge = y <= threshold;
        
        if (isRightEdge && isBottomEdge) {
            card.style.cursor = 'nwse-resize';
        } else if (isLeftEdge && isTopEdge) {
            card.style.cursor = 'nwse-resize';
        } else if (isRightEdge || isLeftEdge) {
            card.style.cursor = 'ew-resize';
        } else if (isBottomEdge || isTopEdge) {
            card.style.cursor = 'ns-resize';
        } else {
            card.style.cursor = 'default';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.cursor = '';
    });
}


// 드래그 오버 업데이트를 throttle하여 부드럽게 처리
let lastDragOverUpdate = 0;
const DRAG_OVER_THROTTLE = 150; // 150ms마다 업데이트 (깜빡임 방지)
let lastTargetCardId = null; // 마지막 타겟 카드 ID 저장

function handleWidgetDragStart(event) {
    if (!isWidgetEditMode) {
        event.preventDefault();
        return;
    }
    try {
    const card = event.currentTarget.closest('.dashboard-card[data-widget-id]');
    if (!card) return;
        
    widgetDragSourceId = card.getAttribute('data-widget-id');
        if (!widgetDragSourceId) return;
        
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', widgetDragSourceId);
        
        // 드래그 시작 애니메이션
        card.style.transition = 'all 0.2s ease-out';
        
        // 부드러운 시작
        requestAnimationFrame(() => {
            try {
    card.classList.add('widget-dragging');
                // 드래그 핸들에도 드래그 중 스타일 추가
                // 이동 핸들 제거됨 (카드 드래그로 이동)
                // 드래그 시작 시 body에 클래스 추가
                document.body.classList.add('widget-dragging-active');
                
                // 드래그 시작 후 transition 제거하여 마우스 따라가도록
                requestAnimationFrame(() => {
                    try {
                        card.style.transition = 'none';
                    } catch (e) {
                        console.warn('transition 제거 오류:', e);
                    }
                });
            } catch (e) {
                console.error('드래그 시작 애니메이션 오류:', e);
            }
        });
        
        // throttle 변수 초기화
        lastDragOverUpdate = 0;
        lastTargetCardId = null;
    } catch (error) {
        console.error('handleWidgetDragStart 오류:', error);
    }
}

function handleWidgetDragEnd(event) {
    try {
    const card = event.currentTarget.closest('.dashboard-card[data-widget-id]');
    if (card) {
            // 부드러운 복귀 애니메이션
            card.style.transition = 'all 0.2s ease-out';
            
            // 약간의 딜레이 후 클래스 제거 (애니메이션 완료 후)
            setTimeout(() => {
                try {
        card.classList.remove('widget-dragging');
        card.classList.remove('widget-drop-target');
                    card.style.transition = '';
                    
                    // 이동 핸들 제거됨 (카드 드래그로 이동)
                } catch (e) {
                    console.warn('클래스 제거 오류:', e);
                }
            }, 100);
        }
        
        // 드래그 종료 시 body 클래스 제거 (약간의 딜레이로 부드럽게)
        setTimeout(() => {
            try {
                document.body.classList.remove('widget-dragging-active');
            } catch (e) {
                console.warn('body 클래스 제거 오류:', e);
            }
        }, 200);
        
        // 드롭 위치 표시기 제거 (부드러운 페이드 아웃)
        const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
        existingIndicators.forEach(indicator => {
            try {
                indicator.style.opacity = '0';
                indicator.style.transform = 'scale(0.95)';
                indicator.style.transition = 'all 0.15s ease-out';
                setTimeout(() => {
                    try {
                        indicator.remove();
                    } catch (e) {
                        console.warn('표시기 제거 오류:', e);
                    }
                }, 150);
            } catch (e) {
                console.warn('표시기 스타일 변경 오류:', e);
            }
        });
        
    widgetDragSourceId = null;
        lastDragOverUpdate = 0; // throttle 초기화
        lastTargetCardId = null; // 타겟 카드 ID 초기화
    } catch (error) {
        console.error('handleWidgetDragEnd 오류:', error);
        // 오류 발생 시에도 최소한 정리
        try {
            document.body.classList.remove('widget-dragging-active');
            const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
        } catch (e) {
            console.error('정리 중 오류:', e);
        }
        widgetDragSourceId = null;
        lastDragOverUpdate = 0;
        lastTargetCardId = null;
    }
}

function handleWidgetCardDragOver(event) {
    if (!isWidgetEditMode || !widgetGrid) return;
    try {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
        
        // throttle 적용
        const now = Date.now();
        if (now - lastDragOverUpdate < DRAG_OVER_THROTTLE) return;
        lastDragOverUpdate = now;
        
        const draggedId = widgetDragSourceId || event.dataTransfer.getData('text/plain');
        if (!draggedId) return;
        
        // 간단하게 마우스 아래에 있는 위젯 찾기
        let targetCard = null;
        try {
            const card = document.elementFromPoint(event.clientX, event.clientY);
            targetCard = card ? card.closest('.dashboard-card[data-widget-id]') : null;
        } catch (e) {
            console.warn('elementFromPoint 오류:', e);
        }
        
        // 위젯을 찾지 못하면 그리드에서 가장 가까운 위젯 찾기
        if (!targetCard || targetCard.classList.contains('widget-dragging')) {
            const allCards = Array.from(widgetGrid.querySelectorAll('.dashboard-card[data-widget-id]:not(.widget-dragging)'));
            if (allCards.length === 0) return;
            
            let closestCard = null;
            let minDistance = Infinity;
            
            allCards.forEach(cardItem => {
                try {
                    const rect = cardItem.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    const distance = Math.abs(event.clientY - centerY);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCard = cardItem;
                    }
                } catch (e) {
                    console.warn('getBoundingClientRect 오류:', e);
                }
            });
            
            targetCard = closestCard;
        }
        
        if (!targetCard || targetCard.classList.contains('widget-dragging')) {
            // 타겟이 없으면 표시기 제거
            const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
            lastTargetCardId = null;
            return;
        }
        
        const targetId = targetCard.getAttribute('data-widget-id');
        if (!targetId || targetId === draggedId) {
            const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
            lastTargetCardId = null;
            return;
        }
        
        // 위젯의 중간점 기준으로 앞/뒤 결정
        let rect;
        try {
            rect = targetCard.getBoundingClientRect();
        } catch (e) {
            console.warn('getBoundingClientRect 오류:', e);
            return;
        }
        
        const centerY = rect.top + rect.height / 2;
        const insertBefore = event.clientY < centerY;
        
        // 같은 위치면 업데이트하지 않음 (깜빡임 방지)
        const currentIndicatorKey = `${targetId}-${insertBefore ? 'before' : 'after'}`;
        if (lastTargetCardId === currentIndicatorKey) {
            return; // 같은 위치면 업데이트하지 않음
        }
        lastTargetCardId = currentIndicatorKey;
        
        // 기존 표시기 제거
        const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
        existingIndicators.forEach(indicator => {
            try {
                indicator.remove();
            } catch (e) {
                console.warn('표시기 제거 오류:', e);
            }
        });
        
        // 드롭 위치 표시기 생성 및 추가
        try {
            const indicator = document.createElement('div');
            indicator.className = 'widget-drop-indicator';
            
            const parentNode = targetCard.parentNode;
            if (!parentNode) return;
            
            if (insertBefore) {
                parentNode.insertBefore(indicator, targetCard);
            } else {
                const nextSibling = targetCard.nextSibling;
                if (nextSibling) {
                    parentNode.insertBefore(indicator, nextSibling);
                } else {
                    parentNode.appendChild(indicator);
                }
            }
        } catch (e) {
            console.warn('표시기 추가 오류:', e);
        }
    } catch (error) {
        console.error('handleWidgetCardDragOver 오류:', error);
    }
}

function handleWidgetDragEnter(event) {
    if (!isWidgetEditMode) return;
    const card = event.currentTarget.closest('.dashboard-card[data-widget-id]');
    if (card && !card.classList.contains('widget-dragging')) {
        card.classList.add('widget-drop-target');
    }
}

function handleWidgetDragLeave(event) {
    const card = event.currentTarget.closest('.dashboard-card[data-widget-id]');
    if (card) {
        card.classList.remove('widget-drop-target');
        // 관련된 표시기도 제거 (직접적으로 카드를 떠났을 때)
        const rect = card.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;
        // 카드 영역을 완전히 벗어났을 때만 표시기 제거
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            const indicator = card.parentNode.querySelector('.widget-drop-indicator');
            if (indicator && indicator.nextSibling === card || indicator.previousSibling === card) {
                indicator.remove();
            }
        }
    }
}

function handleWidgetDrop(event) {
    if (!widgetDraftPreferences || !widgetGrid) return;
    try {
    event.preventDefault();
        
        // 드롭 위치 표시기 위치 확인
        const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
        let targetCardForInsert = null;
        let shouldInsertBefore = false;
        
        if (existingIndicators.length > 0) {
            try {
                const indicator = existingIndicators[0];
                const prevSibling = indicator.previousSibling;
                const nextSibling = indicator.nextSibling;
                
                // 표시기 앞에 위젯이 있으면 그 위젯 뒤에 삽입
                if (prevSibling && prevSibling.classList && prevSibling.classList.contains('dashboard-card')) {
                    targetCardForInsert = prevSibling;
                    shouldInsertBefore = false;
                }
                // 표시기 뒤에 위젯이 있으면 그 위젯 앞에 삽입
                else if (nextSibling && nextSibling.classList && nextSibling.classList.contains('dashboard-card')) {
                    targetCardForInsert = nextSibling;
                    shouldInsertBefore = true;
                }
            } catch (e) {
                console.warn('표시기 위치 확인 오류:', e);
            }
        }
        
        // 표시기 제거
        existingIndicators.forEach(indicator => {
            try {
                indicator.remove();
            } catch (e) {
                console.warn('표시기 제거 오류:', e);
            }
        });
        
    const draggedId = widgetDragSourceId || event.dataTransfer.getData('text/plain');
    if (!draggedId) return;

        // 표시기 위치 기반으로 삽입
        if (targetCardForInsert) {
            const targetId = targetCardForInsert.getAttribute('data-widget-id');
            if (targetId && targetId !== draggedId) {
                const currentOrder = [...widgetDraftPreferences.order];
                const draggedIndex = currentOrder.indexOf(draggedId);
                const targetIndex = currentOrder.indexOf(targetId);
                
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    let insertIndex = shouldInsertBefore ? targetIndex : targetIndex + 1;
                    
                    currentOrder.splice(draggedIndex, 1);
                    if (draggedIndex < insertIndex) {
                        insertIndex--;
                    }
                    currentOrder.splice(insertIndex, 0, draggedId);
                    
                    widgetDraftPreferences.order = currentOrder;
                    commitDraftPreferences();
                    renderWidgetState(widgetDraftPreferences, { editing: true });
                    refreshWidgetPicker(widgetDraftPreferences);
                    return;
                }
            }
        }
        
        // 표시기가 없으면 마우스 위치 기준
        let targetCard = null;
        try {
            const card = document.elementFromPoint(event.clientX, event.clientY);
            targetCard = card ? card.closest('.dashboard-card[data-widget-id]') : null;
        } catch (e) {
            console.warn('elementFromPoint 오류:', e);
        }
        
        if (!targetCard || targetCard.classList.contains('widget-dragging')) {
            const allCards = Array.from(widgetGrid.querySelectorAll('.dashboard-card[data-widget-id]:not(.widget-dragging)'));
            if (allCards.length === 0) {
                reorderDraftOrder(draggedId, null);
    commitDraftPreferences();
    renderWidgetState(widgetDraftPreferences, { editing: true });
    refreshWidgetPicker(widgetDraftPreferences);
                return;
            }
            
            let closestCard = null;
            let minDistance = Infinity;
            allCards.forEach(cardItem => {
                try {
                    const rect = cardItem.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    const distance = Math.abs(event.clientY - centerY);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCard = cardItem;
                    }
                } catch (e) {
                    console.warn('getBoundingClientRect 오류:', e);
                }
            });
            targetCard = closestCard;
        }
        
        if (!targetCard) {
            reorderDraftOrder(draggedId, null);
            commitDraftPreferences();
            renderWidgetState(widgetDraftPreferences, { editing: true });
            refreshWidgetPicker(widgetDraftPreferences);
            return;
        }
        
        const targetId = targetCard.getAttribute('data-widget-id');
        if (!targetId || draggedId === targetId) return;
        
        let rect;
        try {
            rect = targetCard.getBoundingClientRect();
        } catch (e) {
            console.warn('getBoundingClientRect 오류:', e);
            return;
        }
        
        const centerY = rect.top + rect.height / 2;
        const shouldInsertBeforeFinal = event.clientY < centerY;
        
        const currentOrder = [...widgetDraftPreferences.order];
        const draggedIndex = currentOrder.indexOf(draggedId);
        const targetIndex = currentOrder.indexOf(targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        let insertIndex = shouldInsertBeforeFinal ? targetIndex : targetIndex + 1;
        currentOrder.splice(draggedIndex, 1);
        if (draggedIndex < insertIndex) {
            insertIndex--;
        }
        currentOrder.splice(insertIndex, 0, draggedId);
        
        widgetDraftPreferences.order = currentOrder;
        commitDraftPreferences();
        renderWidgetState(widgetDraftPreferences, { editing: true });
        refreshWidgetPicker(widgetDraftPreferences);
    } catch (error) {
        console.error('handleWidgetDrop 오류:', error);
    }
}

function reorderDraftOrder(sourceId, targetId) {
    if (!widgetDraftPreferences || sourceId === targetId) return;
    const order = widgetDraftPreferences.order;
    const currentIndex = order.indexOf(sourceId);
    if (currentIndex === -1) return;

    order.splice(currentIndex, 1);

    if (!targetId) {
        // 타겟이 없으면 맨 뒤로
        order.push(sourceId);
        return;
    }

    let targetIndex = order.indexOf(targetId);
    if (targetIndex === -1) {
        // 타겟을 찾을 수 없으면 맨 뒤로
        order.push(sourceId);
        return;
    }
    // 타겟 뒤에 삽입
    order.splice(targetIndex + 1, 0, sourceId);
}

/**
 * 페이지 전환 (전역 함수로 노출 - initWidgetCustomization 밖으로 이동)
 */
window.switchPage = function switchPage(pageId) {
    if (!pageId) {
        console.warn('switchPage: pageId가 제공되지 않았습니다.');
        return;
    }
    
    console.log('페이지 전환:', pageId);
    
    // 모든 콘텐츠 숨기기
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.style.display = 'none';
    });

    // 모든 content-section도 숨기기 (최근 활동 등)
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        // dashboard-content 안에 있는 섹션만 제외
        const isInDashboard = section.closest('#dashboard-content');
        if (!isInDashboard) {
            section.style.display = 'none';
        }
    });

        // 선택한 페이지 표시
        const targetPage = pageId.replace('#', '');
        const targetContent = document.getElementById(`${targetPage}-content`);
        
        if (targetContent) {
            // 먼저 표시한 다음 초기화 (display: block 후에 요소를 찾을 수 있도록)
            targetContent.style.display = 'block';
            console.log('페이지 표시:', targetPage, 'content ID:', `${targetPage}-content`);
        
        // 사이드바 메뉴 활성화 업데이트
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = sidebarMenu?.querySelector(`.menu-link[href="${pageId}"]`);
        if (activeMenuItem) {
            const menuItem = activeMenuItem.closest('.menu-item');
            if (menuItem) {
                menuItem.classList.add('active');
            }
        }
        
        // 통합 편집 토글 표시/숨김 (대시보드 탭에서만 표시)
        const widgetToggleContainer = document.getElementById('widget-edit-toggle-container');
        if (widgetToggleContainer) {
            if (targetPage === 'dashboard') {
                widgetToggleContainer.hidden = false;
            } else {
                widgetToggleContainer.hidden = true;
                // 다른 페이지로 이동 시 편집 모드 비활성화
                const widgetEditToggle = document.getElementById('widget-edit-mode-toggle');
                if (widgetEditToggle && widgetEditToggle.checked) {
                    widgetEditToggle.checked = false;
                    widgetEditToggle.dispatchEvent(new Event('change'));
                }
            }
            console.log('편집 토글 상태:', targetPage === 'dashboard' ? '표시' : '숨김', 'targetPage:', targetPage);
        }
        
        // dashboard-content가 아닌 경우, 최근 활동 숨기기
        if (targetPage !== 'dashboard') {
            const recentActivity = document.querySelector('#dashboard-content .content-section:last-of-type');
            if (recentActivity && recentActivity.querySelector('h2')?.textContent === '최근 활동') {
                recentActivity.style.display = 'none';
            }
        } else {
            // dashboard일 때만 최근 활동 표시
            const recentActivity = document.querySelector('#dashboard-content .content-section:last-of-type');
            if (recentActivity && recentActivity.querySelector('h2')?.textContent === '최근 활동') {
                recentActivity.style.display = 'block';
            }
        }
        
        // 페이지별 초기화 (href 기반으로 안전하게 처리)
        setTimeout(() => {
            // 각 페이지는 고유한 content ID를 가지므로 안전하게 초기화 가능
            if (targetPage === 'profile' && typeof initProfile === 'function') {
                initProfile();
            } else if (targetPage === 'ask') {
                // Ask 페이지는 게시판 테이블만 로드
                if (typeof loadSessionsForBoard === 'function') {
                    loadSessionsForBoard('ask-sessions-table-body');
                }
            } else if (targetPage === 'activity') {
                // Activity 페이지로 전환 시 모달이 열려있으면 닫기
                const activityContent = document.getElementById('activity-content');
                if (activityContent) {
                    const postModal = activityContent.querySelector('#post-modal');
                    if (postModal) {
                        postModal.classList.remove('active');
                        // 모달이 hidden 속성으로 제어되는 경우
                        if (postModal.hasAttribute('hidden') === false) {
                            postModal.setAttribute('hidden', '');
                        }
                    }
                }
                
                // Activity 페이지 초기화
                if (typeof initActivity === 'function') {
                    // initActivity는 activity-content 내부의 요소만 찾도록 설계됨
                    initActivity();
                }
                // Activity 페이지에 게시판 테이블 로드
                if (typeof loadSessionsForBoard === 'function') {
                    loadSessionsForBoard('activity-sessions-table-body');
                }
            } else if (targetPage === 'quiz' && typeof initQuiz === 'function') {
                initQuiz();
            } else if (targetPage === 'materials' && typeof initMaterials === 'function') {
                initMaterials();
            } else if (targetPage === 'cloud' && typeof initCloud === 'function') {
                initCloud();
            }
        }, 50);
    } else if (pageId === '#dashboard' || pageId === 'dashboard') {
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.style.display = 'block';
            // 최근 활동 표시
            const recentActivity = dashboardContent.querySelector('.content-section:last-of-type');
            if (recentActivity) {
                recentActivity.style.display = 'block';
            }
        }
        
        // 위젯 편집 토글 표시 (대시보드 탭에서만 표시)
        const widgetToggleContainer = document.getElementById('widget-edit-toggle-container');
        if (widgetToggleContainer) {
            widgetToggleContainer.hidden = false;
        }
    } else {
        console.warn('페이지를 찾을 수 없습니다:', targetPage);
        
        // 대시보드가 아니면 토글 숨김
        const widgetToggleContainer = document.getElementById('widget-edit-toggle-container');
        if (widgetToggleContainer) {
            widgetToggleContainer.hidden = true;
        }
    }
};

/**
 * 사이드바 메뉴 항목 클릭 시 (전역에서 등록)
 */
function initMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        // 중복 리스너 방지를 위해 data-listener 속성 확인
        if (item.dataset.listenerAdded === 'true') {
            return;
        }
        item.dataset.listenerAdded = 'true';
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 모든 메뉴 항목에서 active 클래스 제거
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            // 클릭한 항목에 active 클래스 추가
            menuItem.classList.add('active');
            
            // 모바일에서 메뉴 클릭 시 사이드바 닫기
            const sidebarEl = document.getElementById('sidebar');
            if (window.innerWidth <= 768 && sidebarEl) {
                sidebarEl.classList.remove('active');
            }

            // 페이지 전환
            const link = item.querySelector('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href) {
                    // 위젯 편집 토글 표시/숨김 처리
                    const widgetToggleContainer = document.getElementById('widget-edit-toggle-container');
                    if (widgetToggleContainer) {
                        const pageId = href.replace('#', '');
                        if (pageId === 'dashboard') {
                            widgetToggleContainer.hidden = false;
                        } else {
                            widgetToggleContainer.hidden = true;
                        }
                    }
                    
                    // 페이지 전환
                    if (window.switchPage) {
                        window.switchPage(href);
                    } else {
                        console.warn('switchPage 함수를 찾을 수 없습니다.');
                    }
                }
            }
        });
    });
}

function initWidgetCustomization() {
    if (!widgetGrid) return;

    widgetDefaultPreferences = buildDefaultWidgetPreferences();
    widgetPreferences = loadWidgetPreferences(widgetDefaultPreferences);
    widgetDraftPreferences = clonePreferences(widgetPreferences);
    isWidgetEditMode = false; // 기본값: 잠금 상태

    renderWidgetState(widgetDraftPreferences, { editing: false });
    refreshWidgetPicker(widgetDraftPreferences);

    widgetGrid.addEventListener('dragover', handleWidgetCardDragOver);
    widgetGrid.addEventListener('drop', handleWidgetDrop);

    // 위젯 편집 모드 토글 초기화 (대시보드 + 메뉴 편집 통합)
    const widgetEditToggle = document.getElementById('widget-edit-mode-toggle');
    if (widgetEditToggle) {
        widgetEditToggle.addEventListener('change', (event) => {
            const enabled = event.target.checked;
            isWidgetEditMode = enabled;
            setCardsDraggable(enabled);
            
            // 위젯 추가 카드 표시/숨김
            if (widgetAddInline) {
                widgetAddInline.hidden = !enabled;
            }
            
            // 사이드바 메뉴 편집 모드도 함께 제어
            toggleSidebarMenuEditMode(enabled);
            
            // 토글 아이콘 업데이트
            const toggleIcon = widgetEditToggle.closest('.widget-edit-toggle-label')
                ?.querySelector('.toggle-text i');
            if (toggleIcon) {
                toggleIcon.className = enabled ? 'bx bx-lock-open-alt' : 'bx bx-lock-alt';
            }
            
            // 드래그 중이면 종료
            if (!enabled) {
                document.body.classList.remove('widget-dragging-active');
                const existingIndicators = document.querySelectorAll('.widget-drop-indicator');
                existingIndicators.forEach(indicator => indicator.remove());
                widgetDragSourceId = null;
            }
        });
        
        // 초기 상태 설정 (기본값: 잠금 상태)
        if (widgetEditToggle.checked) {
            isWidgetEditMode = true;
            setCardsDraggable(true);
            if (widgetAddInline) {
                widgetAddInline.hidden = false;
            }
        } else {
            isWidgetEditMode = false;
            setCardsDraggable(false);
            if (widgetAddInline) {
                widgetAddInline.hidden = true;
            }
        }
    }

    // 사이드바 초기화는 core.js의 initSidebar() 사용
    // 메뉴 아이템 초기화는 init()에서 별도로 호출됨

    /**
     * 사이드바 브랜드 클릭 시 클래스 선택 화면으로 이동
     */
    const sidebarBrand = document.getElementById('sidebar-brand');
    if (sidebarBrand) {
        // 기존 리스너 제거 후 재등록
        const newBrand = sidebarBrand.cloneNode(true);
        sidebarBrand.parentNode.replaceChild(newBrand, sidebarBrand);
        
        newBrand.addEventListener('click', () => {
            if (typeof showConfirm === 'function') {
                showConfirm('다른 클래스를 선택하시겠습니까?', 'info').then(confirmed => {
                    if (confirmed) {
                        // 클래스 선택 페이지로 이동 (클래스 코드 불필요)
                    window.location.href = 'class-select.html';
                    }
                });
            } else {
                if (confirm('다른 클래스를 선택하시겠습니까?')) {
                    // 클래스 선택 페이지로 이동 (클래스 코드 불필요)
                    window.location.href = 'class-select.html';
                }
            }
        });
    }

    // 다크 모드 토글은 core.js의 toggleDarkMode() 사용
}

/**
 * 반응형 사이드바 처리
 */
window.addEventListener('resize', () => {
    const sidebarEl = document.getElementById('sidebar');
    if (window.innerWidth > 768 && sidebarEl) {
        sidebarEl.classList.remove('active');
    }
});

/**
 * 검색 기능
 */
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            console.log('검색어:', searchTerm);
            // 여기에 실제 검색 로직 구현
        });
    }
}

// 공지사항 관련 요소 (전역 변수)
let announcementList = null;
let announcementBadge = null;
let announcementEmpty = null;
let announcementCreateBtn = null;
let announcementClearBtn = null;
let announcementModal = null;
let announcementModalClose = null;
let announcementModalCancel = null;
let announcementForm = null;
let announcementViewAllBtn = null;
let announcementDetailModal = null;
let announcementDetailClose = null;
let announcementDetailTitle = null;
let announcementDetailDate = null;
let announcementDetailContent = null;
let announcementAllModal = null;
let announcementAllClose = null;
let announcementAllList = null;
let announcementAllEmpty = null;

// 알림 관련 요소 (전역 변수)
let notificationList = null;
let notificationCount = null;

// 공지사항 관련 요소 초기화
function initAnnouncementElements() {
    announcementList = document.getElementById('announcement-list');
    announcementBadge = document.getElementById('announcement-count');
    announcementEmpty = document.getElementById('announcement-empty');
    announcementCreateBtn = document.getElementById('announcement-create-btn');
    announcementClearBtn = document.getElementById('announcement-clear-btn');
    announcementModal = document.getElementById('announcement-modal');
    announcementModalClose = document.getElementById('announcement-modal-close');
    announcementModalCancel = document.getElementById('announcement-modal-cancel');
    announcementForm = document.getElementById('announcement-form');
    announcementViewAllBtn = document.getElementById('announcement-view-all-btn');
    announcementDetailModal = document.getElementById('announcement-detail-modal');
    announcementDetailClose = document.getElementById('announcement-detail-close');
    announcementDetailTitle = document.getElementById('announcement-detail-title');
    announcementDetailDate = document.getElementById('announcement-detail-date');
    announcementDetailContent = document.getElementById('announcement-detail-content');
    announcementAllModal = document.getElementById('announcement-all-modal');
    announcementAllClose = document.getElementById('announcement-all-close');
    announcementAllList = document.getElementById('announcement-all-list');
    announcementAllEmpty = document.getElementById('announcement-all-empty');
    
    notificationList = document.querySelector('.notification-list');
    notificationCount = document.querySelector('.notification-count');
}

/**
 * 클래스 코드 모달 초기화
 */
function initClassCodeModal() {
    const navbarClassInfo = document.getElementById('navbar-class-info');
    const classCodeModal = document.getElementById('class-code-modal');
    const closeClassCodeModalBtn = document.getElementById('close-class-code-modal');
    const closeClassCodeModalBtn2 = document.getElementById('close-class-code-modal-btn');
    const copyClassCodeBtn = document.getElementById('copy-class-code');
    
    // 상단바 클래스명 클릭 시 모달 열기
    if (navbarClassInfo) {
        navbarClassInfo.addEventListener('click', () => {
            showClassCodeModal();
        });
    }
    
    // 모달 닫기 버튼
    if (closeClassCodeModalBtn) {
        closeClassCodeModalBtn.addEventListener('click', closeClassCodeModal);
    }
    
    if (closeClassCodeModalBtn2) {
        closeClassCodeModalBtn2.addEventListener('click', closeClassCodeModal);
    }
    
    // 모달 외부 클릭 시 닫기
    if (classCodeModal) {
        classCodeModal.addEventListener('click', (e) => {
            if (e.target === classCodeModal) {
                closeClassCodeModal();
            }
        });
    }
    
    // 클래스 코드 복사 버튼
    if (copyClassCodeBtn) {
        copyClassCodeBtn.addEventListener('click', () => {
            copyClassCode();
        });
    }
}

/**
 * 클래스 코드 모달 표시
 */
function showClassCodeModal() {
    const modal = document.getElementById('class-code-modal');
    if (!modal) return;
    
    // 현재 선택된 클래스 정보 가져오기
    const selectedClass = localStorage.getItem('selectedClass');
    const selectedClassCode = localStorage.getItem('selectedClassCode') || 
                              (typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default');
    
    if (!selectedClass || selectedClassCode === 'default') {
        if (typeof showAlert === 'function') {
            showAlert('클래스를 먼저 선택해주세요.', 'warning');
        } else {
            alert('클래스를 먼저 선택해주세요.');
        }
        return;
    }
    
    // 클래스 정보에서 코드 가져오기
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    const classData = classes[selectedClass];
    const classCode = classData?.code || selectedClassCode || localStorage.getItem(`classCode_${selectedClass}`);
    
    // 모달에 정보 표시
    const modalClassName = document.getElementById('modal-class-name');
    const modalClassCode = document.getElementById('modal-class-code');
    
    if (modalClassName) {
        modalClassName.textContent = selectedClass;
    }
    
    if (modalClassCode) {
        modalClassCode.value = classCode || '코드를 찾을 수 없습니다';
    }
    
    // 모달 표시
    modal.style.display = 'flex';
}

/**
 * 클래스 코드 모달 닫기
 */
function closeClassCodeModal() {
    const modal = document.getElementById('class-code-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 클래스 코드 복사
 */
function copyClassCode() {
    const modalClassCode = document.getElementById('modal-class-code');
    if (!modalClassCode) return;
    
    const classCode = modalClassCode.value;
    if (!classCode || classCode === '코드를 찾을 수 없습니다') {
        if (typeof showAlert === 'function') {
            showAlert('복사할 코드가 없습니다.', 'warning');
        } else {
            alert('복사할 코드가 없습니다.');
        }
        return;
    }
    
    // 클립보드에 복사
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(classCode).then(() => {
            if (typeof showAlert === 'function') {
                showAlert('클래스 코드가 복사되었습니다!', 'success');
            } else {
                alert('클래스 코드가 복사되었습니다!');
            }
            
            // 복사 버튼 피드백
            const copyBtn = document.getElementById('copy-class-code');
            if (copyBtn) {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="bx bx-check"></i>';
                copyBtn.style.background = 'var(--green)';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = '';
                }, 2000);
            }
        }).catch(err => {
            console.error('복사 실패:', err);
            // 폴백: 수동 복사
            fallbackCopyTextToClipboard(classCode);
        });
    } else {
        // 폴백: 수동 복사
        fallbackCopyTextToClipboard(classCode);
    }
}

/**
 * 클립보드 복사 폴백 (구형 브라우저 지원)
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            if (typeof showAlert === 'function') {
                showAlert('클래스 코드가 복사되었습니다!', 'success');
            } else {
                alert('클래스 코드가 복사되었습니다!');
            }
        } else {
            if (typeof showAlert === 'function') {
                showAlert('복사에 실패했습니다. 코드를 수동으로 복사해주세요.', 'error');
            } else {
                alert('복사에 실패했습니다. 코드를 수동으로 복사해주세요.');
            }
        }
    } catch (err) {
        console.error('복사 실패:', err);
        if (typeof showAlert === 'function') {
            showAlert('복사에 실패했습니다. 코드를 수동으로 복사해주세요.', 'error');
        } else {
            alert('복사에 실패했습니다. 코드를 수동으로 복사해주세요.');
        }
    }
    
    document.body.removeChild(textArea);
}

/**
 * 프로필 드롭다운 토글 기능 초기화
 */
function initProfileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (!profileBtn || !profileDropdown) {
        return; // 요소가 없으면 종료
    }

    // 프로필 버튼 클릭 시 토글
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = profileDropdown.style.display === 'block' || 
                         window.getComputedStyle(profileDropdown).display === 'block';
        
        if (isVisible) {
            profileDropdown.style.display = 'none';
            profileDropdown.classList.remove('show');
        } else {
            profileDropdown.style.display = 'block';
            profileDropdown.classList.add('show');
        }
    });

    // 드롭다운 내부 클릭 시 이벤트 전파 방지 (닫히지 않도록)
    profileDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 프로필 드롭다운 외부 클릭 시 닫기 (한 번만 등록)
    if (!window.profileDropdownOutsideClickHandler) {
        window.profileDropdownOutsideClickHandler = (e) => {
            const profile = document.querySelector('.profile');
            const dropdown = document.querySelector('.profile-dropdown');
            if (profile && dropdown && !profile.contains(e.target)) {
                dropdown.style.display = 'none';
                dropdown.classList.remove('show');
            }
        };
        document.addEventListener('click', window.profileDropdownOutsideClickHandler);
    }

    // ESC 키로 드롭다운 닫기 (한 번만 등록)
    if (!window.profileDropdownEscHandler) {
        window.profileDropdownEscHandler = (e) => {
            const dropdown = document.querySelector('.profile-dropdown');
            if (e.key === 'Escape' && dropdown && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
                dropdown.classList.remove('show');
            }
        };
        document.addEventListener('keydown', window.profileDropdownEscHandler);
    }
}

    /**
     * 알림 드롭다운 토글
     */
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.querySelector('.notification-dropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
    }

    // 알림 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        const notifications = document.querySelector('.notifications');
        if (!notifications.contains(e.target)) {
            const dropdown = document.querySelector('.notification-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    });

    /**
     * Categories 드롭다운 (모바일에서 클릭 토글)
     */
    const categoriesBtn = document.querySelector('.categories-btn');
    if (categoriesBtn) {
        categoriesBtn.addEventListener('click', (e) => {
            // 모바일에서만 토글 (데스크톱은 hover로 동작)
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                const dropdown = document.querySelector('.categories-dropdown');
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // Categories 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        const categoriesWrapper = document.querySelector('.categories-wrapper');
        if (!categoriesWrapper.contains(e.target)) {
            const dropdown = document.querySelector('.categories-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        }
    });

    /**
     * 모두 읽음 처리
     */
    const markAllRead = document.querySelector('.mark-all-read');
    if (markAllRead) {
        markAllRead.addEventListener('click', markAllNotificationsRead);
    }

    /**
     * Category 클릭 시 페이지 전환
     */
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const href = item.getAttribute('href');
            if (href && window.switchPage) {
                window.switchPage(href);
            }
        });
    });

/**
 * 로그아웃 처리
 */
function handleLogout() {
    // 확인 메시지
    if (typeof showConfirm === 'function') {
        showConfirm('로그아웃 하시겠습니까?', 'info').then(confirmed => {
            if (!confirmed) {
                return;
            }
            
            // localStorage에서 로그인 정보 제거
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userBio');
            localStorage.removeItem('selectedClass');
            localStorage.removeItem('selectedClassId');
            
            // 로그인 페이지로 이동
            window.location.href = 'index.html';
        });
    } else {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userBio');
            localStorage.removeItem('selectedClass');
            localStorage.removeItem('selectedClassId');
            window.location.href = 'index.html';
        }
    }
}

/**
 * 초기화 함수
 */
function init() {
    console.log('ClassBoard Design 시스템이 초기화되었습니다.');
    
    // DOM 요소 초기화
    initDOMElements();
    initAnnouncementElements();
    
    // Core 기능 초기화 (core.js)
    if (typeof initSidebar === 'function') {
        initSidebar();
    }
    if (typeof toggleDarkMode === 'function') {
        toggleDarkMode();
    }
    
    // [ClassBoard Update] 로그인 및 클래스 선택 상태 검증
    if (typeof checkAuthAndRedirect === 'function') {
        checkAuthAndRedirect();
    }
    
    // 클래스 정보 로드 및 표시
    if (typeof loadClassInfo === 'function') {
        loadClassInfo();
    }
    
    // 클래스 변경 시 위젯 설정 다시 로드
    if (typeof initWidgets === 'function') {
        // 위젯 설정을 현재 클래스에 맞게 다시 로드
        widgetDefaultPreferences = buildDefaultWidgetPreferences();
        widgetPreferences = loadWidgetPreferences(widgetDefaultPreferences);
        widgetDraftPreferences = clonePreferences(widgetPreferences);
        renderWidgetState(widgetDraftPreferences, { editing: isWidgetEditMode });
        refreshWidgetPicker(widgetDraftPreferences);
    }
    
    // 클래스 변경 시 사이드바 메뉴 설정 다시 로드
    if (typeof initSidebarMenuCustomization === 'function') {
        sidebarMenuDefaultPreferences = buildDefaultSidebarMenuPreferences();
        sidebarMenuPreferences = loadSidebarMenuPreferences(sidebarMenuDefaultPreferences);
        sidebarMenuDraftPreferences = clonePreferences(sidebarMenuPreferences);
        renderSidebarMenu();
    }
    
    // 상단바 클래스 정보 업데이트
    const navbarClassName = document.getElementById('navbar-class-name');
    if (navbarClassName) {
        const selectedClass = localStorage.getItem('selectedClass');
        if (selectedClass) {
            navbarClassName.textContent = selectedClass;
        } else {
            navbarClassName.textContent = '클래스를 선택하세요';
        }
    }
    
    // 초기 로드 시 위젯 편집 토글 표시/숨김 (대시보드 탭에서만 표시)
    const widgetToggleContainer = document.getElementById('widget-edit-toggle-container');
    if (widgetToggleContainer) {
        const dashboardContent = document.getElementById('dashboard-content');
        // 대시보드가 기본적으로 표시되어 있으면 토글 표시, 아니면 숨김
        if (dashboardContent) {
            const computedStyle = window.getComputedStyle(dashboardContent);
            if (computedStyle.display !== 'none') {
                widgetToggleContainer.hidden = false;
            } else {
                widgetToggleContainer.hidden = true;
            }
        } else {
            widgetToggleContainer.hidden = true;
        }
    }

    // 수업 만들기 버튼 이벤트 등록
    // 위젯 내 "오늘의 수업 만들기" 버튼 이벤트 리스너
    const widgetCreateSessionBtn = document.getElementById('widget-create-session-btn');
    if (widgetCreateSessionBtn && !widgetCreateSessionBtn.hasAttribute('data-listener-added')) {
        widgetCreateSessionBtn.setAttribute('data-listener-added', 'true');
        widgetCreateSessionBtn.addEventListener('click', () => {
            window.location.href = 'create-session.html';
        });
    }
    
    // 동적으로 추가되는 위젯 버튼을 위한 이벤트 위임
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'widget-create-session-btn') {
            if (typeof navigateWithClassCode === 'function') {
                navigateWithClassCode('create-session.html');
            } else {
                window.location.href = 'create-session.html';
            }
        }
        if (event.target && event.target.closest('#widget-create-session-btn')) {
            if (typeof navigateWithClassCode === 'function') {
                navigateWithClassCode('create-session.html');
            } else {
                window.location.href = 'create-session.html';
            }
        }
    });

    // 세션 목록 로드 및 표시
    loadSessions();
    
    // 게시판 탭 전환 기능 초기화
    initBoardTabs();

    // 공지사항 초기화
    initAnnouncements();
    initNotifications();
    
    // 로그아웃 버튼 이벤트 등록
    const logoutBtn = document.querySelector('.logout-item');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }
    
    // 페이지별 초기화는 switchPage에서만 처리
    // (Activity, Ask, Cloud, Quiz, Profile)

    // URL에서 클래스 코드 읽기 및 동기화
    if (typeof getClassCodeFromURL === 'function') {
        const urlClassCode = getClassCodeFromURL();
        if (urlClassCode) {
            // 권한 확인
            if (typeof hasAccessToClass === 'function') {
                if (!hasAccessToClass(urlClassCode)) {
                    // 권한이 없으면 클래스 선택 페이지로 리다이렉트
                    if (typeof showAlert === 'function') {
                        showAlert('이 클래스에 접근할 권한이 없습니다.', 'error').then(() => {
                            window.location.href = 'class-select.html';
                        });
                    } else {
                        alert('이 클래스에 접근할 권한이 없습니다.');
                        window.location.href = 'class-select.html';
                    }
                    return;
                }
            }
            localStorage.setItem('selectedClassCode', urlClassCode);
        } else {
            // URL에 클래스 코드가 없으면 localStorage에서 가져와서 URL에 추가
            const storedClassCode = localStorage.getItem('selectedClassCode');
            if (storedClassCode && storedClassCode !== 'default') {
                // 권한 확인
                if (typeof hasAccessToClass === 'function') {
                    if (!hasAccessToClass(storedClassCode)) {
                        // 권한이 없으면 클래스 선택 페이지로 리다이렉트
                        localStorage.removeItem('selectedClassCode');
                        if (typeof showAlert === 'function') {
                            showAlert('이 클래스에 접근할 권한이 없습니다.', 'error').then(() => {
                                window.location.href = 'class-select.html';
                            });
                        } else {
                            alert('이 클래스에 접근할 권한이 없습니다.');
                            window.location.href = 'class-select.html';
                        }
                        return;
                    }
                }
                
                if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set('class', storedClassCode);
                    window.history.replaceState({}, '', currentUrl.toString());
                }
            }
        }
    }

    // 프로필 드롭다운 초기화
    initProfileDropdown();
    
    // 클래스 코드 모달 초기화
    initClassCodeModal();
    
    // Ask 게시판 모달 초기화
    initAskBoardModal();
    
    // Dashboard widget customization
    initWidgetCustomization();

    // 사이드바 메뉴 커스터마이징 초기화
    initSidebarMenuCustomization();

        // 메뉴 아이템 초기화 (중요: switchPage 이후에 호출)
        // initMenuItems(); // 이제 renderSidebarMenu에서 처리
        
        // 검색 기능 초기화
        initSearch();

    // 프로필 정보 로드
    loadProfileInfo();
    
    // 페이지 로드 시 기본적으로 Dashboard 표시
    if (window.switchPage) {
        window.switchPage('#dashboard');
    }
}

/**
 * 사이드바 메뉴 커스터마이징 초기화
 */
function initSidebarMenuCustomization() {
    // 기본 설정 생성
    sidebarMenuDefaultPreferences = buildDefaultSidebarMenuPreferences();
    
    // 저장된 설정 로드
    sidebarMenuPreferences = loadSidebarMenuPreferences(sidebarMenuDefaultPreferences);
    sidebarMenuDraftPreferences = JSON.parse(JSON.stringify(sidebarMenuPreferences));
    
    // 메뉴 렌더링
    renderSidebarMenu();
    
    // 사이드바 메뉴 편집은 대시보드 편집 토글로 통합됨
    // 별도의 토글은 제거하고, 대시보드 편집 토글에서 제어
    
    // 메뉴 추가 버튼 이벤트 리스너
    const addBtn = document.getElementById('sidebar-menu-add-btn');
    const addBtnContainer = document.getElementById('sidebar-menu-add-btn-container');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openMenuAddModal();
        });
    }
    
    // 모달 닫기 버튼 이벤트 리스너
    const modalCloseBtn = document.getElementById('sidebar-menu-add-modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            closeMenuAddModal();
        });
    }
    
    // 모달 배경 클릭 시 닫기
    const modal = document.getElementById('sidebar-menu-add-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeMenuAddModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.hidden) {
            closeMenuAddModal();
        }
    });
    
    // 현재 페이지에 맞는 메뉴 활성화
    const currentHash = window.location.hash || '#dashboard';
    const currentMenuItem = sidebarMenu?.querySelector(`.menu-link[href="${currentHash}"]`);
    if (currentMenuItem) {
        const menuItem = currentMenuItem.closest('.menu-item');
        if (menuItem) {
            document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
            menuItem.classList.add('active');
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

/**
 * 유틸리티 함수들
 */

// 날짜 포맷팅
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('ko-KR', options);
}

// 시간 포맷팅
function formatTime(date) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleTimeString('ko-KR', options);
}

// 상대 시간 표시 (예: "2분 전")
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return formatDate(date);
}

// 알림 표시 함수 (간소화)
function showNotification(message, type = 'info') {
    console.log(`[${type}] ${message}`);
}

// 로딩 상태 표시 (간소화)
function showLoading(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
        el.style.opacity = '0.6';
        el.style.pointerEvents = 'none';
    }
}

function hideLoading(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
    }
}

// 애니메이션 효과 함수 (간소화 - CSS 애니메이션 사용 권장)
function fadeIn(element, duration = 300) {
    if (!element) return;
    element.style.opacity = '0';
    element.style.display = 'block';
    requestAnimationFrame(() => {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = '1';
    });
}

function fadeOut(element, duration = 300) {
    if (!element) return;
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

// checkAuthAndRedirect는 core.js에서 사용

/**
 * 세션 목록 로드 및 표시 (대시보드용 - 카드 형식)
 */
function loadSessions() {
    const sessionsGrid = document.getElementById('sessions-grid');
    if (!sessionsGrid) return;

    // localStorage에서 세션 목록 가져오기 (클래스별)
    const storageKey = getClassStorageKey(SESSIONS_STORAGE_KEY_BASE);
    const sessions = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (sessions.length === 0) {
        sessionsGrid.innerHTML = `
            <div class="empty-sessions" style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #999;">
                <i class="bx bx-calendar-x" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>아직 생성된 수업 게시물이 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">오늘의 수업 만들기 버튼을 클릭하여 수업을 생성해보세요!</p>
            </div>
        `;
        return;
    }

    // 세션 카드 생성
    sessionsGrid.innerHTML = sessions.map(session => {
        const formattedDate = formatSessionDate(session.date);
        return `
            <div class="session-card" data-session-id="${session.id}" style="background: white; border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); cursor: pointer; transition: all 0.3s ease;">
                <div class="session-card-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div class="session-card-icon" style="width: 50px; height: 50px; background: var(--blue); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                        <i class="bx bxs-calendar"></i>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--dark);">${escapeHtml(session.title)}</h3>
                        <p style="font-size: 0.9rem; color: #666; margin: 0;">${formattedDate} · ${session.number}차시</p>
                    </div>
                </div>
                <div class="session-card-footer" style="display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--grey);">
                    <span style="font-size: 0.85rem; color: var(--blue);">
                        상세보기
                    </span>
                </div>
            </div>
        `;
    }).join('');

    // 카드 클릭 이벤트
    sessionsGrid.querySelectorAll('.session-card').forEach(card => {
        card.addEventListener('click', () => {
            const sessionId = card.getAttribute('data-session-id');
            if (typeof navigateWithClassCode === 'function') {
                navigateWithClassCode(`session.html?sessionId=${sessionId}`);
            } else {
                window.location.href = `session.html?sessionId=${sessionId}`;
            }
        });

        // Hover 효과
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        });
    });
}

/**
 * 세션 목록 로드 및 표시 (게시판 테이블 형식 - Activity/Ask용)
 */
function loadSessionsForBoard(tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    // localStorage에서 세션 목록 가져오기 (클래스별)
    const storageKey = getClassStorageKey(SESSIONS_STORAGE_KEY_BASE);
    const sessions = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (sessions.length === 0) {
        tableBody.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <i class="bx bx-calendar-x" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                <p>아직 생성된 수업 게시물이 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">글쓰기 버튼을 클릭하여 수업을 생성해보세요!</p>
            </div>
        `;
        return;
    }

    // 세션 테이블 행 생성 (최신순으로 정렬)
    const sortedSessions = [...sessions].sort((a, b) => {
        if (a.date !== b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.number - a.number;
    });

    tableBody.innerHTML = sortedSessions.map((session, index) => {
        const rowNumber = sortedSessions.length - index;
        const formattedDate = formatSessionDateForTable(session.date);
        const author = session.author || '이석찬'; // 세션에 author가 있으면 사용, 없으면 기본값
        return `
            <div class="board-row" data-session-id="${session.id}">
                <div class="board-cell">${rowNumber}</div>
                <div class="board-cell board-title-cell">${escapeHtml(session.title)}</div>
                <div class="board-cell">${escapeHtml(author)}</div>
                <div class="board-cell">${formattedDate}</div>
                <div class="board-cell">
                    <button class="btn-delete-session" data-session-id="${session.id}" onclick="deleteSession('${session.id}', '${tableBodyId}'); event.stopPropagation();">
                        <i class="bx bx-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // 테이블 행 클릭 이벤트
    tableBody.querySelectorAll('.board-row').forEach(row => {
        row.addEventListener('click', () => {
            const sessionId = row.getAttribute('data-session-id');
            
            // Activity 페이지인 경우 공유 메모보드로 이동
            if (tableBodyId === 'activity-sessions-table-body') {
                if (typeof navigateWithClassCode === 'function') {
                    navigateWithClassCode(`activity-session.html?sessionId=${sessionId}`);
                } else {
                    window.location.href = `activity-session.html?sessionId=${sessionId}`;
                }
            } else {
                // Ask 페이지인 경우 ask-session.html로 이동
                if (typeof navigateWithClassCode === 'function') {
                    navigateWithClassCode(`ask-session.html?sessionId=${sessionId}`);
                } else {
                    window.location.href = `ask-session.html?sessionId=${sessionId}`;
                }
            }
        });
    });
}

/**
 * 세션 날짜 포맷팅 (게시판 테이블용)
 */
function formatSessionDateForTable(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 세션 날짜 포맷팅 (기존용 - 호환성 유지)
 */
function formatSessionDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 게시판 탭 전환 기능
 */
function initBoardTabs() {
    const boardTabs = document.querySelectorAll('.board-tab');
    
    if (boardTabs.length === 0) return;
    
    boardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            boardTabs.forEach(t => t.classList.remove('active'));
            
            // 클릭한 탭 활성화
            tab.classList.add('active');
            
            // 현재는 수업 게시물 탭만 구현되어 있으므로, 다른 탭은 알림
            const tabType = tab.getAttribute('data-tab');
            if (tabType !== 'sessions') {
                // TODO: 다른 탭 기능 구현 필요
                console.log(`${tabType} 탭 클릭됨 (향후 구현 예정)`);
            }
        });
    });
}

// 세션 삭제 함수
function deleteSession(sessionId, tableBodyId) {
    if (!sessionId) return;
    
    if (typeof showConfirm === 'function') {
        showConfirm('정말 삭제하시겠습니까?', 'danger').then(confirmed => {
            if (!confirmed) return;
            
            // localStorage에서 세션 삭제
            const storageKey = getClassStorageKey(SESSIONS_STORAGE_KEY_BASE);
            const sessions = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const filteredSessions = sessions.filter(s => s.id !== sessionId);
            localStorage.setItem(storageKey, JSON.stringify(filteredSessions));
            
            // 테이블 새로고침
            if (typeof loadSessionsForBoard === 'function') {
                loadSessionsForBoard(tableBodyId);
            }
            
            if (typeof showAlert === 'function') {
                showAlert('게시물이 삭제되었습니다.', 'success');
            }
        });
    }
}

// 전역 함수로 등록
window.deleteSession = deleteSession;

// Ask 게시판 글쓰기 버튼 처리 (create-session.html로 이동)
function initAskBoardModal() {
    const askWriteBtn = document.getElementById('ask-create-session-btn');
    
    if (askWriteBtn && !askWriteBtn.hasAttribute('data-modal-initialized')) {
        askWriteBtn.setAttribute('data-modal-initialized', 'true');
        askWriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'create-session.html';
        });
    }
}

// DOMContentLoaded 이벤트는 위의 init() 함수에서 이미 처리됨

/**
 * 프로필 정보 로드 및 표시
 */
function loadProfileInfo() {
        const userName = localStorage.getItem('userName');
        const selectedClass = localStorage.getItem('selectedClass');
        
        const profileName = document.getElementById('profile-name');
        const profileRole = document.getElementById('profile-role');
        const profileClassName = document.getElementById('profile-class-name');
        
        if (profileName && userName) {
            profileName.textContent = userName;
        }
        
        if (profileRole && userName) {
            profileRole.textContent = '교사';
        }
        
        if (profileClassName && selectedClass) {
            profileClassName.textContent = selectedClass;
        }
    }

/**
 * 공지사항 로컬스토리지 키
 */
// =========================
// 클래스별 데이터 분리 유틸리티
// =========================

/**
 * 현재 선택된 클래스 코드 가져오기 (클래스 코드 기반)
 * @returns {string} 클래스 코드 (없으면 'default')
 */
function getCurrentClassId() {
    // 클래스 코드를 우선적으로 사용
    const selectedClassCode = localStorage.getItem('selectedClassCode');
    if (selectedClassCode) {
        return selectedClassCode;
    }
    
    // 하위 호환성: 기존 selectedClassId가 있으면 클래스 코드로 변환 시도
    const selectedClassId = localStorage.getItem('selectedClassId');
    if (selectedClassId) {
        // 클래스명으로 클래스 코드 찾기
        const selectedClass = localStorage.getItem('selectedClass');
        if (selectedClass) {
            const classCode = localStorage.getItem(`classCode_${selectedClass}`);
            if (classCode) {
                // 마이그레이션: 클래스 코드 저장
                localStorage.setItem('selectedClassCode', classCode);
                return classCode;
            }
        }
    }
    
    // 클래스가 선택되지 않았으면 기본값 반환
    console.warn('선택된 클래스 코드가 없습니다. 기본 클래스를 사용합니다.');
    return 'default';
}

/**
 * 클래스별 스토리지 키 생성
 * @param {string} baseKey - 기본 키 이름
 * @param {string} [classId] - 클래스 ID (없으면 현재 선택된 클래스 사용)
 * @returns {string} 클래스별 스토리지 키
 */
function getClassStorageKey(baseKey, classId = null) {
    const currentClassId = classId || getCurrentClassId();
    return `${baseKey}_${currentClassId}`;
}

// 클래스별 스토리지 키 상수
const ANNOUNCEMENT_STORAGE_KEY_BASE = 'announcements';
const SESSIONS_STORAGE_KEY_BASE = 'sessions';
const NOTIFICATION_STORAGE_KEY = 'notifications'; // 알림은 전역 (사용자별)

if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
    crypto.randomUUID = function polyfillUUID() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return [...bytes].map((b, i) => {
            const hex = b.toString(16).padStart(2, '0');
            if (i === 4 || i === 6 || i === 8 || i === 10) {
                return `-${hex}`;
            }
            return hex;
        }).join('');
    };
}

/**
 * 공지사항 초기화
 */
function initAnnouncements() {
    if (!announcementList || !announcementBadge) return;

    announcementCreateBtn?.addEventListener('click', openAnnouncementModal);
    announcementModalClose?.addEventListener('click', closeAnnouncementModal);
    announcementModalCancel?.addEventListener('click', closeAnnouncementModal);
    announcementModal?.addEventListener('click', (event) => {
        if (event.target === announcementModal) {
            closeAnnouncementModal();
        }
    });
    announcementViewAllBtn?.addEventListener('click', openAnnouncementAllModal);
    announcementDetailClose?.addEventListener('click', closeAnnouncementDetailModal);
    announcementDetailModal?.addEventListener('click', (event) => {
        if (event.target === announcementDetailModal) {
            closeAnnouncementDetailModal();
        }
    });
    announcementAllClose?.addEventListener('click', closeAnnouncementAllModal);
    announcementAllModal?.addEventListener('click', (event) => {
        if (event.target === announcementAllModal) {
            closeAnnouncementAllModal();
        }
    });

    announcementForm?.addEventListener('submit', handleAnnouncementSubmit);
    announcementClearBtn?.addEventListener('click', handleAnnouncementClear);
    if (announcementList) {
        announcementList.addEventListener('click', handleAnnouncementListClick);
        announcementList.addEventListener('dblclick', handleAnnouncementItemDblClick);
    }
    announcementAllList?.addEventListener('dblclick', handleAnnouncementItemDblClick);

    const announcements = readAnnouncements();
    renderAnnouncements(sortAnnouncements(announcements));
}

function openAnnouncementModal() {
    if (!announcementModal) return;
    announcementModal.hidden = false;
    announcementModal.classList.add('active');

    const dateInput = announcementForm?.querySelector('#announcement-date');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }
}

function closeAnnouncementModal() {
    if (!announcementModal || !announcementForm) return;
    announcementModal.classList.remove('active');
    announcementModal.hidden = true;
    announcementForm.reset();
}

function handleAnnouncementSubmit(event) {
    event.preventDefault();
    if (!announcementForm) return;

    const formData = new FormData(announcementForm);
    const title = formData.get('title')?.toString().trim();
    const body = formData.get('body')?.toString().trim();
    const date = formData.get('date')?.toString();

    if (!title || !body || !date) {
        if (typeof showAlert === 'function') {
            showAlert('모든 필드를 입력해주세요.', 'warning');
        }
        return;
    }

    const newAnnouncement = {
        id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        body,
        date,
        createdAt: Date.now(),
        read: false
    };

    const announcements = [newAnnouncement, ...readAnnouncements()];
    saveAnnouncements(announcements);
    if (typeof pushNotification === 'function') {
        pushNotification({
            type: 'announcement',
            title: `새 공지 등록: ${title}`,
            body
        });
    }
    const sortedAnnouncements = sortAnnouncements(announcements);
    renderAnnouncements(sortedAnnouncements);
    closeAnnouncementModal();
    if (typeof showAlert === 'function') {
        showAlert('공지사항이 등록되었습니다.', 'success');
    }
}

function handleAnnouncementListClick(event) {
    const deleteButton = event.target.closest('.announcement-delete');
    if (!deleteButton) return;

    const { id } = deleteButton.dataset;
    if (!id) return;

    if (typeof showConfirm === 'function') {
        showConfirm('해당 공지를 삭제하시겠습니까?', 'danger').then(confirmed => {
            if (!confirmed) return;

            const next = readAnnouncements().filter(item => item.id !== id);
            saveAnnouncements(next);
            const sortedNext = sortAnnouncements(next);
            renderAnnouncements(sortedNext);
            if (typeof showAlert === 'function') {
                showAlert('공지사항이 삭제되었습니다.', 'success');
            }
        });
    }
}

function handleAnnouncementClear() {
    const existing = readAnnouncements();
    if (!existing.length) {
        if (typeof showAlert === 'function') {
            showAlert('삭제할 공지가 없습니다.', 'info');
        }
        return;
    }

    if (typeof showConfirm === 'function') {
        showConfirm('모든 공지를 삭제하시겠습니까?', 'danger').then(confirmed => {
            if (!confirmed) return;

            const storageKey = getClassStorageKey(ANNOUNCEMENT_STORAGE_KEY_BASE);
            localStorage.removeItem(storageKey);
            renderAnnouncements([]);
            if (typeof showAlert === 'function') {
                showAlert('전체 공지가 삭제되었습니다.', 'success');
            }
        });
    }
}

function renderAnnouncements(announcements) {
    if (!announcementList || !announcementBadge || !announcementEmpty) return;

    if (!announcements.length) {
        announcementList.innerHTML = '';
        announcementBadge.textContent = '0';
        announcementEmpty.hidden = false;
        if (announcementAllModal && announcementAllModal.classList.contains('active')) {
            renderAnnouncementAllList([]);
        }
        return;
    }

    const fragment = document.createDocumentFragment();

    announcements.forEach(item => {
        const isRead = Boolean(item.read);
        const wrapper = document.createElement('div');
        wrapper.className = `announcement-item ${isRead ? 'announcement-read' : 'announcement-unread'}`;
        wrapper.dataset.announcementId = item.id;

        const statusClasses = ['status-dot', isRead ? 'read' : 'unread'];
        if (!isRead && isAnnouncementUrgent(item.date)) {
            statusClasses.push('urgent');
        }

        wrapper.innerHTML = `
            <span class="${statusClasses.join(' ')}"></span>
            <div class="announcement-content">
                <p class="announcement-title">${escapeHtml(item.title)}</p>
                <div class="announcement-meta">
                    <i class="bx bx-calendar"></i>
                    <span>${formatAnnouncementDate(item.date)}</span>
                </div>
                <p class="announcement-body">${escapeHtml(item.body)}</p>
            </div>
            <button class="announcement-delete" data-id="${item.id}" aria-label="공지 삭제">
                <i class="bx bx-trash"></i>
            </button>
        `;
        fragment.appendChild(wrapper);
    });

    announcementList.replaceChildren(fragment);
    announcementBadge.textContent = String(announcements.length);
    announcementEmpty.hidden = true;
    if (announcementAllModal && announcementAllModal.classList.contains('active')) {
        renderAnnouncementAllList(announcements);
    }
}

function renderAnnouncementAllList(announcements) {
    if (!announcementAllList || !announcementAllEmpty) return;

    if (!announcements.length) {
        announcementAllList.replaceChildren();
        announcementAllEmpty.style.display = 'flex';
        return;
    }

    const fragment = document.createDocumentFragment();

    announcements.forEach(item => {
        const isRead = Boolean(item.read);
        const statusClasses = ['status-dot', isRead ? 'read' : 'unread'];
        if (!isRead && isAnnouncementUrgent(item.date)) {
            statusClasses.push('urgent');
        }

        const container = document.createElement('div');
        container.className = `announcement-all-item ${isRead ? 'announcement-read' : 'announcement-unread'}`;
        container.dataset.announcementId = item.id;
        container.innerHTML = `
            <div class="announcement-all-item-header">
                <div class="announcement-all-item-heading">
                    <span class="${statusClasses.join(' ')}"></span>
                    <span class="announcement-all-item-title">${escapeHtml(item.title)}</span>
                </div>
                <span class="announcement-all-item-date">
                    <i class="bx bx-calendar"></i>${formatAnnouncementDate(item.date)}
                </span>
            </div>
            <div class="announcement-all-item-body">${escapeHtml(item.body)}</div>
        `;
        fragment.appendChild(container);
    });

    announcementAllList.replaceChildren(fragment);
    announcementAllEmpty.style.display = 'none';
}

function readAnnouncements() {
    try {
        const storageKey = getClassStorageKey(ANNOUNCEMENT_STORAGE_KEY_BASE);
        const stored = localStorage.getItem(storageKey);
        const parsed = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.map(item => ({
            ...item,
            read: Boolean(item.read)
        }));
    } catch (error) {
        console.error('공지사항 데이터를 불러오는 중 오류가 발생했습니다.', error);
        return [];
    }
}

function saveAnnouncements(announcements) {
    const storageKey = getClassStorageKey(ANNOUNCEMENT_STORAGE_KEY_BASE);
    localStorage.setItem(storageKey, JSON.stringify(announcements));
}

function sortAnnouncements(announcements) {
    return [...announcements].sort((a, b) => {
        const createdAtDiff = (b.createdAt || 0) - (a.createdAt || 0);
        if (createdAtDiff !== 0) return createdAtDiff;
        return new Date(b.date) - new Date(a.date);
    });
}

function isAnnouncementUrgent(dateString) {
    const target = new Date(dateString);
    if (Number.isNaN(target.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diff = (target - today) / 86400000;
    return diff <= 2;
}

function formatAnnouncementDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function handleAnnouncementItemDblClick(event) {
    if (event.target.closest('.announcement-delete')) return;

    const targetItem = event.target.closest('[data-announcement-id]');
    if (!targetItem) return;

    const id = targetItem.dataset.announcementId;
    if (!id) return;

    const announcements = readAnnouncements();
    const announcement = announcements.find(item => item.id === id);
    if (!announcement) return;

    const updatedAnnouncements = markAnnouncementAsRead(id, announcements);
    const updatedAnnouncement = updatedAnnouncements.find(item => item.id === id) || announcement;

    openAnnouncementDetailModal(updatedAnnouncement);
}

function openAnnouncementDetailModal(announcement) {
    if (!announcementDetailModal || !announcementDetailTitle || !announcementDetailDate || !announcementDetailContent) return;

    announcementDetailTitle.textContent = announcement.title;
    announcementDetailDate.textContent = formatAnnouncementDate(announcement.date);
    announcementDetailContent.textContent = announcement.body;

    announcementDetailModal.hidden = false;
    announcementDetailModal.classList.add('active');
}

function closeAnnouncementDetailModal() {
    if (!announcementDetailModal) return;
    announcementDetailModal.classList.remove('active');
    announcementDetailModal.hidden = true;
}

function openAnnouncementAllModal() {
    if (!announcementAllModal || !announcementAllList || !announcementAllEmpty) return;

    const announcements = sortAnnouncements(readAnnouncements());
    renderAnnouncementAllList(announcements);

    announcementAllModal.hidden = false;
    announcementAllModal.classList.add('active');
}

function closeAnnouncementAllModal() {
    if (!announcementAllModal) return;
    announcementAllModal.classList.remove('active');
    announcementAllModal.hidden = true;
}

function markAnnouncementAsRead(id, announcements = readAnnouncements()) {
    let changed = false;
    const updated = announcements.map(item => {
        if (item.id === id && !item.read) {
            changed = true;
            return { ...item, read: true };
        }
        return item;
    });

    if (!changed) {
        return announcements;
    }

    saveAnnouncements(updated);
    const sorted = sortAnnouncements(updated);
    renderAnnouncements(sorted);
    return sorted;
}

/**
 * 알림 초기화 및 관리
 */
function initNotifications() {
    const storedNotifications = readStoredNotifications();
    renderNotifications(storedNotifications);
}

function pushNotification({ type = 'general', title = '', body = '' } = {}) {
    const notifications = readStoredNotifications();

    const newNotification = {
        id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        title: title || '새로운 알림',
        body,
        createdAt: Date.now(),
        read: false
    };

    const updated = [newNotification, ...notifications].slice(0, 30);
    saveStoredNotifications(updated);
    renderNotifications(updated);
}

function renderNotifications(notifications) {
    if (!notificationList || !notificationCount) return;

    if (!notifications.length) {
        notificationList.innerHTML = `
            <div class="notification-empty">
                <i class="bx bx-bell-off"></i>
                <p>새로운 알림이 없습니다.</p>
            </div>
        `;
        updateNotificationBadge(0);
        return;
    }

    const fragment = document.createDocumentFragment();

    notifications.forEach(notification => {
        fragment.appendChild(createNotificationElement(notification));
    });

    notificationList.replaceChildren(fragment);

    const unreadCount = notifications.reduce((count, notification) => {
        return notification.read ? count : count + 1;
    }, 0);

    updateNotificationBadge(unreadCount);
}

function createNotificationElement(notification) {
    const wrapper = document.createElement('div');
    wrapper.className = `notification-item${notification.read ? '' : ' unread'}`;
    wrapper.dataset.notificationId = notification.id;

    const bodyMarkup = notification.body
        ? `<p class="notification-body">${escapeHtml(notification.body)}</p>`
        : '';

    wrapper.innerHTML = `
        <div class="notification-icon">
            <i class="${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
            <p>${escapeHtml(notification.title)}</p>
            ${bodyMarkup}
            <span class="notification-time">${getRelativeTime(notification.createdAt)}</span>
        </div>
    `;

    return wrapper;
}

function markAllNotificationsRead() {
    const notifications = readStoredNotifications();
    if (!notifications.length) {
        updateNotificationBadge(0);
        if (notificationList) {
            notificationList.querySelectorAll('.notification-item').forEach(item => {
                item.classList.remove('unread');
            });
        }
        return;
    }

    const updated = notifications.map(notification => ({
        ...notification,
        read: true
    }));

    saveStoredNotifications(updated);
    renderNotifications(updated);
}

function readStoredNotifications() {
    try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveStoredNotifications(notifications) {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
}

function updateNotificationBadge(unreadCount) {
    if (!notificationCount) return;

    if (unreadCount > 0) {
        notificationCount.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        notificationCount.style.display = 'inline-flex';
    } else {
        notificationCount.textContent = '0';
        notificationCount.style.display = 'none';
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'announcement':
            return 'bx bxs-bullhorn';
        case 'activity':
            return 'bx bxs-grid-alt';
        case 'ask':
            return 'bx bxs-comment-dots';
        default:
            return 'bx bxs-bell';
    }
}

/**
 * 내보내기
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        formatTime,
        getRelativeTime
    };
}

