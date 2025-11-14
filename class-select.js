/**
 * class-select.js
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * 클래스 선택 기능 구현 - localStorage 기반
 */

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
        localStorage.removeItem('selectedClassCode');
        
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

// 이벤트 리스너 중복 등록 방지 플래그
let classSelectInitialized = false;

/**
 * 클래스 선택 초기화
 */
function initClassSelect() {
    // 이미 초기화되었으면 중복 실행 방지
    if (classSelectInitialized) {
        return;
    }
    
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

    // localStorage에서 클래스 목록 로드 및 렌더링
    loadAndRenderClasses();

    // 클래스 카드 초기화
    initClassCards();

    // 새 클래스 만들기 버튼
    const addClassCard = document.querySelector('.add-class-card:not(#join-class-card)');
    if (addClassCard && !addClassCard.dataset.listenerAdded) {
        addClassCard.dataset.listenerAdded = 'true';
        addClassCard.addEventListener('click', () => {
            showCreateClassModal();
        });
    }
    
    // 초대코드로 참여 버튼
    const joinClassCard = document.getElementById('join-class-card');
    if (joinClassCard && !joinClassCard.dataset.listenerAdded) {
        joinClassCard.dataset.listenerAdded = 'true';
        joinClassCard.addEventListener('click', () => {
            showJoinClassModal();
        });
    }
    
    // 초대코드 입력 모달 이벤트 리스너 (한 번만 등록)
    if (!window.joinClassModalInitialized) {
        window.joinClassModalInitialized = true;
        
        const joinClassModal = document.getElementById('join-class-modal');
        const closeJoinClassModalBtn = document.getElementById('close-join-class-modal');
        const cancelJoinClassBtn = document.getElementById('cancel-join-class');
        const submitJoinClassBtn = document.getElementById('submit-join-class');
        
        if (closeJoinClassModalBtn) {
            closeJoinClassModalBtn.addEventListener('click', closeJoinClassModal);
        }
        
        if (cancelJoinClassBtn) {
            cancelJoinClassBtn.addEventListener('click', closeJoinClassModal);
        }
        
        if (submitJoinClassBtn) {
            submitJoinClassBtn.addEventListener('click', handleJoinClass);
        }
        
        // 모달 외부 클릭 시 닫기
        if (joinClassModal) {
            joinClassModal.addEventListener('click', (e) => {
                if (e.target === joinClassModal) {
                    closeJoinClassModal();
                }
            });
        }
        
        // Enter 키로 제출
        const joinClassForm = document.getElementById('join-class-form');
        if (joinClassForm) {
            joinClassForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleJoinClass();
            });
        }
    }
    
    // 클래스 생성 모달 이벤트 리스너 (한 번만 등록)
    if (!window.createClassModalInitialized) {
        window.createClassModalInitialized = true;
        
        const createClassModal = document.getElementById('create-class-modal');
        const closeCreateClassModalBtn = document.getElementById('close-create-class-modal');
        const cancelCreateClassBtn = document.getElementById('cancel-create-class');
        const submitCreateClassBtn = document.getElementById('submit-create-class');
        
        if (closeCreateClassModalBtn) {
            closeCreateClassModalBtn.addEventListener('click', closeCreateClassModal);
        }
        
        if (cancelCreateClassBtn) {
            cancelCreateClassBtn.addEventListener('click', closeCreateClassModal);
        }
        
        if (submitCreateClassBtn) {
            submitCreateClassBtn.addEventListener('click', handleCreateClass);
        }
        
        // 모달 외부 클릭 시 닫기
        if (createClassModal) {
            createClassModal.addEventListener('click', (e) => {
                if (e.target === createClassModal) {
                    closeCreateClassModal();
                }
            });
        }
        
        // Enter 키로 제출
        const classForm = document.getElementById('create-class-form');
        if (classForm) {
            classForm.addEventListener('submit', (e) => {
                e.preventDefault();
                handleCreateClass();
            });
        }
        
        // 클래스명 입력 시 코드 자동 업데이트
        const nameInput = document.getElementById('class-name-input');
        const codeDisplay = document.getElementById('class-code-display');
        if (nameInput && codeDisplay) {
            nameInput.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    codeDisplay.value = generateClassCode(e.target.value);
                }
            });
        }
        
        // 코드 새로고침 버튼
        const refreshCodeBtn = document.getElementById('refresh-class-code');
        if (refreshCodeBtn && nameInput && codeDisplay) {
            refreshCodeBtn.addEventListener('click', () => {
                const currentName = nameInput.value.trim() || '새 클래스';
                codeDisplay.value = generateClassCode(currentName);
            });
        }
    }

    // anti-back 버튼
    const backBtn = document.getElementById('back-btn');
    if (backBtn && !backBtn.dataset.listenerAdded) {
        backBtn.dataset.listenerAdded = 'true';
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // 초기화 완료 플래그 설정
    classSelectInitialized = true;
}

/**
 * localStorage에서 클래스 목록 로드 및 렌더링
 */
function loadAndRenderClasses() {
    const classGrid = document.querySelector('.class-grid');
    if (!classGrid) return;

    // localStorage에서 클래스 목록 가져오기
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    
    // 기존 하드코딩된 카드들 제거 (add-class-card와 join-class-card 제외)
    const existingCards = classGrid.querySelectorAll('.class-card:not(.add-class-card):not(#join-class-card)');
    existingCards.forEach(card => card.remove());

    // 현재 사용자 정보
    const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : localStorage.getItem('userName') || 'unknown';
    const invitedClasses = typeof getInvitedClasses === 'function' ? getInvitedClasses(userId) : [];
    
    // localStorage의 클래스들을 카드로 렌더링 (권한이 있는 클래스만)
    Object.keys(classes).forEach(className => {
        const classData = classes[className];
        const classCode = classData.code || localStorage.getItem(`classCode_${className}`) || generateClassCode(className);
        
        // 접근 권한 확인
        if (typeof hasAccessToClass === 'function') {
            if (!hasAccessToClass(classCode)) {
                // 권한이 없으면 카드에 표시하지 않음
                return;
            }
        } else {
            // 권한 확인 함수가 없으면 소유자 또는 초대받은 클래스만 표시
            const isOwner = classData.owner === userId;
            const isInvited = invitedClasses.includes(classCode);
            if (!isOwner && !isInvited) {
                return;
            }
        }
        
        // 학생 수 파싱 ("30명" 형식에서 숫자만 추출)
        let studentCount = 0;
        if (classData.studentCount) {
            const match = classData.studentCount.toString().match(/\d+/);
            studentCount = match ? parseInt(match[0]) : 0;
        }
        
        // 클래스 코드가 없으면 생성 및 저장
        if (!classData.code) {
            classData.code = classCode;
            localStorage.setItem(`classCode_${className}`, classCode);
            classes[className] = classData;
            localStorage.setItem('classes', JSON.stringify(classes));
        }
        
        // 카드 생성 및 추가
        const card = createClassCard(className, studentCount, classCode);
        const addClassCard = classGrid.querySelector('.add-class-card:not(#join-class-card)');
        if (addClassCard) {
            classGrid.insertBefore(card, addClassCard);
        } else {
            classGrid.appendChild(card);
        }
    });
}

/**
 * 클래스 카드 DOM 요소 생성
 */
function createClassCard(className, studentCount, classCode) {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.setAttribute('data-class-id', className);
    
    const studentCountText = studentCount > 0 ? `${studentCount}명` : '0명';
    
    card.innerHTML = `
        <div class="class-card-icon">
            <i class="bx bx-group bx-spin-hover"></i>
        </div>
        <h3>${escapeHtml(className)}</h3>
        <div class="class-card-info">
            <div class="info-item">
                <i class="bx bx-user"></i>
                <span>${studentCountText}</span>
            </div>
            <div class="info-item">
                <i class="bx bx-message-square"></i>
                <span>0개 게시물</span>
            </div>
        </div>
    `;
    
    // 관리 버튼 추가
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
    
    // 수정 버튼 이벤트
    const editBtn = actionsDiv.querySelector('.class-edit-btn');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClassEdit(card);
    });
    
    // 삭제 버튼 이벤트
    const deleteBtn = actionsDiv.querySelector('.class-delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClassDelete(card);
    });
    
    // 클릭 이벤트
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.class-card-actions')) {
            handleClassSelect(card);
        }
    });
    
    return card;
}

/**
 * 클래스 카드 초기화 (이벤트 및 관리 버튼 추가)
 */
function initClassCards() {
    const classCards = document.querySelectorAll('.class-card:not(.add-class-card)');
    classCards.forEach(card => {
        // 기본 선택 이벤트
        const cardContent = card.querySelector('h3, .class-card-info');
        if (cardContent) {
            cardContent.style.cursor = 'pointer';
            cardContent.addEventListener('click', (e) => {
                e.stopPropagation();
                handleClassSelect(card);
            });
        }

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
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    const classData = classes[className] || {
        name: classTitle,
        studentCount: card.querySelector('.info-item span')?.textContent || '0명',
        code: localStorage.getItem(`classCode_${className}`) || (typeof generateClassCode === 'function' ? generateClassCode(className) : '')
    };
    
    // 소유자 권한 확인
    const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : localStorage.getItem('userName') || 'unknown';
    if (classData.owner && classData.owner !== userId) {
        showAlert('이 클래스를 수정할 권한이 없습니다. 소유자만 수정할 수 있습니다.', 'error');
        return;
    }

    // 수정 모달 표시
    showEditClassModal(classData, card);
}

/**
 * 클래스 삭제 처리
 */
function handleClassDelete(card) {
    const className = card.getAttribute('data-class-id');
    
    // 클래스 정보 불러오기
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    const classData = classes[className];
    
    // 소유자 권한 확인
    const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : localStorage.getItem('userName') || 'unknown';
    if (classData && classData.owner && classData.owner !== userId) {
        showAlert('이 클래스를 삭제할 권한이 없습니다. 소유자만 삭제할 수 있습니다.', 'error');
        return;
    }
    
    showConfirm(`${className}을(를) 삭제하시겠습니까?`, 'danger').then(confirmed => {
        if (!confirmed) return;
        
        // 클래스 코드 가져오기 (클래스 정보에서 우선 가져오기)
        const classCode = classData?.code || localStorage.getItem(`classCode_${className}`);
        
        delete classes[className];
        localStorage.setItem('classes', JSON.stringify(classes));
        
        // 클래스별 데이터 모두 삭제 (완전 격리, 클래스 코드 기반)
        // deleteAllClassData 함수 사용 (class-storage-utils.js)
        if (classCode && typeof deleteAllClassData === 'function') {
            deleteAllClassData(classCode);
        } else if (classCode) {
            // 폴백: 수동 삭제 (클래스 코드 기반)
            localStorage.removeItem(`announcements_${classCode}`);
            localStorage.removeItem(`sessions_${classCode}`);
            localStorage.removeItem(`activity_posts_${classCode}`);
            
            // 세션별 게시글도 삭제 (모든 session_posts_${classCode}_* 키 삭제)
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`session_posts_${classCode}_`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // 클래스 코드 삭제
        localStorage.removeItem(`classCode_${className}`);
        
        // 선택된 클래스인 경우 해제
        if (localStorage.getItem('selectedClass') === className) {
            localStorage.removeItem('selectedClass');
            localStorage.removeItem('selectedClassId');
            localStorage.removeItem('selectedClassCode');
        }
        
        // 카드 제거 애니메이션
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => {
            card.remove();
            // 클래스 목록 다시 렌더링 (삭제 반영)
            loadAndRenderClasses();
            showAlert('클래스가 삭제되었습니다.', 'success');
        }, 300);
    });
}

/**
 * 클래스 코드 생성
 */
function generateClassCode(className) {
    // 클래스명의 첫 글자들을 조합하여 코드 생성
    const words = className.trim().split(/\s+/);
    let code = '';
    
    if (words.length >= 2) {
        // 예: "1학년 1반" -> "1H1B"
        code = words.map(word => {
            // 숫자 추출
            const numbers = word.match(/\d+/);
            // 한글 추출 후 초성 변환 (간단한 버전)
            const korean = word.replace(/\d+/g, '');
            if (korean) {
                // 간단한 변환: 학년->H, 반->B 등
                const mapping = {
                    '학년': 'H', '반': 'B', '학급': 'C', '프로젝트': 'P', '반': 'B'
                };
                for (const [key, value] of Object.entries(mapping)) {
                    if (korean.includes(key)) {
                        return (numbers || '') + value;
                    }
                }
                return (numbers || '') + korean.charAt(0).toUpperCase();
            }
            return numbers || word.charAt(0).toUpperCase();
        }).join('');
    } else {
        // 단어가 하나면 첫 글자 + 랜덤 숫자
        code = className.trim().substring(0, 2).toUpperCase() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    }
    
    // 랜덤 4자리 숫자 추가
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return code + randomNum;
}

/**
 * 새 클래스 만들기 모달 표시
 */
function showCreateClassModal() {
    const modal = document.getElementById('create-class-modal');
    if (!modal) {
        // 폴백: 기본 alert
        if (typeof showAlert === 'function') {
            showAlert('클래스 생성 모달을 찾을 수 없습니다.', 'error');
        } else {
            alert('클래스 생성 모달을 찾을 수 없습니다.');
        }
        return;
    }
    
    // 기존 모달이 열려있으면 닫기
    closeCreateClassModal();
    
    // 모달 열기
    setTimeout(() => {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }, 10);
    
    // 폼 초기화
    const form = document.getElementById('create-class-form');
    if (form) {
        form.reset();
    }
    
    // 클래스 코드 자동 생성
    const codeDisplay = document.getElementById('class-code-display');
    const nameInput = document.getElementById('class-name-input');
    
    if (codeDisplay) {
        codeDisplay.value = generateClassCode('새 클래스');
    }
    
    // 포커스
    if (nameInput) {
        setTimeout(() => nameInput.focus(), 100);
    }
}

/**
 * 클래스 생성 모달 닫기
 */
function closeCreateClassModal() {
    const modal = document.getElementById('create-class-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/**
 * 클래스 생성 처리
 */
function handleCreateClass() {
    const nameInput = document.getElementById('class-name-input');
    const studentCountInput = document.getElementById('student-count-input');
    const codeDisplay = document.getElementById('class-code-display');
    
    if (!nameInput || !codeDisplay) {
        showAlert('필수 입력 필드를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const className = nameInput.value.trim();
    if (!className) {
        showAlert('클래스명을 입력해주세요.', 'warning');
        nameInput.focus();
        return;
    }
    
    // 중복 확인
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    if (classes[className]) {
        showAlert('이미 존재하는 클래스명입니다.', 'warning');
        nameInput.focus();
        return;
    }
    
    const studentCount = studentCountInput ? parseInt(studentCountInput.value) || 0 : 0;
    const classCode = codeDisplay.value.trim() || generateClassCode(className);
    const classId = className.replace(/\s+/g, '_');
    
    // 현재 사용자 정보 가져오기
    const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : localStorage.getItem('userName') || 'unknown';
    
    // 클래스 정보 저장 (소유자 정보 포함)
    classes[className] = {
        name: className,
        studentCount: studentCount > 0 ? `${studentCount}명` : '0명',
        code: classCode,
        owner: userId, // 클래스 소유자 저장
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // 클래스 코드 저장
    localStorage.setItem(`classCode_${className}`, classCode);
    
    // 클래스별 데이터 초기화 (빈 배열로 시작, 클래스 코드 기반)
    // 임시로 선택된 클래스 코드를 설정하여 클래스별 스토리지 키 생성
    const originalClassCode = localStorage.getItem('selectedClassCode');
    localStorage.setItem('selectedClassCode', classCode);
    
    // 클래스별 데이터 초기화
    if (typeof setClassStorage === 'function') {
        setClassStorage('announcements', []);
        setClassStorage('sessions', []);
        setClassStorage('activity_posts', []);
    } else {
        // 폴백: 직접 저장 (클래스 코드 기반)
        localStorage.setItem(`announcements_${classCode}`, JSON.stringify([]));
        localStorage.setItem(`sessions_${classCode}`, JSON.stringify([]));
        localStorage.setItem(`activity_posts_${classCode}`, JSON.stringify([]));
    }
    
    // 원래 선택된 클래스 코드 복원
    if (originalClassCode) {
        localStorage.setItem('selectedClassCode', originalClassCode);
    } else {
        localStorage.removeItem('selectedClassCode');
    }
    
    // 모달 닫기
    closeCreateClassModal();
    
    // 클래스 목록 다시 렌더링 (새 클래스 추가 반영)
    loadAndRenderClasses();
    
    showAlert(`${className} 클래스가 생성되었습니다!`, 'success');
}

/**
 * 초대코드로 클래스 참여 모달 표시
 */
function showJoinClassModal() {
    const modal = document.getElementById('join-class-modal');
    if (!modal) {
        // 폴백: 기본 alert
        if (typeof showAlert === 'function') {
            showAlert('초대코드 모달을 찾을 수 없습니다.', 'error');
        } else {
            alert('초대코드 모달을 찾을 수 없습니다.');
        }
        return;
    }
    
    // 기존 모달이 열려있으면 닫기
    closeJoinClassModal();
    
    // 모달 열기
    setTimeout(() => {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }, 10);
    
    // 입력 필드 초기화
    const inviteCodeInput = document.getElementById('invite-code-input');
    if (inviteCodeInput) {
        inviteCodeInput.value = '';
        setTimeout(() => inviteCodeInput.focus(), 100);
    }
}

/**
 * 초대코드로 클래스 참여 모달 닫기
 */
function closeJoinClassModal() {
    const modal = document.getElementById('join-class-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 입력 필드 초기화
    const inviteCodeInput = document.getElementById('invite-code-input');
    if (inviteCodeInput) {
        inviteCodeInput.value = '';
    }
}

/**
 * 초대코드로 클래스 참여 처리
 */
function handleJoinClass() {
    const inviteCodeInput = document.getElementById('invite-code-input');
    if (!inviteCodeInput) {
        showAlert('입력 필드를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const inviteCode = inviteCodeInput.value.trim();
    if (!inviteCode) {
        showAlert('초대코드를 입력해주세요.', 'warning');
        inviteCodeInput.focus();
        return;
    }
    
    // 초대코드로 클래스 참여
    if (typeof joinClassByInviteCode === 'function') {
        const result = joinClassByInviteCode(inviteCode);
        
        if (result.success) {
            // 모달 닫기
            closeJoinClassModal();
            
            // 클래스 목록 다시 렌더링
            loadAndRenderClasses();
            
            showAlert(result.message, 'success');
        } else {
            showAlert(result.message, 'error');
            inviteCodeInput.focus();
        }
    } else {
        showAlert('초대코드 기능을 사용할 수 없습니다.', 'error');
    }
}


/**
 * HTML 이스케이프 유틸리티
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    const oldClassName = card.getAttribute('data-class-id');
    const oldClassId = oldClassName.replace(/\s+/g, '_');
    const newClassId = newName.trim().replace(/\s+/g, '_');
    
    // 기존 클래스 데이터 가져오기
    const existingClassData = classes[oldClassName] || classData;
    const classCode = existingClassData.code || localStorage.getItem(`classCode_${oldClassName}`);
    
    // 새 클래스명으로 클래스 정보 업데이트
    classes[newName.trim()] = {
        ...existingClassData,
        name: newName.trim()
    };
    
    if (oldClassName !== newName.trim()) {
        delete classes[oldClassName];
        
        // 클래스 이름 변경 시 클래스 코드는 변경하지 않음 (클래스 코드는 고유 식별자)
        // 클래스 코드를 새 클래스명으로 연결만 변경 (코드 자체는 유지)
        if (classCode) {
            localStorage.setItem(`classCode_${newName.trim()}`, classCode);
            localStorage.removeItem(`classCode_${oldClassName}`);
            
            // 선택된 클래스 코드도 업데이트 (현재 선택된 클래스인 경우)
            if (localStorage.getItem('selectedClass') === oldClassName) {
                localStorage.setItem('selectedClassCode', classCode);
            }
        }
    }
    localStorage.setItem('classes', JSON.stringify(classes));
    
    // 선택된 클래스인 경우 업데이트
    if (localStorage.getItem('selectedClass') === oldClassName) {
        localStorage.setItem('selectedClass', newName.trim());
        localStorage.setItem('selectedClassId', newClassId);
    }
    
    // 클래스 목록 다시 렌더링 (이름 변경 반영)
    loadAndRenderClasses();
    
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

    // 클래스 코드 가져오기
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    const classData = classes[className];
    let classCode = classData?.code || localStorage.getItem(`classCode_${className}`);
    
    if (!classCode && typeof generateClassCode === 'function') {
        classCode = generateClassCode(className);
        localStorage.setItem(`classCode_${className}`, classCode);
    }

    if (!classCode) {
        showAlert('클래스 코드를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 접근 권한 확인
    if (typeof hasAccessToClass === 'function') {
        if (!hasAccessToClass(classCode)) {
            showAlert('이 클래스에 접근할 권한이 없습니다.', 'error');
            return;
        }
    }

    // 선택된 클래스 저장
    localStorage.setItem('selectedClass', className);
    localStorage.setItem('selectedClassCode', classCode); // 클래스 코드 저장
    localStorage.setItem('selectedClassId', className.replace(/\s+/g, '_')); // 하위 호환성
    
    // 클래스 정보 저장 (없는 경우에만)
    if (!classes[className]) {
        const userId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : localStorage.getItem('userName') || 'unknown';
        classes[className] = {
            name: className,
            code: classCode || '',
            studentCount: card.querySelector('.info-item span')?.textContent || '0명',
            owner: userId,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem(`classCode_${className}`, classCode);
    }

    // 선택 효과
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 200);

    // 성공 메시지
    showClassSelectMessage(`${className}을(를) 선택했습니다. 대시보드로 이동합니다...`, 'success');

    // 대시보드로 이동 (URL에 클래스 코드 포함)
    setTimeout(() => {
        // file:// 프로토콜에서는 상대 경로만 사용
        if (window.location.protocol === 'file:') {
            window.location.href = `main-session.html?class=${encodeURIComponent(classCode)}`;
        } else if (typeof navigateWithClassCode === 'function') {
            navigateWithClassCode('main-session.html');
        } else if (typeof addClassCodeToURL === 'function') {
            const url = addClassCodeToURL(classCode, 'main-session.html');
            window.location.href = url;
        } else {
            window.location.href = `main-session.html?class=${encodeURIComponent(classCode)}`;
        }
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
    const userRole = localStorage.getItem('userRole');
    
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const profileClassName = document.getElementById('profile-class-name');
    
    if (profileName && userName) {
        profileName.textContent = userName;
    }
    
    if (profileRole) {
        // 역할에 따라 표시
        if (userRole === 'admin' || userRole === 'teacher') {
        profileRole.textContent = '교사';
        } else if (userRole === 'student') {
            profileRole.textContent = '학생';
        } else {
            profileRole.textContent = '사용자';
        }
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

