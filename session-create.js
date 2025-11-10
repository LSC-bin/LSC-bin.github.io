/**
 * session-create.js
 * 수업 게시물 생성 페이지 로직
 */

const AppUtilsRef = window.AppUtils || {};
const {
    getStoredArray: getStoredArrayUtil = (key, fallback = []) => {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return fallback;
        }
    },
    setStoredArray: setStoredArrayUtil = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value || []));
        } catch (err) {
            console.warn('[AppUtils] Failed to persist sessions', err);
        }
    }
} = AppUtilsRef;

const getStoredArray = (key, fallback = []) => getStoredArrayUtil(key, fallback);
const setStoredArray = (key, value) => setStoredArrayUtil(key, value);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('session-form');
    const dateInput = document.getElementById('session-date');

    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // 폼 제출 처리
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('session-title').value.trim();
        const date = document.getElementById('session-date').value;
        const number = parseInt(document.getElementById('session-number').value);

        if (!title || !date || !number) {
            showAlert('모든 항목을 입력해주세요.', 'warning');
            return;
        }

        // 세션 ID 생성 (날짜-차시 형식)
        const sessionId = `${date}-${number}`;

        // 기존 세션 목록 가져오기
        const sessions = getStoredArray('sessions');

        // 중복 확인
        if (sessions.find(s => s.id === sessionId)) {
            showConfirm('이미 같은 날짜와 차시의 수업이 존재합니다. 덮어쓰시겠습니까?', 'warning').then(confirmed => {
                if (confirmed) {
                    saveSession(title, date, number, sessionId, sessions);
                }
            });
        } else {
            saveSession(title, date, number, sessionId, sessions);
        }
    });
});

/**
 * 세션 저장
 */
function saveSession(title, date, number, sessionId, sessions) {
    // 기존 세션 제거 (덮어쓰기인 경우)
    const filteredSessions = sessions.filter(s => s.id !== sessionId);

    // 새 세션 추가
    const newSession = {
        id: sessionId,
        title: title,
        date: date,
        number: number,
        createdAt: new Date().toISOString()
    };

    filteredSessions.push(newSession);

    // 날짜순으로 정렬 (최신순)
    filteredSessions.sort((a, b) => {
        if (a.date !== b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.number - a.number;
    });

    // localStorage에 저장
    setStoredArray('sessions', filteredSessions);

    showAlert('수업 게시물이 저장되었습니다!', 'success').then(() => {
        window.location.href = 'main-session.html';
    });
}

