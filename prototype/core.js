/**
 * core.js
 * AI ClassBoard - 공통 핵심 기능 모듈
 * 상태 관리, 사이드바, 다크모드 등 공통 기능
 */

/**
 * 로그인 상태 확인
 */
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        if (typeof showAlert === 'function') {
            showAlert('로그인이 필요합니다.', 'warning').then(() => {
                window.location.href = 'index.html';
            });
        } else {
            alert('로그인이 필요합니다.');
            window.location.href = 'index.html';
        }
        return false;
    }
    return true;
}

/**
 * 클래스 선택 상태 확인
 */
function checkClassSelected() {
    const selectedClass = localStorage.getItem('selectedClass');
    
    // class-select.html 페이지에서는 클래스 선택 검증을 건너뜀
    const currentPage = window.location.pathname.split('/').pop() || window.location.href.split('/').pop();
    if (currentPage === 'class-select.html') {
        return true; // 클래스 선택 페이지에서는 검증 건너뛰기
    }
    
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
 * 사이드바 초기화
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const navbarSidebarToggle = document.getElementById('navbar-sidebar-toggle');
    
    if (!sidebar) return;

    // Navbar 사이드바 토글 기능 (아이콘만 보이기/전체 보이기)
    if (navbarSidebarToggle) {
        navbarSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            // 상태 저장
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });

        // 저장된 상태 불러오기
        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        if (savedSidebarState === 'true') {
            sidebar.classList.add('collapsed');
        }
    }

    // 모바일 메뉴 토글
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // 반응형 사이드바 처리
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
}

/**
 * 다크 모드 토글 초기화
 */
function toggleDarkMode() {
    const switchMode = document.getElementById('switch-mode');
    const body = document.body;
    
    if (!switchMode) return;

    // localStorage에서 이전 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        switchMode.checked = true;
    }

    switchMode.addEventListener('change', () => {
        if (switchMode.checked) {
            body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}

/**
 * 클래스 정보 로드 및 표시
 */
function loadClassInfo() {
    const selectedClass = localStorage.getItem('selectedClass');
    const selectedClassId = localStorage.getItem('selectedClassId');
    
    // 대시보드 상단에 클래스명 표시 (제거됨 - 상단바로 이동)
    // 상단바에 클래스명 표시
    const navbarClassName = document.getElementById('navbar-class-name');
    if (navbarClassName) {
        if (selectedClass) {
            navbarClassName.textContent = selectedClass;
        } else {
            navbarClassName.textContent = '클래스를 선택하세요';
        }
    }
    
    // 기존 요소들도 업데이트 (다른 페이지 호환성 유지)
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
 * 내보내기
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkLoginStatus,
        checkClassSelected,
        checkAuthAndRedirect,
        initSidebar,
        toggleDarkMode,
        loadClassInfo,
        generateClassCode
    };
}



