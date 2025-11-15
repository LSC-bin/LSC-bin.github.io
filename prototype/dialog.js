/**
 * dialog.js
 * 커스텀 알림 및 확인 다이얼로그
 * 기본 브라우저 alert/confirm을 예쁜 커스텀 다이얼로그로 대체
 */

/**
 * 커스텀 Alert 다이얼로그
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'info', 'success', 'warning', 'error'
 * @returns {Promise<void>}
 */
function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        // 기존 다이얼로그가 있으면 제거
        const existing = document.getElementById('custom-dialog-overlay');
        if (existing) {
            existing.remove();
        }

        // 아이콘 및 색상 설정
        const config = {
            info: { icon: 'bx-info-circle', color: '#3C91E6', bg: 'rgba(60, 145, 230, 0.1)' },
            success: { icon: 'bx-check-circle', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            warning: { icon: 'bx-error-circle', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
            error: { icon: 'bx-x-circle', color: '#DB504A', bg: 'rgba(219, 80, 74, 0.1)' }
        };

        const { icon, color, bg } = config[type] || config.info;

        // 다이얼로그 HTML 생성
        const dialogHTML = `
            <div id="custom-dialog-overlay" class="custom-dialog-overlay">
                <div class="custom-dialog">
                    <div class="custom-dialog-icon" style="background: ${bg};">
                        <i class="bx ${icon}" style="color: ${color};"></i>
                    </div>
                    <div class="custom-dialog-content">
                        <p class="custom-dialog-message">${message}</p>
                    </div>
                    <div class="custom-dialog-footer">
                        <button class="custom-dialog-btn custom-dialog-btn-primary" style="background: ${color};">
                            확인
                        </button>
                    </div>
                </div>
            </div>
        `;

        // DOM에 추가
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        const overlay = document.getElementById('custom-dialog-overlay');
        const dialog = overlay.querySelector('.custom-dialog');
        const btn = overlay.querySelector('.custom-dialog-btn');

        // 애니메이션
        setTimeout(() => {
            overlay.classList.add('active');
            dialog.classList.add('active');
        }, 10);

        // 버튼 클릭 또는 ESC 키로 닫기
        const closeDialog = () => {
            overlay.classList.remove('active');
            dialog.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 300);
        };

        btn.addEventListener('click', closeDialog);
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 배경 클릭 시 닫기 (선택사항)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
            }
        });
    });
}

/**
 * 커스텀 Confirm 다이얼로그
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'info', 'warning', 'danger'
 * @returns {Promise<boolean>} - true: 확인, false: 취소
 */
function showConfirm(message, type = 'info') {
    return new Promise((resolve) => {
        // 기존 다이얼로그가 있으면 제거
        const existing = document.getElementById('custom-dialog-overlay');
        if (existing) {
            existing.remove();
        }

        // 아이콘 및 색상 설정
        const config = {
            info: { icon: 'bx-question-mark', color: '#3C91E6', bg: 'rgba(60, 145, 230, 0.1)' },
            warning: { icon: 'bx-error-circle', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
            danger: { icon: 'bx-error', color: '#DB504A', bg: 'rgba(219, 80, 74, 0.1)' }
        };

        const { icon, color, bg } = config[type] || config.info;

        // 다이얼로그 HTML 생성
        const dialogHTML = `
            <div id="custom-dialog-overlay" class="custom-dialog-overlay">
                <div class="custom-dialog">
                    <div class="custom-dialog-icon" style="background: ${bg};">
                        <i class="bx ${icon}" style="color: ${color};"></i>
                    </div>
                    <div class="custom-dialog-content">
                        <p class="custom-dialog-message">${message}</p>
                    </div>
                    <div class="custom-dialog-footer">
                        <button class="custom-dialog-btn custom-dialog-btn-cancel">취소</button>
                        <button class="custom-dialog-btn custom-dialog-btn-primary" style="background: ${color};">
                            확인
                        </button>
                    </div>
                </div>
            </div>
        `;

        // DOM에 추가
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        const overlay = document.getElementById('custom-dialog-overlay');
        const dialog = overlay.querySelector('.custom-dialog');
        const cancelBtn = overlay.querySelector('.custom-dialog-btn-cancel');
        const confirmBtn = overlay.querySelector('.custom-dialog-btn-primary');

        // 애니메이션
        setTimeout(() => {
            overlay.classList.add('active');
            dialog.classList.add('active');
        }, 10);

        // 닫기 함수
        const closeDialog = (result) => {
            overlay.classList.remove('active');
            dialog.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 300);
        };

        // 버튼 이벤트
        cancelBtn.addEventListener('click', () => closeDialog(false));
        confirmBtn.addEventListener('click', () => closeDialog(true));

        // ESC 키로 취소
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 배경 클릭 시 취소
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog(false);
            }
        });
    });
}

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showAlert, showConfirm };
}



