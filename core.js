/**
 * core.js
 * AI ClassBoard - 공통 핵심 기능 모듈
 * 상태 관리, 사이드바, 다크모드 등 공통 기능
 */

const AuthServiceRef = typeof window !== 'undefined' ? (window.AuthService || {}) : {};
const AppUtilsRef = typeof window !== 'undefined' ? (window.AppUtils || {}) : {};
const {
    getStoredValue: getStoredValueUtil = () => null,
    setStoredValue: setStoredValueUtil = () => {}
} = AppUtilsRef;

const getStoredValue = (key, fallback = null) => getStoredValueUtil(key, fallback);
const setStoredValue = (key, value) => setStoredValueUtil(key, value);

/**
 * 로그인 상태 확인
 */
function checkLoginStatus(options = {}) {
    const auth = AuthServiceRef;
    const isLoggedIn = typeof auth.isAuthenticated === 'function' ? auth.isAuthenticated() : false;

    if (!isLoggedIn) {
        if (options.redirect !== false) {
            const redirectTo = options.loginPage || 'index.html';
            if (typeof showAlert === 'function') {
                showAlert('로그인이 필요합니다.', 'warning').then(() => {
                    window.location.href = redirectTo;
                });
            } else {
                alert('로그인이 필요합니다.');
                window.location.href = redirectTo;
            }
        }
        return false;
    }
    return true;
}

/**
 * 클래스 선택 상태 확인
 */
function checkClassSelected() {
    const selectedClass = getStoredValue('selectedClass');
    
    if (!selectedClass) {
        if (typeof showAlert === 'function') {
            showAlert('클래스를 선택해주세요.', 'warning').then(() => {
                window.location.href = 'class-select.html';
            });
        } else {
            alert('클래스를 선택해주세요.');
            window.location.href = 'class-select.html';
        }
        return false;
    }
    return true;
}

/**
 * 인증 및 클래스 선택 상태 검증 (대시보드용)
 */
function checkAuthAndRedirect() {
    if (!checkLoginStatus()) {
        return false;
    }
    if (!checkClassSelected()) {
        return false;
    }
    return true;
}

/**
 * 다크 모드 토글 초기화
 */
function toggleDarkMode() {
    const switchMode = document.getElementById('switch-mode');
    const body = document.body;
    
    if (!switchMode) return;

    // 저장된 테마 설정 불러오기
    const savedTheme = getStoredValue('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        switchMode.checked = true;
    }

    switchMode.addEventListener('change', () => {
        if (switchMode.checked) {
            body.classList.add('dark');
            setStoredValue('theme', 'dark');
        } else {
            body.classList.remove('dark');
            setStoredValue('theme', 'light');
        }
    });
}

/**
 * 클래스 정보 로드 및 표시
 */
function loadClassInfo() {
    const selectedClass = getStoredValue('selectedClass');
    const selectedClassId = getStoredValue('selectedClassId');
    
    // 대시보드 상단에 클래스명 표시
    const classDisplayElements = document.querySelectorAll('.current-class-name, [data-class-name]');
    classDisplayElements.forEach(element => {
        if (selectedClass) {
            element.textContent = selectedClass;
        }
    });
    
    return {
        className: selectedClass,
        classId: selectedClassId
    };
}

/**
 * 클래스 코드 생성
 */
function generateClassCode(className) {
    // 클래스명을 기반으로 고유 코드 생성
    const timestamp = Date.now().toString(36);
    const nameHash = className.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(36);
    return `${nameHash.substring(0, 4)}-${timestamp.substring(timestamp.length - 6)}`.toUpperCase();
}

/**
 * 애플리케이션 공통 초기화
 */
async function initApp(options = {}) {
    const auth = AuthServiceRef;
    if (!auth || typeof auth.requireSession !== 'function') {
        console.warn('[core] AuthService가 초기화되지 않았습니다.');
        return null;
    }

    const sessionOptions = {
        redirectTo: options.loginPage || 'index.html',
        redirect: options.redirect !== false
    };

    try {
        const user = await auth.requireSession(sessionOptions);
        return user;
    } catch (error) {
        console.warn('[core] 세션 확인 중 오류가 발생했습니다:', error);
        throw error;
    }
}

if (typeof window !== 'undefined') {
    window.initApp = initApp;
    if (typeof window.initSidebar === 'function') {
        window.initSidebar(window.document.querySelector('.sidebar'));
    }
}

/**
 * 내보내기
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkLoginStatus,
        checkClassSelected,
        checkAuthAndRedirect,
        toggleDarkMode,
        loadClassInfo,
        generateClassCode,
        initApp
    };
}

