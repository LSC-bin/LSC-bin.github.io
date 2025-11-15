/**
 * 클래스별 스토리지 유틸리티
 * [ClassBoard Update] 모든 클래스 내부 기능이 클래스마다 독자적으로 동작하도록 보장
 * 
 * 이 파일은 모든 클래스 관련 데이터를 클래스별로 분리하여 저장/로드하는 유틸리티 함수를 제공합니다.
 * 
 * 사용 방법:
 * 1. localStorage.getItem() 대신 getClassStorage(key) 사용
 * 2. localStorage.setItem() 대신 setClassStorage(key, value) 사용
 * 3. 클래스별 스토리지 키가 필요한 경우 getClassStorageKey(baseKey) 사용
 */

/**
 * URL에서 클래스 코드 가져오기
 * @returns {string|null} URL 파라미터의 클래스 코드
 */
function getClassCodeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('class');
}

/**
 * URL에 클래스 코드 추가/업데이트
 * @param {string} classCode - 클래스 코드
 * @param {string} baseUrl - 기본 URL (없으면 현재 URL 사용)
 * @returns {string} 클래스 코드가 포함된 URL
 */
function addClassCodeToURL(classCode, baseUrl = null) {
    try {
        if (!classCode || classCode === 'default') {
            return baseUrl || window.location.href;
        }
        
        // file:// 프로토콜에서는 URL 객체 사용 불가, 상대 경로만 사용
        if (window.location.protocol === 'file:') {
            if (baseUrl) {
                // baseUrl이 상대 경로인 경우
                const separator = baseUrl.includes('?') ? '&' : '?';
                return `${baseUrl}${separator}class=${encodeURIComponent(classCode)}`;
            } else {
                // 현재 URL에 추가
                const currentHref = window.location.href;
                const separator = currentHref.includes('?') ? '&' : '?';
                return `${currentHref}${separator}class=${encodeURIComponent(classCode)}`;
            }
        }
        
        // HTTP/HTTPS 프로토콜
        const url = baseUrl || window.location.pathname + window.location.search;
        
        try {
            const urlObj = new URL(url, window.location.origin);
            
            // 기존 쿼리 파라미터 유지하면서 클래스 코드 추가
            if (baseUrl && baseUrl.includes('?')) {
                const existingParams = new URLSearchParams(baseUrl.split('?')[1]);
                existingParams.forEach((value, key) => {
                    urlObj.searchParams.set(key, value);
                });
            }
            urlObj.searchParams.set('class', classCode);
            
            return urlObj.toString();
        } catch (urlError) {
            // URL 객체 생성 실패 시 문자열 조작
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}class=${encodeURIComponent(classCode)}`;
        }
    } catch (error) {
        console.error('addClassCodeToURL 오류:', error);
        // 오류 발생 시 원본 URL 반환
        return baseUrl || window.location.href;
    }
}

/**
 * 현재 클래스 코드를 URL에 추가하여 페이지 이동
 * @param {string} url - 이동할 URL
 */
function navigateWithClassCode(url) {
    try {
        const classCode = getCurrentClassId();
        
        // file:// 프로토콜에서는 상대 경로만 사용
        if (window.location.protocol === 'file:') {
            if (classCode && classCode !== 'default') {
                const separator = url.includes('?') ? '&' : '?';
                window.location.href = `${url}${separator}class=${encodeURIComponent(classCode)}`;
            } else {
                window.location.href = url;
            }
            return;
        }
        
        // HTTP/HTTPS 프로토콜
        if (classCode && classCode !== 'default') {
            const urlWithClass = addClassCodeToURL(classCode, url);
            window.location.href = urlWithClass;
        } else {
            window.location.href = url;
        }
    } catch (error) {
        console.error('navigateWithClassCode 오류:', error);
        // 오류 발생 시 원본 URL로 이동
        window.location.href = url;
    }
}

/**
 * 현재 선택된 클래스 코드 가져오기 (URL 우선, localStorage 폴백)
 * @returns {string} 클래스 코드 (기본값: 'default')
 */
function getCurrentClassId() {
    try {
        // 1. URL에서 클래스 코드 가져오기 (최우선)
        const urlClassCode = getClassCodeFromURL();
        if (urlClassCode) {
            // 권한 확인
            if (typeof hasAccessToClass === 'function') {
                if (!hasAccessToClass(urlClassCode)) {
                    // 권한이 없으면 접근 차단
                    if (typeof showAlert === 'function') {
                        showAlert('이 클래스에 접근할 권한이 없습니다.', 'error').then(() => {
                            window.location.href = 'class-select.html';
                        });
                    } else {
                        alert('이 클래스에 접근할 권한이 없습니다.');
                        window.location.href = 'class-select.html';
                    }
                    return 'default';
                }
            }
            
            // URL에 클래스 코드가 있으면 localStorage에도 저장
            localStorage.setItem('selectedClassCode', urlClassCode);
            return urlClassCode;
        }
        
        // 2. localStorage에서 클래스 코드 가져오기
        const selectedClassCode = localStorage.getItem('selectedClassCode');
        if (selectedClassCode) {
            // localStorage에 있으면 URL에도 반영 (안전하게 처리)
            // DOM이 로드되고 HTTP/HTTPS 프로토콜일 때만 URL 업데이트
            if (window.location.pathname.endsWith('.html') && 
                (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
                try {
                    const newUrl = addClassCodeToURL(selectedClassCode);
                    if (newUrl && newUrl !== window.location.href) {
                        // DOM이 준비된 후에만 URL 업데이트
                        if (document.readyState === 'complete' || document.readyState === 'interactive') {
                            window.history.replaceState({}, '', newUrl);
                        } else {
                            // DOM이 준비되지 않았으면 나중에 업데이트
                            if (document.addEventListener) {
                                document.addEventListener('DOMContentLoaded', () => {
                                    try {
                                        const url = addClassCodeToURL(selectedClassCode);
                                        if (url && url !== window.location.href) {
                                            window.history.replaceState({}, '', url);
                                        }
                                    } catch (e) {
                                        // URL 업데이트 실패는 무시
                                    }
                                });
                            }
                        }
                    }
                } catch (e) {
                    // URL 업데이트 실패는 무시하고 계속 진행
                }
            }
            return selectedClassCode;
        }
        
        // 3. 하위 호환성: 기존 selectedClassId가 있으면 클래스 코드로 변환 시도
        const selectedClassId = localStorage.getItem('selectedClassId');
        if (selectedClassId) {
            // 클래스명으로 클래스 코드 찾기
            const selectedClass = localStorage.getItem('selectedClass');
            if (selectedClass) {
                const classCode = localStorage.getItem(`classCode_${selectedClass}`);
                if (classCode) {
                    // 마이그레이션: 클래스 코드 저장 및 URL 반영
                    localStorage.setItem('selectedClassCode', classCode);
                    // URL 업데이트는 안전하게 처리
                    if (window.location.pathname.endsWith('.html') && 
                        (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
                        try {
                            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                                const newUrl = addClassCodeToURL(classCode);
                                if (newUrl && newUrl !== window.location.href) {
                                    window.history.replaceState({}, '', newUrl);
                                }
                            }
                        } catch (e) {
                            // URL 업데이트 실패는 무시
                        }
                    }
                    return classCode;
                }
            }
        }
    } catch (error) {
        console.error('getCurrentClassId 오류:', error);
    }
    
    // 클래스가 선택되지 않았으면 기본값 반환
    console.warn('선택된 클래스 코드가 없습니다. 기본 클래스를 사용합니다.');
    return 'default';
}

/**
 * 클래스별 스토리지 키 생성 (클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키 (예: 'sessions', 'announcements')
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 * @returns {string} 클래스별 스토리지 키 (예: 'sessions_1H1B1234')
 */
function getClassStorageKey(baseKey, classCode = null) {
    const currentClassCode = classCode || getCurrentClassId();
    return `${baseKey}_${currentClassCode}`;
}

/**
 * 클래스별 데이터 가져오기 (클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키
 * @param {*} defaultValue - 기본값 (데이터가 없을 때 반환)
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 * @returns {*} 저장된 데이터 또는 기본값
 */
function getClassStorage(baseKey, defaultValue = null, classCode = null) {
    const storageKey = getClassStorageKey(baseKey, classCode);
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored === null) {
            return defaultValue;
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error(`클래스별 데이터 로드 실패 (${storageKey}):`, error);
        return defaultValue;
    }
}

/**
 * 클래스별 데이터 저장하기 (클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키
 * @param {*} value - 저장할 데이터
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 */
function setClassStorage(baseKey, value, classCode = null) {
    const storageKey = getClassStorageKey(baseKey, classCode);
    try {
        localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
        console.error(`클래스별 데이터 저장 실패 (${storageKey}):`, error);
    }
}

/**
 * 클래스별 데이터 삭제하기 (클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 */
function removeClassStorage(baseKey, classCode = null) {
    const storageKey = getClassStorageKey(baseKey, classCode);
    localStorage.removeItem(storageKey);
}

/**
 * 세션별 클래스 데이터 키 생성 (세션 ID 포함, 클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키 (예: 'session_posts')
 * @param {string} sessionId - 세션 ID
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 * @returns {string} 세션별 클래스 스토리지 키 (예: 'session_posts_1H1B1234_session123')
 */
function getSessionClassStorageKey(baseKey, sessionId, classCode = null) {
    const currentClassCode = classCode || getCurrentClassId();
    return `${baseKey}_${currentClassCode}_${sessionId}`;
}

/**
 * 세션별 클래스 데이터 가져오기 (클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키
 * @param {string} sessionId - 세션 ID
 * @param {*} defaultValue - 기본값
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 * @returns {*} 저장된 데이터 또는 기본값
 */
function getSessionClassStorage(baseKey, sessionId, defaultValue = null, classCode = null) {
    const storageKey = getSessionClassStorageKey(baseKey, sessionId, classCode);
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored === null) {
            return defaultValue;
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error(`세션별 클래스 데이터 로드 실패 (${storageKey}):`, error);
        return defaultValue;
    }
}

/**
 * 세션별 클래스 데이터 저장하기 (클래스 코드 기반)
 * @param {string} baseKey - 기본 스토리지 키
 * @param {string} sessionId - 세션 ID
 * @param {*} value - 저장할 데이터
 * @param {string|null} classCode - 클래스 코드 (null이면 현재 선택된 클래스 사용)
 */
function setSessionClassStorage(baseKey, sessionId, value, classCode = null) {
    const storageKey = getSessionClassStorageKey(baseKey, sessionId, classCode);
    try {
        localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
        console.error(`세션별 클래스 데이터 저장 실패 (${storageKey}):`, error);
    }
}

/**
 * 클래스 삭제 시 모든 관련 데이터 삭제 (클래스 코드 기반)
 * @param {string} classCode - 삭제할 클래스 코드
 */
function deleteAllClassData(classCode) {
    if (!classCode) {
        console.error('클래스 코드가 필요합니다.');
        return;
    }

    // 삭제할 키 패턴 목록 (모든 클래스별 데이터 포함)
    const keyPatterns = [
        `announcements_${classCode}`,                           // 공지사항
        `sessions_${classCode}`,                                // 세션 목록
        `activity_posts_${classCode}`,                         // Activity 게시글
        `ask_posts_${classCode}`,                              // Ask 게시글
        `activity_memos_${classCode}_`,                         // Activity 메모 (세션별)
        `assignment_${classCode}_`,                            // 과제 (세션별)
        `session_posts_${classCode}_`,                         // 세션별 게시글
        `session_messages_${classCode}_`,                      // 세션별 채팅 메시지
        `session_questions_${classCode}_`,                      // 세션별 질문
        `session_quizzes_${classCode}_`,                        // 세션별 퀴즈
        `session_quiz_results_${classCode}_`,                   // 세션별 퀴즈 결과
        `classboard-widget-preferences-v1_${classCode}`,        // 위젯 설정
        `classboard-sidebar-menu-preferences-v1_${classCode}`, // 사이드바 메뉴 설정
    ];

    // localStorage의 모든 키 확인
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            // 패턴에 맞는 키 찾기
            for (const pattern of keyPatterns) {
                if (key.startsWith(pattern)) {
                    keysToDelete.push(key);
                    break;
                }
            }
        }
    }

    // 키 삭제
    keysToDelete.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log(`클래스 코드 ${classCode}의 모든 데이터가 삭제되었습니다. (${keysToDelete.length}개 키)`);
}

// 전역으로 내보내기 (모든 파일에서 사용 가능)
if (typeof window !== 'undefined') {
    window.getClassStorage = getClassStorage;
    window.setClassStorage = setClassStorage;
    window.removeClassStorage = removeClassStorage;
    window.getCurrentClassId = getCurrentClassId;
    window.getClassStorageKey = getClassStorageKey;
    window.getSessionClassStorageKey = getSessionClassStorageKey;
    window.getSessionClassStorage = getSessionClassStorage;
    window.setSessionClassStorage = setSessionClassStorage;
    window.deleteAllClassData = deleteAllClassData;
    window.getClassCodeFromURL = getClassCodeFromURL;
    window.addClassCodeToURL = addClassCodeToURL;
    window.navigateWithClassCode = navigateWithClassCode;
}

