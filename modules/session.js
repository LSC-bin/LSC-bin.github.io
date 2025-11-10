/**
 * session.js
 * AI ClassBoard - Session 페이지 통합 로직
 * Activity + Ask 통합 UI 리디자인
 */

import { AppUtils } from '@utils/app-utils.js';

const AuthServiceRef = window.AuthService || {};
const AppUtilsRef = window.AppUtils || AppUtils;
const {
    escapeHtml: escapeHtmlUtil = AppUtils.escapeHtml,
    getTimeAgo: getTimeAgoUtil = AppUtils.getTimeAgo,
    generateId: generateIdUtil = AppUtils.generateId,
    getStoredData: getStoredDataUtil = AppUtils.getStoredData,
    setStoredData: setStoredDataUtil = AppUtils.setStoredData
} = AppUtilsRef;

const escapeHtml = (text) => escapeHtmlUtil(text);
const getTimeAgo = (date) => getTimeAgoUtil(date);
const generateId = (prefix) => generateIdUtil(prefix);
const getStoredData = (key, fallback) => (typeof getStoredDataUtil === 'function' ? getStoredDataUtil(key, fallback) : fallback);
const setStoredData = (key, value) => (typeof setStoredDataUtil === 'function' ? setStoredDataUtil(key, value) : undefined);

// 전역 변수
let questions = [];
let chatMessages = [];
let materials = [];

// 현재 사용자 정보
let currentUser = {
    id: generateId('user'),
    name: '학생' + Math.floor(Math.random() * 100)
};

/**
 * 초기화 함수
 */
document.addEventListener('DOMContentLoaded', () => {
    initSessionModule();
});

async function initSessionModule() {
    if (typeof initApp === 'function') {
        try {
            const user = await initApp();
            if (user) {
                currentUser = {
                    id: user.id || generateId('user'),
                    name: user.name || currentUser.name
                };
            }
        } catch (error) {
            console.warn('[session] 세션 초기화에 실패했습니다:', error);
            return;
        }
    } else if (typeof AuthServiceRef.getCurrentUser === 'function') {
        const user = AuthServiceRef.getCurrentUser();
        if (user) {
            currentUser = {
                id: user.id || generateId('user'),
                name: user.name || currentUser.name
            };
        }
    }

    // sessionId 가져오기 (session-detail.js와 연동)
    const sessionId = getCurrentSessionId();

    if (!sessionId) {
        // session-detail.js가 로드되기 전일 수 있으므로 직접 확인
        const urlParams = new URLSearchParams(window.location.search);
        const urlSessionId = urlParams.get('sessionId');
        if (!urlSessionId) {
            console.warn('sessionId를 찾을 수 없습니다. session-detail.js 로드 후 초기화됩니다.');
            return;
        }
        // 초기화는 session-detail.js에서 호출됨
        return;
    }

    // 질문 폼 이벤트 (sessionId는 함수 내에서 가져옴)
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sessionId = getCurrentSessionId();
            if (sessionId) {
                handleQuestionSubmit(sessionId);
            }
        });
    }

    // 채팅 전송 이벤트 (sessionId는 함수 내에서 가져옴)
    const sendChatBtn = document.getElementById('sendChat');
    const chatInput = document.getElementById('chatInput');
    
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', () => {
            const sessionId = getCurrentSessionId();
            if (sessionId) {
                handleChatSend(sessionId);
            }
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const sessionId = getCurrentSessionId();
                if (sessionId) {
                    handleChatSend(sessionId);
                }
            }
        });
    }

    // 자료 업로드 이벤트
    const uploadMaterialBtn = document.getElementById('upload-material-btn');
    const materialUploadModal = document.getElementById('material-upload-modal');
    const closeMaterialModal = document.getElementById('close-material-modal');
    const cancelMaterial = document.getElementById('cancel-material');
    const submitMaterial = document.getElementById('submit-material');

    if (uploadMaterialBtn) {
        uploadMaterialBtn.addEventListener('click', () => {
            if (materialUploadModal) {
                materialUploadModal.classList.add('active');
            }
        });
    }

    if (closeMaterialModal) {
        closeMaterialModal.addEventListener('click', () => {
            closeMaterialModalFunc();
        });
    }

    if (cancelMaterial) {
        cancelMaterial.addEventListener('click', () => {
            closeMaterialModalFunc();
        });
    }

    if (submitMaterial) {
        submitMaterial.addEventListener('click', () => {
            const sessionId = getCurrentSessionId();
            if (sessionId) {
                handleMaterialUpload(sessionId);
            }
        });
    }

    // 모달 외부 클릭 시 닫기
    if (materialUploadModal) {
        materialUploadModal.addEventListener('click', (e) => {
            if (e.target === materialUploadModal) {
                closeMaterialModalFunc();
            }
        });
    }
}

/**
 * 질문 제출 처리
 */
function handleQuestionSubmit(sessionId) {
    if (!sessionId) {
        sessionId = getCurrentSessionId();
    }
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    const questionInput = document.getElementById('questionInput');
    if (!questionInput) return;

    const questionText = questionInput.value.trim();
    if (!questionText) return;

    const question = {
        id: generateId('q'),
        text: questionText,
        author: currentUser.name,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        answers: []
    };

    questions.push(question);
    saveQuestionsForSession(sessionId);
    renderQuestions();
    
    questionInput.value = '';

    // 토스트 메시지
    if (typeof showToast === 'function') {
        showToast('질문이 등록되었습니다.', 'success');
    }
}

/**
 * 질문 목록 렌더링
 */
function renderQuestions() {
    const questionList = document.getElementById('questionList');
    if (!questionList) return;

    if (questions.length === 0) {
        questionList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <i class="bx bx-question-mark" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                <p>아직 등록된 질문이 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">질문을 입력하여 시작하세요!</p>
            </div>
        `;
        return;
    }

    // 최신순 정렬
    const sortedQuestions = [...questions].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    questionList.innerHTML = sortedQuestions.map(question => {
        const timeAgo = getTimeAgo(question.createdAt);
        const sessionId = getCurrentSessionId();
        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-item-header">
                    <span class="question-author">${escapeHtml(question.author)}</span>
                    <span class="question-time">${timeAgo}</span>
                </div>
                <div class="question-content">${escapeHtml(question.text)}</div>
                <div class="question-stats">
                    <span onclick="upvoteQuestion('${question.id}')" style="cursor: pointer;">
                        <i class="bx bx-upvote"></i> ${question.upvotes || 0}
                    </span>
                    <span>
                        <i class="bx bx-message"></i> ${question.answers ? question.answers.length : 0}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    // WordCloud 업데이트
    if (typeof renderWordCloud === 'function') {
        renderWordCloud();
    }
}

/**
 * 질문 좋아요 처리
 */
function upvoteQuestion(questionId) {
    const sessionId = getCurrentSessionId();
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    question.upvotes = (question.upvotes || 0) + 1;
    saveQuestionsForSession(sessionId);
    renderQuestions();
}

/**
 * 채팅 전송 처리
 */
function handleChatSend(sessionId) {
    if (!sessionId) {
        sessionId = getCurrentSessionId();
    }
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;

    const messageText = chatInput.value.trim();
    if (!messageText) return;

    const message = {
        id: generateId('msg'),
        text: messageText,
        author: currentUser.name,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        type: 'text'
    };

    chatMessages.push(message);
    saveChatMessagesForSession(sessionId);
    renderChatMessages();
    
    chatInput.value = '';

    // 스크롤 맨 아래로
    const chatWindow = document.getElementById('chatMessages');
    if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

/**
 * 채팅 메시지 렌더링
 */
function renderChatMessages() {
    const chatMessagesEl = document.getElementById('chatMessages');
    if (!chatMessagesEl) return;

    if (chatMessages.length === 0) {
        chatMessagesEl.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <i class="bx bxs-chat" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                <p>아직 메시지가 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">첫 메시지를 보내보세요!</p>
            </div>
        `;
        return;
    }

    chatMessagesEl.innerHTML = chatMessages.map(message => {
        const timeAgo = getTimeAgo(message.createdAt);
        const isOwn = message.authorId === currentUser.id;
        return `
            <div class="chat-bubble ${isOwn ? '' : 'other'}">
                ${!isOwn ? `<div class="chat-bubble-header">${escapeHtml(message.author)}</div>` : ''}
                <div>${escapeHtml(message.text)}</div>
                <div class="chat-bubble-time">${timeAgo}</div>
            </div>
        `;
    }).join('');

    // 스크롤 맨 아래로
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

/**
 * 자료 업로드 처리
 */
function handleMaterialUpload(sessionId) {
    if (!sessionId) {
        sessionId = getCurrentSessionId();
    }
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    const materialTitle = document.getElementById('material-title');
    const materialFile = document.getElementById('material-file');
    const materialDescription = document.getElementById('material-description');

    if (!materialTitle || !materialFile) return;

    const title = materialTitle.value.trim();
    const files = materialFile.files;

    if (!title || files.length === 0) {
        alert('제목과 파일을 입력해주세요.');
        return;
    }

    // 파일 정보 저장 (실제 업로드는 Firebase 연동 시)
    Array.from(files).forEach(file => {
        const material = {
            id: generateId('mat'),
            title: title || file.name,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            description: materialDescription ? materialDescription.value.trim() : '',
            uploadedBy: currentUser.name,
            uploadedAt: new Date().toISOString(),
            downloadUrl: '' // Firebase 연동 시 실제 URL
        };

        materials.push(material);
    });

    saveMaterialsForSession(sessionId);
    renderMaterials();
    closeMaterialModalFunc();

    // 폼 초기화
    materialTitle.value = '';
    materialFile.value = '';
    if (materialDescription) {
        materialDescription.value = '';
    }

    // 토스트 메시지
    if (typeof showToast === 'function') {
        showToast('자료가 업로드되었습니다.', 'success');
    }
}

/**
 * 자료 목록 렌더링
 */
function renderMaterials() {
    const materialsGrid = document.getElementById('materials-grid');
    if (!materialsGrid) return;

    if (materials.length === 0) {
        materialsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #999;">
                <i class="bx bx-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                <p>업로드된 자료가 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">자료 업로드 버튼을 클릭하여 자료를 추가해보세요!</p>
            </div>
        `;
        return;
    }

    materialsGrid.innerHTML = materials.map(material => {
        const timeAgo = getTimeAgo(material.uploadedAt);
        const fileIcon = getFileIcon(material.fileType);
        return `
            <div class="material-card" data-material-id="${material.id}">
                <div class="material-icon" style="background: ${getFileColor(material.fileType)};">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="material-title">${escapeHtml(material.title)}</div>
                ${material.description ? `<div class="material-description">${escapeHtml(material.description)}</div>` : ''}
                <div class="material-meta">
                    <span>${escapeHtml(material.uploadedBy)}</span>
                    <span>${timeAgo}</span>
                </div>
                <div class="material-actions">
                    <button class="btn-download" onclick="downloadMaterial('${material.id}')">
                        <i class="bx bx-download"></i> 다운로드
                    </button>
                    ${material.uploadedBy === currentUser.name ? `
                        <button class="btn-delete-material" onclick="deleteMaterial('${material.id}')">
                            <i class="bx bx-trash"></i> 삭제
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 자료 다운로드
 */
function downloadMaterial(materialId) {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    if (material.downloadUrl) {
        window.open(material.downloadUrl, '_blank');
    } else {
        // 로컬 파일 다운로드 (실제로는 Firebase Storage URL 필요)
        alert('다운로드 기능은 Firebase 연동 후 사용 가능합니다.');
    }
}

/**
 * 자료 삭제
 */
function deleteMaterial(materialId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const sessionId = getCurrentSessionId();
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    materials = materials.filter(m => m.id !== materialId);
    saveMaterialsForSession(sessionId);
    renderMaterials();

    if (typeof showToast === 'function') {
        showToast('자료가 삭제되었습니다.', 'success');
    }
}

/**
 * 자료 모달 닫기
 */
function closeMaterialModalFunc() {
    const materialUploadModal = document.getElementById('material-upload-modal');
    if (materialUploadModal) {
        materialUploadModal.classList.remove('active');
    }
}

/**
 * 세션 데이터 저장/로드 함수들
 */
function loadQuestionsForSession(sessionId) {
    if (!sessionId) return;
    questions = getStoredData(`session_questions_${sessionId}`, []);
    renderQuestions();
}

function saveQuestionsForSession(sessionId) {
    if (!sessionId) return;
    setStoredData(`session_questions_${sessionId}`, questions);
}

function loadChatMessagesForSession(sessionId) {
    if (!sessionId) return;
    chatMessages = getStoredData(`session_chat_${sessionId}`, []);
    renderChatMessages();
}

function saveChatMessagesForSession(sessionId) {
    if (!sessionId) return;
    setStoredData(`session_chat_${sessionId}`, chatMessages);
}

function loadMaterialsForSession(sessionId) {
    if (!sessionId) return;
    materials = getStoredData(`session_materials_${sessionId}`, []);
    renderMaterials();
}

function saveMaterialsForSession(sessionId) {
    if (!sessionId) return;
    setStoredData(`session_materials_${sessionId}`, materials);
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'bx bxs-image';
    if (fileType.startsWith('video/')) return 'bx bxs-video';
    if (fileType.includes('pdf')) return 'bx bxs-file-pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'bx bxs-file-doc';
    if (fileType.includes('excel') || fileType.includes('xls')) return 'bx bxs-file';
    return 'bx bxs-file';
}

function getFileColor(fileType) {
    if (fileType.startsWith('image/')) return '#4CAF50';
    if (fileType.startsWith('video/')) return '#F44336';
    if (fileType.includes('pdf')) return '#E91E63';
    if (fileType.includes('word') || fileType.includes('doc')) return '#2196F3';
    if (fileType.includes('excel') || fileType.includes('xls')) return '#4CAF50';
    return '#3C91E6';
}

/**
 * sessionId 가져오기 (session-detail.js와 연동)
 */
function getCurrentSessionId() {
    // session-detail.js의 getCurrentSessionId 함수 사용
    if (typeof getCurrentSessionId === 'function' && this !== window) {
        return getCurrentSessionId();
    }
    // 전역 함수 확인
    if (typeof window.getCurrentSessionId === 'function') {
        return window.getCurrentSessionId();
    }
    // URL에서 직접 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('sessionId');
}

/**
 * Materials 탭 초기화 (session-detail.js에서 호출)
 */
function initMaterialsForSession(sessionId, readOnlyMode = false) {
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    loadMaterialsForSession(sessionId);

    // 읽기 전용 모드 처리
    if (readOnlyMode) {
        const uploadBtn = document.getElementById('upload-material-btn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.style.opacity = '0.6';
            uploadBtn.style.cursor = 'not-allowed';
        }

        const deleteBtns = document.querySelectorAll('.btn-delete-material');
        deleteBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });
    }
}

// 전역 함수로 등록 (HTML에서 직접 호출 가능하도록)
window.upvoteQuestion = upvoteQuestion;
window.downloadMaterial = downloadMaterial;
window.deleteMaterial = deleteMaterial;

