/**
 * login.js
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * 로그인 기능 구현 - localStorage 기반
 */

// 즉시 초기화 (DOM이 이미 로드된 경우 대비)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
} else {
    initLogin();
}

/**
 * 로그인 초기화
 */
function initLogin() {
    console.log('로그인 페이지 초기화 시작');
    
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');

    console.log('관리자 버튼:', adminLoginBtn);
    console.log('Google 버튼:', googleLoginBtn);

    // 관리자 로그인 버튼 이벤트
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', handleAdminLogin);
        console.log('관리자 로그인 이벤트 연결 완료');
    } else {
        console.error('관리자 로그인 버튼을 찾을 수 없습니다!');
    }

    // Google 로그인 버튼 이벤트 (UI만, 기능은 추후 Firebase Auth로 구현)
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
        console.log('Google 로그인 이벤트 연결 완료');
    } else {
        console.error('Google 로그인 버튼을 찾을 수 없습니다!');
    }
}

/**
 * 관리자 로그인 처리
 */
function handleAdminLogin(e) {
    e.preventDefault();
    console.log('관리자 로그인 버튼 클릭됨');
    
    // 로그인 상태 저장
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userName', '관리자');

    console.log('로그인 상태 저장 완료');

    // 로그인 성공 메시지
    showLoginMessage('로그인 성공! 클래스 선택 화면으로 이동합니다...', 'success');

    // 클래스 선택 화면으로 이동
    setTimeout(() => {
        console.log('class-select.html로 이동');
        window.location.href = 'class-select.html';
    }, 1000);
}

/**
 * Google 로그인 처리 (현재는 UI만)
 */
function handleGoogleLogin(e) {
    e.preventDefault();
    console.log('Google 로그인 버튼 클릭됨');
    // 추후 Firebase Auth로 구현 예정
    showLoginMessage('Google 로그인은 현재 준비 중입니다.\n관리자 로그인을 사용해주세요.', 'info');
}

/**
 * 로그인 메시지 표시
 */
function showLoginMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    messageBox.className = `login-message login-message-${type}`;
    messageBox.textContent = message;
    
    document.body.appendChild(messageBox);

    // 애니메이션 효과
    requestAnimationFrame(() => {
        messageBox.style.opacity = '1';
        messageBox.style.transform = 'translateY(0)';
    });

    // 3초 후 제거
    setTimeout(() => {
        messageBox.style.opacity = '0';
        messageBox.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(messageBox);
        }, 300);
    }, 3000);
}

