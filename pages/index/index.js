import '../../utils/auth.js';
import '../../modules/dialog.js';
import '../../utils/common.js';

/**
 * index.js
 * AuthService를 활용한 로그인 컨트롤러
 */

const auth = window.AuthService || null;

function onReady() {
    const loginForm = document.querySelector('[data-login-form]');
    if (loginForm) {
        loginForm.addEventListener('submit', handleFormSubmit);
    }

    const adminLoginBtn = document.getElementById('admin-login-btn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', (event) => {
            event.preventDefault();
            signIn({ identifier: 'admin', password: 'admin' });
        });
    }

    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', (event) => {
            event.preventDefault();
            showMessage('Google 로그인은 준비 중입니다. 관리자 로그인을 이용해주세요.', 'info');
        });
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const credentials = {
        identifier: formData.get('identifier') || formData.get('email') || formData.get('username') || 'admin',
        password: formData.get('password') || 'admin'
    };
    await signIn(credentials);
}

async function signIn(credentials) {
    if (!auth || typeof auth.signIn !== 'function') {
        console.error('[login] AuthService가 준비되지 않았습니다.');
        showMessage('인증 서비스가 준비되지 않았습니다.', 'danger');
        return;
    }

    try {
        await auth.signIn(credentials);
        showMessage('로그인 성공! 클래스 선택 화면으로 이동합니다.', 'success');
        window.location.href = 'class-select.html';
    } catch (error) {
        console.error('[login] 로그인 중 오류가 발생했습니다:', error);
        showMessage('로그인에 실패했습니다. 다시 시도해주세요.', 'danger');
    }
}

function showMessage(message, type = 'info') {
    if (typeof showAlert === 'function') {
        showAlert(message, type);
        return;
    }
    alert(message);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}
