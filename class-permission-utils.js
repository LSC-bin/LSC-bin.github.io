/**
 * 클래스 접근 권한 관리 유틸리티
 * [ClassBoard Update] 교사/학생 권한 기반 클래스 접근 제어
 */

/**
 * 현재 사용자 ID 가져오기
 * @returns {string} 사용자 ID (userName 또는 userEmail)
 */
function getCurrentUserId() {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    return userEmail || userName || 'anonymous';
}

/**
 * 현재 사용자 역할 가져오기
 * @returns {string} 사용자 역할 ('admin', 'teacher', 'student')
 */
function getCurrentUserRole() {
    return localStorage.getItem('userRole') || 'student';
}

/**
 * 교사 여부 확인
 * @returns {boolean} 교사인지 여부
 */
function isTeacher() {
    const role = getCurrentUserRole();
    return role === 'admin' || role === 'teacher';
}

/**
 * 클래스 소유자 확인
 * @param {string} classCode - 클래스 코드
 * @returns {string|null} 소유자 ID (없으면 null)
 */
function getClassOwner(classCode) {
    if (!classCode) return null;
    
    // 클래스 정보에서 소유자 찾기
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    for (const [className, classData] of Object.entries(classes)) {
        if (classData.code === classCode) {
            return classData.owner || null;
        }
    }
    return null;
}

/**
 * 사용자가 초대받은 클래스 목록 가져오기
 * @param {string} userId - 사용자 ID (없으면 현재 사용자)
 * @returns {string[]} 클래스 코드 배열
 */
function getInvitedClasses(userId = null) {
    const currentUserId = userId || getCurrentUserId();
    const key = `userInvitedClasses_${currentUserId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * 사용자에게 클래스 초대 추가
 * @param {string} classCode - 클래스 코드
 * @param {string} userId - 사용자 ID (없으면 현재 사용자)
 * @returns {boolean} 성공 여부
 */
function addInvitedClass(classCode, userId = null) {
    if (!classCode) return false;
    
    const currentUserId = userId || getCurrentUserId();
    const key = `userInvitedClasses_${currentUserId}`;
    const invitedClasses = getInvitedClasses(currentUserId);
    
    // 이미 초대받은 클래스인지 확인
    if (invitedClasses.includes(classCode)) {
        return true; // 이미 있으면 성공으로 처리
    }
    
    // 초대 목록에 추가
    invitedClasses.push(classCode);
    localStorage.setItem(key, JSON.stringify(invitedClasses));
    
    // 클래스별 초대받은 사용자 목록에도 추가
    const classKey = `classInvitedUsers_${classCode}`;
    const invitedUsers = JSON.parse(localStorage.getItem(classKey) || '[]');
    if (!invitedUsers.includes(currentUserId)) {
        invitedUsers.push(currentUserId);
        localStorage.setItem(classKey, JSON.stringify(invitedUsers));
    }
    
    // 클래스 정보에 초대받은 사용자 정보 업데이트 (선택사항)
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    for (const [className, classData] of Object.entries(classes)) {
        if (classData.code === classCode) {
            if (!classData.invitedUsers) {
                classData.invitedUsers = [];
            }
            if (!classData.invitedUsers.includes(currentUserId)) {
                classData.invitedUsers.push(currentUserId);
                classes[className] = classData;
                localStorage.setItem('classes', JSON.stringify(classes));
            }
            break;
        }
    }
    
    return true;
}

/**
 * 사용자의 클래스 초대 제거
 * @param {string} classCode - 클래스 코드
 * @param {string} userId - 사용자 ID (없으면 현재 사용자)
 */
function removeInvitedClass(classCode, userId = null) {
    if (!classCode) return;
    
    const currentUserId = userId || getCurrentUserId();
    const key = `userInvitedClasses_${currentUserId}`;
    const invitedClasses = getInvitedClasses(currentUserId);
    
    const index = invitedClasses.indexOf(classCode);
    if (index > -1) {
        invitedClasses.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(invitedClasses));
    }
    
    // 클래스별 초대받은 사용자 목록에서도 제거
    const classKey = `classInvitedUsers_${classCode}`;
    const invitedUsers = JSON.parse(localStorage.getItem(classKey) || '[]');
    const userIndex = invitedUsers.indexOf(currentUserId);
    if (userIndex > -1) {
        invitedUsers.splice(userIndex, 1);
        localStorage.setItem(classKey, JSON.stringify(invitedUsers));
    }
}

/**
 * 클래스 접근 권한 확인
 * @param {string} classCode - 클래스 코드
 * @returns {boolean} 접근 권한이 있는지 여부
 */
function hasAccessToClass(classCode) {
    if (!classCode || classCode === 'default') {
        return false;
    }
    
    const userId = getCurrentUserId();
    const userRole = getCurrentUserRole();
    
    // 클래스 소유자 확인
    const owner = getClassOwner(classCode);
    if (owner === userId) {
        return true; // 소유자는 항상 접근 가능
    }
    
    // 교사인 경우: 초대받은 클래스도 접근 가능
    if (isTeacher()) {
        const invitedClasses = getInvitedClasses(userId);
        return invitedClasses.includes(classCode);
    }
    
    // 학생인 경우: 초대받은 클래스만 접근 가능
    if (userRole === 'student') {
        const invitedClasses = getInvitedClasses(userId);
        return invitedClasses.includes(classCode);
    }
    
    return false;
}

/**
 * 초대코드로 클래스 참여
 * @param {string} inviteCode - 초대코드 (클래스 코드)
 * @returns {Object} {success: boolean, message: string, classCode: string}
 */
function joinClassByInviteCode(inviteCode) {
    if (!inviteCode || inviteCode.trim() === '') {
        return {
            success: false,
            message: '초대코드를 입력해주세요.',
            classCode: null
        };
    }
    
    const classCode = inviteCode.trim().toUpperCase();
    
    // 클래스가 존재하는지 확인
    const classes = JSON.parse(localStorage.getItem('classes') || '{}');
    let classExists = false;
    let className = null;
    
    for (const [name, classData] of Object.entries(classes)) {
        if (classData.code === classCode) {
            classExists = true;
            className = name;
            break;
        }
    }
    
    if (!classExists) {
        return {
            success: false,
            message: '유효하지 않은 초대코드입니다.',
            classCode: null
        };
    }
    
    // 이미 참여한 클래스인지 확인
    const invitedClasses = getInvitedClasses();
    if (invitedClasses.includes(classCode)) {
        return {
            success: false,
            message: '이미 참여한 클래스입니다.',
            classCode: classCode
        };
    }
    
    // 초대 목록에 추가
    const added = addInvitedClass(classCode);
    
    if (added) {
        return {
            success: true,
            message: `${className} 클래스에 참여했습니다!`,
            classCode: classCode,
            className: className
        };
    } else {
        return {
            success: false,
            message: '클래스 참여에 실패했습니다.',
            classCode: null
        };
    }
}

// 전역으로 내보내기
if (typeof window !== 'undefined') {
    window.getCurrentUserId = getCurrentUserId;
    window.getCurrentUserRole = getCurrentUserRole;
    window.isTeacher = isTeacher;
    window.getClassOwner = getClassOwner;
    window.getInvitedClasses = getInvitedClasses;
    window.addInvitedClass = addInvitedClass;
    window.removeInvitedClass = removeInvitedClass;
    window.hasAccessToClass = hasAccessToClass;
    window.joinClassByInviteCode = joinClassByInviteCode;
}

