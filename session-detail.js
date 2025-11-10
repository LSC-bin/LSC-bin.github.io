/**
 * session-detail.js
 * 수업 상세 페이지 로직 - sessionId 기반 통합 관리
 */

// 전역 변수: 현재 세션 ID
let currentSessionId = null;
let isReadOnlyMode = false; // 보기 전용 모드 플래그

document.addEventListener('DOMContentLoaded', () => {
    // URL 파라미터에서 sessionId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('sessionId');
    const tabParam = urlParams.get('tab'); // 탭 파라미터 가져오기

    if (!currentSessionId) {
        showAlert('수업 정보를 찾을 수 없습니다.', 'error').then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    // localStorage에서 세션 정보 가져오기
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    const session = sessions.find(s => s.id === currentSessionId);

    if (!session) {
        showAlert('수업 정보를 찾을 수 없습니다.', 'error').then(() => {
            window.location.href = 'index.html';
        });
        return;
    }

    // 이전 수업 여부 확인 (오늘 날짜보다 과거인지)
    isReadOnlyMode = isPastSession(session.date);

    // 세션 정보 표시
    document.getElementById('session-title').textContent = session.title;
    const className = localStorage.getItem('selectedClass') || '1학년 1반';
    const sessionClassNameEl = document.getElementById('session-class-name');
    if (sessionClassNameEl) {
        sessionClassNameEl.textContent = className;
    }
    document.getElementById('session-date').textContent = formatDate(session.date);
    document.getElementById('session-number').textContent = `${session.number}차시`;

    // 보기 전용 모드 UI 표시
    if (isReadOnlyMode) {
        showReadOnlyModeIndicator();
    }

    // 탭 전환 기능 초기화
    initTabs();

    // URL에 탭 파라미터가 있으면 해당 탭 활성화
    if (tabParam) {
        activateTab(tabParam);
    } else {
        // 기본 탭은 Activity
        if (typeof initActivityForSession === 'function') {
            initActivityForSession(currentSessionId, isReadOnlyMode);
        }
    }
    
    // Ask 탭 초기화 (질문 및 채팅 로드)
    if (typeof loadQuestionsForSession === 'function' && typeof loadChatMessagesForSession === 'function') {
        loadQuestionsForSession(currentSessionId);
        loadChatMessagesForSession(currentSessionId);
    }
    
    if (typeof initAskForSession === 'function') {
        // Ask 채팅 기능은 탭 전환 시 초기화
    }
    if (typeof initQuizForSession === 'function') {
        // Quiz는 탭 전환 시 초기화
    }
    if (typeof initMaterialsForSession === 'function') {
        // Materials는 탭 전환 시 초기화
    }
});

/**
 * 특정 탭 활성화
 */
function activateTab(tabName) {
    const tabs = document.querySelectorAll('.session-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // 모든 탭 비활성화
    tabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));

    // 선택한 탭 활성화
    const targetTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === tabName);
    const targetPane = document.getElementById(`tab-${tabName}`);
    
    if (targetTab && targetPane) {
        targetTab.classList.add('active');
        targetPane.classList.add('active');

        // 각 탭별 초기화 (readOnlyMode 전달)
        if (tabName === 'activity' && typeof initActivityForSession === 'function') {
            initActivityForSession(currentSessionId, isReadOnlyMode);
        } else if (tabName === 'ask' && typeof initAskForSession === 'function') {
            initAskForSession(currentSessionId, isReadOnlyMode);
        } else if (tabName === 'quiz' && typeof initQuizForSession === 'function') {
            initQuizForSession(currentSessionId, isReadOnlyMode);
        } else if (tabName === 'materials' && typeof initMaterialsForSession === 'function') {
            initMaterialsForSession(currentSessionId, isReadOnlyMode);
        }
    }
}

/**
 * 탭 전환 기능
 */
function initTabs() {
    const tabs = document.querySelectorAll('.session-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // 모든 탭 비활성화
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // 선택한 탭 활성화
            tab.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // 각 탭별 초기화 (readOnlyMode 전달)
            if (targetTab === 'activity' && typeof initActivityForSession === 'function') {
                initActivityForSession(currentSessionId, isReadOnlyMode);
            } else if (targetTab === 'ask' && typeof initAskForSession === 'function') {
                initAskForSession(currentSessionId, isReadOnlyMode);
            } else if (targetTab === 'quiz' && typeof initQuizForSession === 'function') {
                initQuizForSession(currentSessionId, isReadOnlyMode);
            } else if (targetTab === 'materials' && typeof initMaterialsForSession === 'function') {
                initMaterialsForSession(currentSessionId, isReadOnlyMode);
            }
        });
    });
}

/**
 * 현재 sessionId 가져오기 (전역 함수)
 */
function getCurrentSessionId() {
    return currentSessionId;
}

/**
 * 토스트 메시지 표시
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-error-circle' : 'bx-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    toastContainer.appendChild(toast);

    // 애니메이션
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}

/**
 * 이전 수업인지 확인 (오늘 날짜보다 과거인지)
 */
function isPastSession(sessionDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const session = new Date(sessionDate);
    session.setHours(0, 0, 0, 0);
    
    return session < today;
}

/**
 * 현재 읽기 전용 모드인지 확인
 */
function isReadOnly() {
    return isReadOnlyMode;
}

/**
 * 보기 전용 모드 표시 추가
 */
function showReadOnlyModeIndicator() {
    const header = document.querySelector('.session-detail-header');
    if (!header) return;

    const indicator = document.createElement('div');
    indicator.className = 'read-only-indicator';
    indicator.innerHTML = `
        <i class="bx bx-lock-alt"></i>
        <span>이전 수업 보기 모드 (읽기 전용)</span>
    `;
    
    // 헤더의 title 다음에 추가
    const titleElement = header.querySelector('div[style*="flex: 1"]');
    if (titleElement) {
        titleElement.appendChild(indicator);
    } else {
        header.appendChild(indicator);
    }
}

