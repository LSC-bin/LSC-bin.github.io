/**
 * AI ClassBoard - JavaScript
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * ClassBoard Design 인터랙션 로직 & 공통 함수
 */

import { AppUtils } from '@utils/app-utils.js';

// DOM 요소 선택
const sidebarController = typeof window.initSidebar === 'function'
    ? window.initSidebar(document.querySelector('.sidebar'))
    : null;
const sidebar = sidebarController?.root || document.getElementById('sidebar');

// 유틸리티 모듈 참조

const AuthServiceRef = window.AuthService || {};
const AppUtilsRef = window.AppUtils || AppUtils;
const {
    escapeHtml: escapeHtmlUtil = AppUtils.escapeHtml,
    formatDate: formatDateUtil = AppUtils.formatDate,
    formatTime: formatTimeUtil = AppUtils.formatTime,
    getRelativeTime: getRelativeTimeUtil = AppUtils.getRelativeTime,
    getStoredArray: getStoredArrayUtil = AppUtils.getStoredArray,
    setStoredArray: setStoredArrayUtil = AppUtils.setStoredArray,
    getStoredData: getStoredDataUtil = AppUtils.getStoredData,
    setStoredData: setStoredDataUtil = AppUtils.setStoredData,
    getStoredValue: getStoredValueUtil = AppUtils.getStoredValue,
    setStoredValue: setStoredValueUtil = AppUtils.setStoredValue,
    removeStoredData: removeStoredDataUtil = AppUtils.removeStoredData
} = AppUtilsRef;

function escapeHtml(text) {
    return escapeHtmlUtil(text);
}

function formatDate(date, options) {
    return formatDateUtil(date, options);
}

function formatTime(date, options) {
    return formatTimeUtil(date, options);
}

function getRelativeTime(date, options) {
    return getRelativeTimeUtil(date, options);
}

const getStoredArray = (key, fallback = []) => getStoredArrayUtil(key, fallback);
const setStoredArray = (key, value) => setStoredArrayUtil(key, value);
const getStoredData = (key, fallback) => (typeof getStoredDataUtil === 'function' ? getStoredDataUtil(key, fallback) : fallback);
const setStoredData = (key, value) => (typeof setStoredDataUtil === 'function' ? setStoredDataUtil(key, value) : undefined);
const getStoredValue = (key, fallback = null) => (typeof getStoredValueUtil === 'function' ? getStoredValueUtil(key, fallback) : fallback);
const setStoredValue = (key, value) => (typeof setStoredValueUtil === 'function' ? setStoredValueUtil(key, value) : undefined);
const removeStoredValue = (key) => (typeof removeStoredDataUtil === 'function' ? removeStoredDataUtil(key) : undefined);

// 사이드바 초기화는 core.js의 initSidebar() 사용

/**
 * 사이드바 브랜드 클릭 시 클래스 선택 화면으로 이동
 */
const sidebarBrand = document.getElementById('sidebar-brand');
if (sidebarBrand) {
    sidebarBrand.addEventListener('click', () => {
        showConfirm('다른 클래스를 선택하시겠습니까?', 'info').then(confirmed => {
            if (confirmed) {
            window.location.href = 'class-select.html';
        }
        });
    });
}

// 다크 모드 토글은 core.js의 toggleDarkMode() 사용

/**
 * 사이드바 메뉴 항목 클릭 시
 */
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        // 모든 메뉴 항목에서 active 클래스 제거
        menuItems.forEach(i => i.classList.remove('active'));
        // 클릭한 항목에 active 클래스 추가
        item.classList.add('active');
        
        // 모바일에서 메뉴 클릭 시 사이드바 닫기
        const viewportWidth = typeof window.innerWidth === 'number' ? window.innerWidth : Infinity;
        if (viewportWidth <= 768) {
            if (sidebarController && typeof sidebarController.closeMobile === 'function') {
                sidebarController.closeMobile();
            } else if (sidebar) {
                sidebar.classList.remove('active');
            }
        }

        // 페이지 전환
        const link = e.currentTarget.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            switchPage(href);
        }
    });
});

/**
 * 페이지 전환
 */
function switchPage(pageId) {
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
        targetContent.style.display = 'block';
        
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
        
        // 페이지별 초기화
        setTimeout(() => {
            if (targetPage === 'profile' && typeof initProfile === 'function') {
                initProfile();
            } else if (targetPage === 'ask') {
                // Ask 페이지는 게시판 테이블만 로드 (initAsk 호출하지 않음)
                if (typeof loadSessionsForBoard === 'function') {
                    loadSessionsForBoard('ask-sessions-table-body');
                }
            } else if (targetPage === 'activity' && typeof initActivity === 'function') {
                initActivity();
                // Activity 페이지에 게시판 테이블 로드
                if (typeof loadSessionsForBoard === 'function') {
                    loadSessionsForBoard('activity-sessions-table-body');
                }
                // Activity 페이지 글쓰기 버튼 이벤트는 init에서 처리됨
            }
        }, 50);
    } else if (pageId === '#dashboard') {
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.style.display = 'block';
            // 최근 활동 표시
            const recentActivity = dashboardContent.querySelector('.content-section:last-of-type');
            if (recentActivity) {
                recentActivity.style.display = 'block';
            }
        }
    }
}

/**
 * 할 일 목록 필터링
 * @param {string} status - 'all', 'completed', 'pending'
 */
function filterTodos(status) {
    const todos = document.querySelectorAll('.todo-item');
    todos.forEach(todo => {
        const checkbox = todo.querySelector('input[type="checkbox"]');
        const isCompleted = checkbox.checked;
        
        if (status === 'all') {
            todo.style.display = 'flex';
        } else if (status === 'completed' && isCompleted) {
            todo.style.display = 'flex';
        } else if (status === 'pending' && !isCompleted) {
            todo.style.display = 'flex';
        } else {
            todo.style.display = 'none';
        }
    });
}

/**
 * 할 일 체크박스 변경 시
 */
const todoCheckboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
todoCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const label = checkbox.nextElementSibling;
        if (checkbox.checked) {
            label.classList.add('completed');
        } else {
            label.classList.remove('completed');
        }
    });
});

/**
 * 검색 기능
 */
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    console.log('검색어:', searchTerm);
    // 여기에 실제 검색 로직 구현
});

// 공지사항 관련 요소
const announcementList = document.getElementById('announcement-list');
const announcementBadge = document.getElementById('announcement-count');
const announcementEmpty = document.getElementById('announcement-empty');
const announcementCreateBtn = document.getElementById('announcement-create-btn');
const announcementClearBtn = document.getElementById('announcement-clear-btn');
const announcementModal = document.getElementById('announcement-modal');
const announcementModalClose = document.getElementById('announcement-modal-close');
const announcementModalCancel = document.getElementById('announcement-modal-cancel');
const announcementForm = document.getElementById('announcement-form');
const announcementViewAllBtn = document.getElementById('announcement-view-all-btn');
const announcementDetailModal = document.getElementById('announcement-detail-modal');
const announcementDetailClose = document.getElementById('announcement-detail-close');
const announcementDetailTitle = document.getElementById('announcement-detail-title');
const announcementDetailDate = document.getElementById('announcement-detail-date');
const announcementDetailContent = document.getElementById('announcement-detail-content');
const announcementAllModal = document.getElementById('announcement-all-modal');
const announcementAllClose = document.getElementById('announcement-all-close');
const announcementAllList = document.getElementById('announcement-all-list');
const announcementAllEmpty = document.getElementById('announcement-all-empty');

// 알림 관련 요소
const notificationList = document.querySelector('.notification-list');
const notificationCount = document.querySelector('.notification-count');

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
        const href = item.getAttribute('href');
        if (href) {
            switchPage(href);
        }
    });
});

/**
 * 로그아웃 처리
 */
function handleLogout() {
    // 확인 메시지
    showConfirm('로그아웃 하시겠습니까?', 'info').then(confirmed => {
        if (!confirmed) {
            return;
        }

        const signOut = AuthServiceRef && typeof AuthServiceRef.signOut === 'function'
            ? AuthServiceRef.signOut()
            : Promise.resolve();

        Promise.resolve(signOut)
            .catch(error => {
                console.warn('[script] 로그아웃 처리 중 오류가 발생했습니다:', error);
            })
            .finally(() => {
                removeStoredValue('selectedClass');
                removeStoredValue('selectedClassId');
                // 로그인 페이지로 이동
                window.location.href = 'index.html';
            });
    });
}

/**
 * 초기화 함수
 */
async function init() {
    console.log('ClassBoard Design 시스템이 초기화되었습니다.');

    if (typeof initApp === 'function') {
        try {
            await initApp();
        } catch (error) {
            console.warn('[script] 초기화 중 인증이 필요합니다:', error);
            return;
        }
    } else if (typeof checkAuthAndRedirect === 'function') {
        if (!checkAuthAndRedirect()) {
            return;
        }
    }

    // Core 기능 초기화 (core.js)
    if (typeof initSidebar === 'function') {
        initSidebar();
    }
    if (typeof toggleDarkMode === 'function') {
        toggleDarkMode();
    }
    
    // 클래스 정보 로드 및 표시
    if (typeof loadClassInfo === 'function') {
        loadClassInfo();
    }

    // 수업 만들기 버튼 이벤트 등록
    const createSessionBtn = document.getElementById('create-session-btn');
    if (createSessionBtn) {
        createSessionBtn.addEventListener('click', () => {
            window.location.href = 'create-session.html';
        });
    }

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

    // 프로필 드롭다운 초기화
    initProfileDropdown();
    
    // Ask 게시판 모달 초기화
    initAskBoardModal();
    
    // 프로필 정보 로드
    loadProfileInfo();
    
    // 페이지 로드 시 기본적으로 Dashboard 표시
    switchPage('#dashboard');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

/**
 * 유틸리티 함수들
 */

// 날짜 포맷팅
function formatDateReadable(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('ko-KR', options);
}

// 상대 시간 표시 (예: "2분 전")
function getRelativeTimeLabel(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return formatDateReadable(date);
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    // TODO: 실제 알림 UI 구현
}

// 로딩 상태 표시
function showLoading(target) {
    if (typeof target === 'string') {
        target = document.querySelector(target);
    }
    if (target) {
        target.style.opacity = '0.6';
        target.style.pointerEvents = 'none';
    }
}

function hideLoading(target) {
    if (typeof target === 'string') {
        target = document.querySelector(target);
    }
    if (target) {
        target.style.opacity = '1';
        target.style.pointerEvents = 'auto';
    }
}

/**
 * 애니메이션 효과 함수
 */
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    let start = null;
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = 1 - Math.min(progress / duration, 1);
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// checkAuthAndRedirect는 core.js에서 사용

/**
 * 세션 목록 로드 및 표시 (대시보드용 - 카드 형식)
 */
function loadSessions() {
    const sessionsGrid = document.getElementById('sessions-grid');
    if (!sessionsGrid) return;

    // 저장된 세션 목록 가져오기
    const sessions = getStoredArray('sessions');

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
                    <span style="font-size: 0.85rem; color: var(--blue); display: flex; align-items: center; gap: 0.5rem;">
                        상세보기 <i class="bx bx-right-arrow-alt"></i>
                    </span>
                </div>
            </div>
        `;
    }).join('');

    // 카드 클릭 이벤트
    sessionsGrid.querySelectorAll('.session-card').forEach(card => {
        card.addEventListener('click', () => {
            const sessionId = card.getAttribute('data-session-id');
            window.location.href = `session.html?sessionId=${sessionId}`;
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

    // 저장된 세션 목록 가져오기 (모든 세션 표시)
    const sessions = getStoredArray('sessions');

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
                window.location.href = `activity-session.html?sessionId=${sessionId}`;
            } else {
                // Ask 페이지인 경우 ask-session.html로 이동
                window.location.href = `ask-session.html?sessionId=${sessionId}`;
            }
        });
    });
}

/**
 * 세션 날짜 포맷팅 (게시판 테이블용)
 */
function formatSessionDateForTable(dateString) {
    return formatDate(dateString, { style: 'iso' });
}

function formatSessionDate(dateString) {
    return formatDate(dateString, { style: 'literal' });
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
    
    showConfirm('정말 삭제하시겠습니까?', 'danger').then(confirmed => {
        if (!confirmed) return;
        
        // 저장된 세션 데이터에서 삭제
        const sessions = getStoredArray('sessions');
        const filteredSessions = sessions.filter(s => s.id !== sessionId);
        setStoredArray('sessions', filteredSessions);
        
        // 테이블 새로고침
        if (typeof loadSessionsForBoard === 'function') {
            loadSessionsForBoard(tableBodyId);
        }
        
        showAlert('게시물이 삭제되었습니다.', 'success');
    });
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
    const authUser = typeof AuthServiceRef.getCurrentUser === 'function'
        ? AuthServiceRef.getCurrentUser()
        : null;
    const userName = authUser?.name || getStoredValue('userName');
    const userRole = authUser?.role || '교사';
    const selectedClass = getStoredValue('selectedClass');

    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileClassName = document.getElementById('profile-class-name');

    if (profileName && userName) {
        profileName.textContent = userName;
    }

    if (profileRole && userName) {
        profileRole.textContent = userRole;
    }

    if (profileClassName && selectedClass) {
        profileClassName.textContent = selectedClass;
    }
}

/**
 * 공지사항 로컬스토리지 키
 */
const ANNOUNCEMENT_STORAGE_KEY = 'announcements';
const NOTIFICATION_STORAGE_KEY = 'notifications';

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
    announcementList.addEventListener('click', handleAnnouncementListClick);
    announcementList.addEventListener('dblclick', handleAnnouncementItemDblClick);
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
        showAlert('모든 필드를 입력해주세요.', 'warning');
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
    pushNotification({
        type: 'announcement',
        title: `새 공지 등록: ${title}`,
        body
    });
    const sortedAnnouncements = sortAnnouncements(announcements);
    renderAnnouncements(sortedAnnouncements);
    closeAnnouncementModal();
    showAlert('공지사항이 등록되었습니다.', 'success');
}

function handleAnnouncementListClick(event) {
    const deleteButton = event.target.closest('.announcement-delete');
    if (!deleteButton) return;

    const { id } = deleteButton.dataset;
    if (!id) return;

    showConfirm('해당 공지를 삭제하시겠습니까?', 'danger').then(confirmed => {
        if (!confirmed) return;

        const next = readAnnouncements().filter(item => item.id !== id);
        saveAnnouncements(next);
        const sortedNext = sortAnnouncements(next);
        renderAnnouncements(sortedNext);
        showAlert('공지사항이 삭제되었습니다.', 'success');
    });
}

function handleAnnouncementClear() {
    const existing = readAnnouncements();
    if (!existing.length) {
        showAlert('삭제할 공지가 없습니다.', 'info');
        return;
    }

    showConfirm('모든 공지를 삭제하시겠습니까?', 'danger').then(confirmed => {
        if (!confirmed) return;

        removeStoredValue(ANNOUNCEMENT_STORAGE_KEY);
        renderAnnouncements([]);
        showAlert('전체 공지가 삭제되었습니다.', 'success');
    });
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
        const stored = getStoredData(ANNOUNCEMENT_STORAGE_KEY, []);
        if (!Array.isArray(stored)) return [];
        return stored.map(item => ({
            ...item,
            read: Boolean(item.read)
        }));
    } catch (error) {
        console.error('공지사항 데이터를 불러오는 중 오류가 발생했습니다.', error);
        return [];
    }
}

function saveAnnouncements(announcements) {
    setStoredData(ANNOUNCEMENT_STORAGE_KEY, announcements);
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
            <span class="notification-time">${getRelativeTimeLabel(notification.createdAt)}</span>
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
        const stored = getStoredData(NOTIFICATION_STORAGE_KEY, []);
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

function saveStoredNotifications(notifications) {
    setStoredData(NOTIFICATION_STORAGE_KEY, notifications);
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

const MainSessionModule = {
    formatDate,
    formatTime,
    getRelativeTime,
    showNotification,
    showLoading,
    hideLoading,
    fadeIn,
    fadeOut,
    loadProfileInfo
};

if (typeof window !== 'undefined') {
    window.MainSessionModule = Object.assign({}, window.MainSessionModule || {}, MainSessionModule);
    Object.assign(window, MainSessionModule);
}

export {
    formatDate,
    formatTime,
    getRelativeTime,
    showNotification,
    showLoading,
    hideLoading,
    fadeIn,
    fadeOut,
    loadProfileInfo
};

export default MainSessionModule;

