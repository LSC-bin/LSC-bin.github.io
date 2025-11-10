/**
 * class-select.js
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * 클래스 선택 기능 구현 - localStorage 기반
 */

import { AppUtils } from '@utils/app-utils.js';

const AppUtilsRef = window.AppUtils || AppUtils;
const {
    getStoredData: getStoredDataUtil = AppUtils.getStoredData,
    setStoredData: setStoredDataUtil = AppUtils.setStoredData
} = AppUtilsRef;

const getStoredData = (key, fallback) => getStoredDataUtil(key, fallback);
const setStoredData = (key, value) => setStoredDataUtil(key, value);

/**
 * 로그아웃 처리
 */
function handleLogout() {
    // 확인 메시지
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
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initClassSelect();
    loadProfileInfoForClassSelect();
    initProfileDropdown();
    
    // 로그아웃 버튼 이벤트 등록
    const logoutBtn = document.querySelector('.logout-item');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }
});

/**
 * 클래스 선택 초기화
 */
function initClassSelect() {
    // 로그인 상태 확인 (core.js 사용)
    if (typeof checkLoginStatus === 'function') {
        if (!checkLoginStatus()) return;
    } else {
        // fallback
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = 'index.html';
            return;
        }
    }

    // 클래스 카드 초기화
    initClassCards();

    // 새 클래스 만들기 버튼
    const addClassCard = document.querySelector('.add-class-card');
    if (addClassCard) {
        addClassCard.addEventListener('click', () => {
            showCreateClassModal();
        });
    }

    // anti-back 버튼
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

/**
 * 클래스 카드 초기화 (이벤트 및 관리 버튼 추가)
 */
function initClassCards() {
    const classCards = document.querySelectorAll('.class-card:not(.add-class-card)');
    classCards.forEach(card => {
        // 기본 선택 이벤트 (카드 전체 클릭 가능하도록 개선)
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // 관리 버튼을 클릭한 경우에는 선택 이벤트 무시
            if (e.target.closest('.class-card-actions')) {
                return;
            }

            e.stopPropagation();
            handleClassSelect(card);
        });

        // 관리 버튼 추가 (수정, 삭제)
        if (!card.querySelector('.class-card-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'class-card-actions';
            actionsDiv.innerHTML = `
                <button class="class-edit-btn" title="수정">
                    <i class="bx bx-edit"></i>
                </button>
                <button class="class-delete-btn" title="삭제">
                    <i class="bx bx-trash"></i>
                </button>
            `;
            card.appendChild(actionsDiv);

            // 수정 버튼
            const editBtn = actionsDiv.querySelector('.class-edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleClassEdit(card);
            });

            // 삭제 버튼
            const deleteBtn = actionsDiv.querySelector('.class-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleClassDelete(card);
            });
        }
    });
}

/**
 * 클래스 수정 처리
 */
function handleClassEdit(card) {
    const className = card.getAttribute('data-class-id');
    const classTitle = card.querySelector('h3').textContent;
    
    // 클래스 정보 불러오기 (localStorage에서)
    const classes = getStoredData('classes', {});
    const classData = classes[className] || {
        name: classTitle,
        studentCount: card.querySelector('.info-item span')?.textContent || '0명',
        code: localStorage.getItem(`classCode_${className}`) || (typeof generateClassCode === 'function' ? generateClassCode(className) : '')
    };

    // 수정 모달 표시
    showEditClassModal(classData, card);
}

/**
 * 클래스 삭제 처리
 */
function handleClassDelete(card) {
    const className = card.getAttribute('data-class-id');
    
    showConfirm(`${className}을(를) 삭제하시겠습니까?`, 'danger').then(confirmed => {
        if (!confirmed) return;
        
        // 클래스 정보 삭제
        const classes = getStoredData('classes', {});
        delete classes[className];
        setStoredData('classes', classes);
        
        // 선택된 클래스인 경우 해제
        if (localStorage.getItem('selectedClass') === className) {
            localStorage.removeItem('selectedClass');
            localStorage.removeItem('selectedClassId');
        }
        
        // 카드 제거 애니메이션
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => {
            card.remove();
            showAlert('클래스가 삭제되었습니다.', 'success');
        }, 300);
    });
}

/**
 * 새 클래스 만들기 모달 표시
 */
function showCreateClassModal() {
    showAlert('새 클래스 만들기 기능은 추후 구현 예정입니다.', 'info');
}

/**
 * 클래스 수정 모달 표시
 */
function showEditClassModal(classData, card) {
    // 간단한 프롬프트로 수정 (추후 모달로 개선 가능)
    const newName = prompt('클래스명을 수정하세요:', classData.name);
    if (!newName || newName.trim() === '' || newName === classData.name) {
        return;
    }
    
    // 클래스 정보 업데이트
    const classes = getStoredData('classes', {});
    const oldClassName = card.getAttribute('data-class-id');
    classes[newName.trim()] = {
        ...classData,
        name: newName.trim()
    };
    if (oldClassName !== newName.trim()) {
        delete classes[oldClassName];
    }
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // UI 업데이트
    card.setAttribute('data-class-id', newName.trim());
    card.querySelector('h3').textContent = newName.trim();
    
    // 선택된 클래스인 경우 업데이트
    if (localStorage.getItem('selectedClass') === oldClassName) {
        localStorage.setItem('selectedClass', newName.trim());
        localStorage.setItem('selectedClassId', newName.trim().replace(/\s+/g, '_'));
    }
    
    showAlert('클래스 정보가 수정되었습니다.', 'success');
}

/**
 * 클래스 선택 처리
 */
function handleClassSelect(card) {
    const className = card.getAttribute('data-class-id');
    
    if (!className) {
        console.error('클래스 ID를 찾을 수 없습니다.');
        return;
    }

    // 클래스 코드 생성 및 저장
    let classCode = localStorage.getItem(`classCode_${className}`);
    if (!classCode && typeof generateClassCode === 'function') {
        classCode = generateClassCode(className);
        localStorage.setItem(`classCode_${className}`, classCode);
    }
    
    // 선택된 클래스 저장
    localStorage.setItem('selectedClass', className);
    localStorage.setItem('selectedClassId', className.replace(/\s+/g, '_'));
    
    // 클래스 정보 저장
    const classes = getStoredData('classes', {});
    if (!classes[className]) {
        classes[className] = {
            name: className,
            code: classCode || '',
            studentCount: card.querySelector('.info-item span')?.textContent || '0명'
        };
    setStoredData('classes', classes);
    }

    // 선택 효과
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 200);

    // 성공 메시지
    showClassSelectMessage(`${className}을(를) 선택했습니다. 대시보드로 이동합니다...`, 'success');

    // 대시보드로 이동
    setTimeout(() => {
        window.location.href = 'main-session.html';
    }, 1000);
}

/**
 * 클래스 선택 메시지 표시
 */
function showClassSelectMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    messageBox.className = `class-select-message class-select-message-${type}`;
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

/**
 * 클래스 선택 페이지용 프로필 정보 로드
 */
function loadProfileInfoForClassSelect() {
    const userName = localStorage.getItem('userName');
    
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileClassName = document.getElementById('profile-class-name');
    
    if (profileName && userName) {
        profileName.textContent = userName;
    }
    
    if (profileRole && userName) {
        profileRole.textContent = '교사';
    }
    
    // 클래스 선택 페이지에서는 클래스를 아직 선택하지 않았음을 표시
    if (profileClassName) {
        profileClassName.textContent = '클래스를 선택하세요';
    }
}

/**
 * 프로필 드롭다운 토글 기능 (클래스 선택 페이지용)
 */
function initProfileDropdown() {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');

    if (profileBtn && profileDropdown) {
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

        // 프로필 드롭다운 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            const profile = document.querySelector('.profile');
            if (profile && !profile.contains(e.target)) {
                profileDropdown.style.display = 'none';
                profileDropdown.classList.remove('show');
            }
        });

        // ESC 키로 드롭다운 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && profileDropdown.style.display === 'block') {
                profileDropdown.style.display = 'none';
                profileDropdown.classList.remove('show');
            }
        });
    }
}

