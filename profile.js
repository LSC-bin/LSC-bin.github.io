/**
 * profile.js
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * 프로필 페이지 기능 구현 - localStorage 기반
 */

// 프로필 데이터 (localStorage로 추후 확장 가능)
let profileData = {
    name: '관리자',
    email: '',
    phone: '',
    bio: '',
    avatar: null
};

// 이벤트 리스너 핸들러 참조 (중복 방지를 위해)
let profileEventHandlers = {
    changeAvatar: null,
    saveProfile: null,
    cancelProfile: null,
    avatarChange: null
};

/**
 * 프로필 페이지 초기화
 */
function initProfile() {
    // 프로필 데이터 로드
    loadProfileData();

    // 사진 변경 버튼 이벤트
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    
    if (changeAvatarBtn && avatarInput) {
        // 기존 리스너 제거 (있는 경우)
        if (profileEventHandlers.changeAvatar) {
            changeAvatarBtn.removeEventListener('click', profileEventHandlers.changeAvatar);
        }
        if (profileEventHandlers.avatarChange) {
            avatarInput.removeEventListener('change', profileEventHandlers.avatarChange);
        }
        
        // 새로운 리스너 생성 및 등록
        profileEventHandlers.changeAvatar = (e) => {
            e.preventDefault();
            e.stopPropagation();
            avatarInput.click();
        };
        profileEventHandlers.avatarChange = handleAvatarChange;
        
        changeAvatarBtn.addEventListener('click', profileEventHandlers.changeAvatar);
        avatarInput.addEventListener('change', profileEventHandlers.avatarChange);
    }

    // 저장 버튼 이벤트
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
        // 기존 리스너 제거 (있는 경우)
        if (profileEventHandlers.saveProfile) {
            saveBtn.removeEventListener('click', profileEventHandlers.saveProfile);
        }
        
        // 새로운 리스너 생성 및 등록
        profileEventHandlers.saveProfile = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveProfile();
        };
        
        saveBtn.addEventListener('click', profileEventHandlers.saveProfile);
    }

    // 취소 버튼 이벤트
    const cancelBtn = document.getElementById('cancel-profile-btn');
    if (cancelBtn) {
        // 기존 리스너 제거 (있는 경우)
        if (profileEventHandlers.cancelProfile) {
            cancelBtn.removeEventListener('click', profileEventHandlers.cancelProfile);
        }
        
        // 새로운 리스너 생성 및 등록
        profileEventHandlers.cancelProfile = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCancelProfile();
        };
        
        cancelBtn.addEventListener('click', profileEventHandlers.cancelProfile);
    }
}

/**
 * 프로필 데이터 로드
 */
function loadProfileData() {
    // localStorage에서 데이터 불러오기
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    const userBio = localStorage.getItem('userBio');
    
    // 데이터 업데이트
    if (userName) {
        profileData.name = userName;
    }
    if (userEmail) {
        profileData.email = userEmail;
    }
    if (userPhone) {
        profileData.phone = userPhone;
    }
    if (userBio) {
        profileData.bio = userBio;
    }

    // 폼에 데이터 채우기
    const nameInput = document.getElementById('profile-name-input');
    const emailInput = document.getElementById('profile-email-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const bioInput = document.getElementById('profile-bio-input');

    if (nameInput) {
        nameInput.value = profileData.name || '';
    }
    if (emailInput) {
        emailInput.value = profileData.email || '';
    }
    if (phoneInput) {
        phoneInput.value = profileData.phone || '';
    }
    if (bioInput) {
        bioInput.value = profileData.bio || '';
    }
}

/**
 * 아바타 변경 처리
 */
function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 읽기
    const reader = new FileReader();
    reader.onload = (event) => {
        profileData.avatar = event.target.result;
        
        // 아바타 미리보기 (추후 구현)
        const avatarElement = document.querySelector('.profile-avatar-large i');
        if (avatarElement && profileData.avatar) {
            // 이미지로 표시하는 로직 추가 가능
            console.log('아바타 변경됨');
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 프로필 저장 처리
 */
function handleSaveProfile() {
    const nameInput = document.getElementById('profile-name-input');
    const emailInput = document.getElementById('profile-email-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const bioInput = document.getElementById('profile-bio-input');

    if (!nameInput || !nameInput.value.trim()) {
        showAlert('이름을 입력해주세요.', 'warning');
        return;
    }

    // 데이터 저장
    profileData.name = nameInput.value.trim();
    profileData.email = emailInput ? emailInput.value.trim() : '';
    profileData.phone = phoneInput ? phoneInput.value.trim() : '';
    profileData.bio = bioInput ? bioInput.value.trim() : '';

    // localStorage에 저장
    localStorage.setItem('userName', profileData.name);
    localStorage.setItem('userEmail', profileData.email);
    localStorage.setItem('userPhone', profileData.phone);
    localStorage.setItem('userBio', profileData.bio);

    // Firebase 저장 (추후 구현)
    // await saveProfileToFirebase(profileData);

    // 프로필 드롭다운 업데이트
    updateProfileDropdown();

    // 성공 메시지
    showAlert('프로필이 저장되었습니다.', 'success');

    // 대시보드로 이동
    if (typeof switchPage === 'function') {
        switchPage('#dashboard');
    }
}

/**
 * 프로필 취소 처리
 */
function handleCancelProfile() {
    // 원래 데이터로 복원
    loadProfileData();

    // 대시보드로 이동
    if (typeof switchPage === 'function') {
        switchPage('#dashboard');
    }
}

/**
 * 프로필 드롭다운 업데이트
 */
function updateProfileDropdown() {
    const profileName = document.getElementById('profile-name');
    if (profileName) {
        profileName.textContent = profileData.name || '관리자';
    }
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initProfile,
        loadProfileData,
        handleSaveProfile
    };
}


