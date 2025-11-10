/**
 * activity-session.js
 * [ClassBoard Update] 공유 메모보드 기능
 * Firebase 구조 고려, 현재는 localStorage 기반
 */

import { AppUtils } from '@utils/app-utils.js';

const AppUtilsRef = (typeof window !== 'undefined' && window.AppUtils) ? window.AppUtils : AppUtils;
const {
    escapeHtml: escapeHtmlUtil = AppUtils.escapeHtml,
    formatDate: formatDateUtil = AppUtils.formatDate,
    getTimeAgo: getTimeAgoUtil = AppUtils.getTimeAgo,
    generateId: generateIdUtil = AppUtils.generateId,
    getStoredArray: getStoredArrayUtil = AppUtils.getStoredArray,
    setStoredArray: setStoredArrayUtil = AppUtils.setStoredArray,
    getStoredData: getStoredDataUtil = AppUtils.getStoredData,
    setStoredData: setStoredDataUtil = AppUtils.setStoredData
} = AppUtilsRef;

const escapeHtml = (text) => escapeHtmlUtil(text);
const formatDateFromUtils = (date, options) => formatDateUtil(date, options);
const getTimeAgoFromUtils = (date) => getTimeAgoUtil(date);
const generateId = (prefix) => generateIdUtil(prefix);
const getStoredArray = (key, fallback = []) => getStoredArrayUtil(key, fallback);
const setStoredArray = (key, value) => setStoredArrayUtil(key, value);
const getStoredData = (key, fallback) => getStoredDataUtil(key, fallback);
const setStoredData = (key, value) => setStoredDataUtil(key, value);

// 전역 변수
const memoBoard = document.getElementById("memoBoard");
const addMemoBtn = document.getElementById("addMemo");
let memos = [];
let currentSessionId = null;
let searchQuery = '';
let sortType = 'newest';
let filteredMemos = [];
let masonryInstance = null;
let currentEditingMemoIndex = null;

// 현재 사용자 정보
const currentUser = {
    id: localStorage.getItem('userId') || generateId('user'),
    name: localStorage.getItem('userName') || '학생' + Math.floor(Math.random() * 100)
};

// 관리자 여부 확인
function isAdmin() {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'admin' || userRole === 'teacher';
}

// 포스트잇 색상 팔레트 (연한 톤)
const memoColors = [
    '#FFF9C4', // 연한 노란색
    '#FCE4EC', // 연한 분홍색
    '#E1F5FE', // 연한 하늘색
    '#E8F5E9', // 연한 연두색
    '#FFF3E0', // 연한 주황색
    '#F3E5F5', // 연한 보라색
    '#FFE0B2', // 연한 살구색
    '#F1F8E9'  // 연한 라임그린
];

/**
 * 초기화
 */
function initActivitySession() {
    // URL에서 sessionId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('sessionId');
    
    if (!currentSessionId) {
        console.error('sessionId가 필요합니다.');
        showAlert('세션 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    // 세션 제목 로드
    loadSessionTitle(currentSessionId);

    // 메모 로드
    loadMemos();

    // 과제 로드
    loadAssignment();

    // 이벤트 리스너 등록
    setupEventListeners();

    // 프로필 정보 로드
    loadProfileInfo();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    if (addMemoBtn) {
        addMemoBtn.addEventListener('click', openMemoModal);
    }

    // 모달 이벤트
    const memoModal = document.getElementById('memo-modal');
    const closeModalBtn = document.getElementById('close-memo-modal');
    const cancelBtn = document.getElementById('cancel-memo');
    const submitBtn = document.getElementById('submit-memo');
    const memoFileInput = document.getElementById('memo-file');
    
    // 메모 상세보기 모달 이벤트
    const memoViewModal = document.getElementById('memo-view-modal');
    const closeViewModalBtn = document.getElementById('close-memo-view-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeMemoModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeMemoModal);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', submitMemoFromModal);
    }

    // 모달 외부 클릭 시 닫기
    if (memoModal) {
        memoModal.addEventListener('click', (e) => {
            if (e.target === memoModal) {
                closeMemoModal();
            }
        });
    }

    // 파일 선택 이벤트
    if (memoFileInput) {
        memoFileInput.addEventListener('change', handleFileSelect);
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && memoModal && memoModal.style.display === 'flex') {
            closeMemoModal();
        }
        if (e.key === 'Escape' && memoViewModal && memoViewModal.style.display !== 'none') {
            closeMemoViewModal();
        }
    });
    
    // 상세보기 모달 닫기 버튼
    if (closeViewModalBtn) {
        closeViewModalBtn.addEventListener('click', closeMemoViewModal);
    }
    
    // 상세보기 모달 외부 클릭 시 닫기
    if (memoViewModal) {
        memoViewModal.addEventListener('click', (e) => {
            if (e.target === memoViewModal) {
                closeMemoViewModal();
            }
        });
    }
    
    // 상세보기 모달 수정/저장/취소/삭제 버튼
    const viewEditBtn = document.getElementById('view-edit-btn');
    const viewSaveBtn = document.getElementById('view-save-btn');
    const viewCancelBtn = document.getElementById('view-cancel-btn');
    const viewDeleteBtn = document.getElementById('view-delete-btn');
    
    if (viewEditBtn) {
        viewEditBtn.addEventListener('click', openMemoEditMode);
    }
    
    if (viewSaveBtn) {
        viewSaveBtn.addEventListener('click', saveMemoFromViewModal);
    }
    
    if (viewCancelBtn) {
        viewCancelBtn.addEventListener('click', closeMemoEditMode);
    }
    
    // 수정 모달의 파일 선택 이벤트
    const viewEditFileInput = document.getElementById('view-edit-file');
    if (viewEditFileInput) {
        viewEditFileInput.addEventListener('change', handleViewEditFileSelect);
    }
    
    if (viewDeleteBtn) {
        viewDeleteBtn.addEventListener('click', () => {
            if (currentEditingMemoIndex !== null) {
                showConfirm('이 메모를 삭제하시겠습니까?', 'warning').then(confirmed => {
                    if (confirmed) {
                        memos.splice(currentEditingMemoIndex, 1);
                        saveMemos();
                        filterAndRenderMemos();
                        closeMemoViewModal();
                        
                        if (typeof showToast === 'function') {
                            showToast('메모가 삭제되었습니다.', 'success');
                        } else {
                            showAlert('메모가 삭제되었습니다.', 'success');
                        }
                    }
                });
            }
        });
    }

    // 검색 기능
    const searchInput = document.getElementById('memo-search');
    const clearSearchBtn = document.getElementById('clear-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            if (searchQuery) {
                clearSearchBtn.style.display = 'flex';
            } else {
                clearSearchBtn.style.display = 'none';
            }
            filterAndRenderMemos();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            filterAndRenderMemos();
        });
    }

    // 정렬 기능
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            sortType = e.target.value;
            filterAndRenderMemos();
        });
    }

    // 과제 편집 버튼
    const editAssignmentBtn = document.getElementById('edit-assignment-btn');
    if (editAssignmentBtn) {
        editAssignmentBtn.addEventListener('click', openAssignmentModal);
    }

    // 과제 모달 이벤트
    const assignmentModal = document.getElementById('assignment-modal');
    const closeAssignmentModalBtn = document.getElementById('close-assignment-modal');
    const cancelAssignmentBtn = document.getElementById('cancel-assignment');
    const saveAssignmentBtn = document.getElementById('save-assignment');
    const assignmentFileInput = document.getElementById('assignment-file-input');

    if (closeAssignmentModalBtn) {
        closeAssignmentModalBtn.addEventListener('click', closeAssignmentModal);
    }

    if (cancelAssignmentBtn) {
        cancelAssignmentBtn.addEventListener('click', closeAssignmentModal);
    }

    if (saveAssignmentBtn) {
        saveAssignmentBtn.addEventListener('click', saveAssignmentFromModal);
    }

    if (assignmentFileInput) {
        assignmentFileInput.addEventListener('change', handleAssignmentFileSelect);
    }

    // 과제 모달 외부 클릭 시 닫기
    if (assignmentModal) {
        assignmentModal.addEventListener('click', (e) => {
            if (e.target === assignmentModal) {
                closeAssignmentModal();
            }
        });
    }

    // ESC 키로 과제 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && assignmentModal && assignmentModal.style.display === 'flex') {
            closeAssignmentModal();
        }
    });

    // 과제 카드 더블클릭 이벤트
    const assignmentCard = document.querySelector('.assignment-card');
    if (assignmentCard) {
        assignmentCard.addEventListener('dblclick', (e) => {
            // 편집 버튼 클릭은 무시
            if (e.target.closest('.btn-edit-assignment')) {
                return;
            }
            // 과제가 있는 경우에만 모달 열기
            if (assignmentData && (assignmentData.title || assignmentData.text)) {
                openAssignmentViewModal();
            }
        });
    }

    // 과제 상세보기 모달 닫기 이벤트
    const assignmentViewModal = document.getElementById('assignment-view-modal');
    const closeAssignmentViewModalBtn = document.getElementById('close-assignment-view-modal');
    
    if (closeAssignmentViewModalBtn) {
        closeAssignmentViewModalBtn.addEventListener('click', closeAssignmentViewModal);
    }
    
    if (assignmentViewModal) {
        assignmentViewModal.addEventListener('click', (e) => {
            if (e.target === assignmentViewModal) {
                closeAssignmentViewModal();
            }
        });
    }

    // ESC 키로 과제 상세보기 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && assignmentViewModal && assignmentViewModal.style.display === 'flex') {
            closeAssignmentViewModal();
        }
    });
}

/**
 * 세션 제목 로드
 */
function loadSessionTitle(sessionId) {
    const sessions = getStoredArray('sessions');
    const session = sessions.find(s => s.id === sessionId);
    
    const titleElement = document.getElementById('session-title');
    if (titleElement && session) {
        titleElement.textContent = session.title + ' - 공유 메모보드';
    }
}

/**
 * 메모 로드
 */
function loadMemos() {
    if (!currentSessionId) return;

    const storageKey = `activity_memos_${currentSessionId}`;
    const stored = getStoredData(storageKey, null);

    if (Array.isArray(stored)) {
        memos = stored;
    } else {
        // 더미 데이터 (첫 로드 시)
        memos = [
            {
                id: 'memo_dummy_1',
                text: '오늘 배운 내용을 공유합니다!\n주요 포인트:\n- 디지털 윤리\n- AI의 미래\n- 협업의 중요성',
                author: '학생A',
                authorId: 'student_1',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: 'memo_dummy_2',
                text: '질문이 있어서 메모합니다. 데이터 프라이버시와 보안에 대해 더 자세히 알고 싶어요.',
                author: '학생B',
                authorId: 'student_2',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
            {
                id: 'memo_dummy_3',
                text: '프로젝트 아이디어를 제안합니다!',
                author: currentUser.name,
                authorId: currentUser.id,
                createdAt: new Date(Date.now() - 10800000).toISOString(),
            }
        ];
        saveMemos();
    }

    filterAndRenderMemos();
}

/**
 * 메모 필터링 및 렌더링
 */
function filterAndRenderMemos() {
    // 검색 필터링
    if (searchQuery) {
        filteredMemos = memos.filter(memo => 
            memo.text.toLowerCase().includes(searchQuery) ||
            memo.author.toLowerCase().includes(searchQuery)
        );
    } else {
        filteredMemos = [...memos];
    }

    // 정렬
    switch (sortType) {
        case 'newest':
            filteredMemos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            filteredMemos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'author':
            filteredMemos.sort((a, b) => a.author.localeCompare(b.author));
            break;
    }

    // 통계 업데이트
    updateStats();

    // 렌더링
    renderMemos();
}

/**
 * 메모 렌더링
 */
function renderMemos() {
    if (!memoBoard) return;

    if (filteredMemos.length === 0) {
        memoBoard.className = 'memo-board empty-state';
        memoBoard.innerHTML = `
            <i class="bx bx-note"></i>
            <p>${searchQuery ? '검색 결과가 없습니다' : '아직 메모가 없습니다'}</p>
            <p style="font-size: 0.9rem;">${searchQuery ? '다른 키워드로 검색해보세요' : '위의 "+ 새 메모" 버튼을 클릭하여 메모를 추가해보세요!'}</p>
        `;
        return;
    }

    memoBoard.className = 'memo-board';
    memoBoard.innerHTML = "";

    filteredMemos.forEach((memo, i) => {
        const originalIndex = memos.findIndex(m => m.id === memo.id);
        const card = document.createElement('div');
        card.className = 'memo-card';
        
        // 배경색 설정 (포스트잇 느낌)
        // 메모에 저장된 색상이 있으면 사용하고, 없으면 메모 ID를 기반으로 고정 색상 할당
        let bgColor = memo.bgColor;
        if (!bgColor) {
            // 메모 ID를 해시하여 고정된 색상 인덱스 생성
            let hash = 0;
            for (let j = 0; j < memo.id.length; j++) {
                hash = ((hash << 5) - hash) + memo.id.charCodeAt(j);
                hash = hash & hash; // Convert to 32-bit integer
            }
            const colorIndex = Math.abs(hash) % memoColors.length;
            bgColor = memoColors[colorIndex];
            // 메모에 색상 저장 (다음 렌더링 시 사용)
            memo.bgColor = bgColor;
        }
        card.style.backgroundColor = bgColor;
        card.style.borderLeft = 'none';
        
        card.dataset.index = originalIndex;
        card.dataset.memoId = memo.id;
        
        const authorFirstLetter = memo.author.charAt(0).toUpperCase();
        const authorColor = getAuthorColor(memo.authorId);
        
        // 제목 표시
        const titleText = memo.title ? escapeHtml(memo.title) : '';
        const titleHtml = titleText ? `<div class="memo-title" title="${titleText}">${titleText}</div>` : '';
        
        // 이미지/파일 분리
        const images = [];
        const files = [];
        if (memo.files && memo.files.length > 0) {
            memo.files.forEach(file => {
                if (file.type && file.type.startsWith('image/')) {
                    images.push(file);
                } else {
                    files.push(file);
                }
            });
        }
        
        // 이미지 표시 (제목과 텍스트 사이)
        const imagesHtml = images.length > 0
            ? `<div class="memo-images">
                ${images.map(file => `
                    <img src="${file.url || file.name}" alt="${escapeHtml(file.name)}" onclick="window.open('${file.url || file.name}', '_blank')" style="width: 100%; height: auto; border-radius: 8px; cursor: pointer;" />
                `).join('')}
               </div>`
            : '';
        
        // 파일 표시
        const filesHtml = files.length > 0 
            ? `<div class="memo-files">
                ${files.map(file => `
                    <div class="memo-file-item">
                        <i class="bx bx-file"></i>
                        <span>${escapeHtml(file.name)}</span>
                    </div>
                `).join('')}
               </div>`
            : '';
        
        // 내용 표시 (전체 내용 표시)
        const contentText = escapeHtml(memo.text);
        
        card.innerHTML = `
            ${titleHtml}
            ${imagesHtml}
            <div class="memo-content">${contentText}</div>
            ${filesHtml}
            <div class="controls">
                <span class="date">
                    <i class="bx bx-time-five"></i>
                    ${formatDate(memo.createdAt)}
                </span>
                <div class="author-info">
                    <span class="author-avatar" style="background: ${authorColor};">
                        ${authorFirstLetter}
                    </span>
                    <span class="author">${escapeHtml(memo.author)}</span>
                </div>
            </div>
        `;
        
        memoBoard.appendChild(card);
    });

    // 이벤트 리스너 연결
    attachListeners();
    
    // Masonry 레이아웃 초기화/업데이트
    initMasonry();
}

/**
 * 이벤트 리스너 연결
 */
function attachListeners() {
    // 메모 카드 더블클릭 이벤트 추가
    document.querySelectorAll('.memo-card').forEach(card => {
        card.addEventListener('dblclick', function(e) {
            const index = parseInt(this.dataset.index);
            if (!isNaN(index) && index >= 0 && index < memos.length) {
                openMemoViewModal(memos[index]);
            }
        });
        
        // 더블클릭 가능 표시를 위한 커서 스타일
        card.style.cursor = 'pointer';
    });
}

/**
 * Masonry 레이아웃 초기화
 */
function initMasonry() {
    if (typeof Masonry === 'undefined') {
        console.warn('Masonry.js가 로드되지 않았습니다.');
        return;
    }
    
    // 이전 인스턴스가 있으면 제거
    if (masonryInstance) {
        masonryInstance.destroy();
    }
    
    // 새 인스턴스 생성
    if (memoBoard && !memoBoard.classList.contains('empty-state')) {
        masonryInstance = new Masonry(memoBoard, {
            itemSelector: '.memo-card',
            columnWidth: '.memo-card',
            percentPosition: true,
            gutter: 20
        });
    }
}

/**
 * 통계 업데이트
 */
function updateStats() {
    // 총 메모 수
    const totalMemosEl = document.getElementById('total-memos');
    if (totalMemosEl) {
        totalMemosEl.textContent = memos.length;
    }

    // 작성자 수
    const uniqueAuthors = new Set(memos.map(m => m.authorId));
    const totalAuthorsEl = document.getElementById('total-authors');
    if (totalAuthorsEl) {
        totalAuthorsEl.textContent = uniqueAuthors.size;
    }
}

/**
 * 작성자 색상 가져오기
 */
function getAuthorColor(authorId) {
    const authors = [...new Set(memos.map(m => m.authorId))];
    const authorIndex = authors.indexOf(authorId);
    return memoColors[authorIndex % memoColors.length];
}

/**
 * 모달 열기
 */
function openMemoModal() {
    const modal = document.getElementById('memo-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * 메모 상세보기 모달 열기
 */
function openMemoViewModal(memo) {
    const modal = document.getElementById('memo-view-modal');
    const titleEl = document.getElementById('view-memo-title');
    const contentEl = document.getElementById('view-memo-content');
    const imagesEl = document.getElementById('view-memo-images');
    const filesEl = document.getElementById('view-memo-files');
    const authorEl = document.getElementById('view-memo-author');
    const dateEl = document.getElementById('view-memo-date');
    const readMode = document.getElementById('view-mode-read');
    const editMode = document.getElementById('view-mode-edit');
    const editBtn = document.getElementById('view-edit-btn');
    
    if (!modal) return;
    
    // 현재 편집 중인 메모 인덱스 저장
    currentEditingMemoIndex = memos.findIndex(m => m.id === memo.id);
    
    // 제목 설정
    if (titleEl) {
        titleEl.textContent = memo.title || '제목 없음';
    }
    
    // 내용 설정
    if (contentEl) {
        contentEl.textContent = memo.text || '';
    }
    
    // 이미지와 파일 분리
    const images = [];
    const files = [];
    if (memo.files && memo.files.length > 0) {
        memo.files.forEach(file => {
            if (file.type && file.type.startsWith('image/')) {
                images.push(file);
            } else {
                files.push(file);
            }
        });
    }
    
    // 이미지 목록 설정
    if (imagesEl) {
        if (images.length > 0) {
            imagesEl.innerHTML = images.map(file => `
                <img src="${file.url || file.name}" alt="${escapeHtml(file.name)}" onclick="window.open('${file.url || file.name}', '_blank')" style="width: 100%; height: auto; border-radius: 8px; cursor: pointer; margin-bottom: 1rem;" />
            `).join('');
        } else {
            imagesEl.innerHTML = '';
        }
    }
    
    // 파일 목록 설정
    if (filesEl) {
        if (files.length > 0) {
            filesEl.innerHTML = files.map(file => `
                <div class="view-memo-file-item">
                    <i class="bx bx-file"></i>
                    <span>${escapeHtml(file.name)}</span>
                </div>
            `).join('');
        } else {
            filesEl.innerHTML = '';
        }
    }
    
    // 작성자 설정
    if (authorEl) {
        authorEl.textContent = memo.author || '익명';
    }
    
    // 날짜 설정
    if (dateEl) {
        dateEl.textContent = formatDate(memo.createdAt);
    }
    
    // 권한 확인하여 수정/삭제 버튼 표시/숨김
    const isEditable = memo.authorId === currentUser.id || isAdmin();
    const deleteBtn = document.getElementById('view-delete-btn');
    
    if (editBtn) {
        editBtn.style.display = isEditable ? 'flex' : 'none';
    }
    if (deleteBtn) {
        deleteBtn.style.display = isEditable ? 'flex' : 'none';
    }
    
    // 읽기 모드로 초기화
    if (readMode) readMode.style.display = 'flex';
    if (editMode) editMode.style.display = 'none';
    
    modal.style.display = 'flex';
}

/**
 * 메모 상세보기 모달 닫기
 */
function closeMemoViewModal() {
    const modal = document.getElementById('memo-view-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingMemoIndex = null;
}

/**
 * 수정 모드 열기
 */
function openMemoEditMode() {
    const readMode = document.getElementById('view-mode-read');
    const editMode = document.getElementById('view-mode-edit');
    const editTitle = document.getElementById('view-edit-title');
    const editContent = document.getElementById('view-edit-content');
    const editFilePreview = document.getElementById('view-edit-file-preview');
    
    if (!editMode || currentEditingMemoIndex === null) return;
    
    const memo = memos[currentEditingMemoIndex];
    
    // 편집 모드로 전환
    if (readMode) readMode.style.display = 'none';
    if (editMode) editMode.style.display = 'flex';
    
    // 값 설정
    if (editTitle) editTitle.value = memo.title || '';
    if (editContent) editContent.value = memo.text || '';
    
    // 배경색 선택
    const bgColor = memo.bgColor || '#FFF9C4';
    const colorRadios = document.querySelectorAll('input[name="view-edit-bg-color"]');
    colorRadios.forEach(radio => {
        if (radio.value === bgColor) {
            radio.checked = true;
        }
    });
    
    // 기존 파일 목록 표시
    if (editFilePreview) {
        editFilePreview.innerHTML = '';
        if (memo.files && memo.files.length > 0) {
            memo.files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-preview-item';
                fileItem.innerHTML = `
                    <i class="bx bx-file"></i>
                    <span class="file-name">${escapeHtml(file.name)}</span>
                    <button class="file-remove" onclick="removeFilePreview(this)">
                        <i class="bx bx-x"></i>
                    </button>
                `;
                editFilePreview.appendChild(fileItem);
            });
        }
    }
}

/**
 * 수정 모드 닫기
 */
function closeMemoEditMode() {
    const readMode = document.getElementById('view-mode-read');
    const editMode = document.getElementById('view-mode-edit');
    
    // 파일 입력 초기화
    const editFileInput = document.getElementById('view-edit-file');
    const editFilePreview = document.getElementById('view-edit-file-preview');
    
    if (editFileInput) editFileInput.value = '';
    if (editFilePreview) editFilePreview.innerHTML = '';
    
    if (readMode) readMode.style.display = 'flex';
    if (editMode) editMode.style.display = 'none';
    
    // 수정 취소된 경우 다시 모달 열기 (기존 파일 복원)
    if (currentEditingMemoIndex !== null) {
        openMemoViewModal(memos[currentEditingMemoIndex]);
    }
}

/**
 * 상세보기 모달에서 메모 저장
 */
function saveMemoFromViewModal() {
    const editTitle = document.getElementById('view-edit-title');
    const editContent = document.getElementById('view-edit-content');
    const editFileInput = document.getElementById('view-edit-file');
    const editFilePreview = document.getElementById('view-edit-file-preview');
    const bgColorInput = document.querySelector('input[name="view-edit-bg-color"]:checked');
    
    if (!editTitle || !editContent || currentEditingMemoIndex === null) return;
    
    const title = editTitle.value.trim();
    const content = editContent.value.trim();
    
    if (!title) {
        showAlert('제목을 입력해주세요.', 'warning');
        return;
    }
    
    if (!content) {
        showAlert('내용을 입력해주세요.', 'warning');
        return;
    }
    
    // 파일 처리
    const processFiles = async () => {
        const files = [];
        const memo = memos[currentEditingMemoIndex];
        
        // 기존 파일 (삭제되지 않은 것들) - 기존 url 유지
        if (editFilePreview) {
            editFilePreview.querySelectorAll('.file-preview-item').forEach(item => {
                const fileName = item.querySelector('.file-name').textContent;
                // 기존 파일 정보 찾기
                const existingFile = memo.files.find(f => f.name === fileName);
                if (existingFile) {
                    files.push(existingFile);
                } else {
                    files.push({
                        name: fileName,
                        type: '',
                        size: 0
                    });
                }
            });
        }
        
        // 새로 추가된 파일
        if (editFileInput && editFileInput.files.length > 0) {
            for (const file of Array.from(editFileInput.files)) {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size
                };
                
                // 이미지인 경우 Data URL 생성
                if (file.type && file.type.startsWith('image/')) {
                    try {
                        const dataUrl = await readFileAsDataURL(file);
                        fileData.url = dataUrl;
                    } catch (error) {
                        console.error('Failed to read image:', error);
                    }
                }
                
                files.push(fileData);
            }
        }
        
        // 메모 업데이트
        memo.title = title;
        memo.text = content;
        memo.files = files;
        memo.bgColor = bgColorInput ? bgColorInput.value : '#FFF9C4';
        memo.updatedAt = new Date().toISOString();
        
        // 저장
        saveMemos();
        filterAndRenderMemos();
        
        // 읽기 모드로 전환
        closeMemoEditMode();
        
        // 모달 내용 업데이트
        openMemoViewModal(memo);
        
        // 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('메모가 수정되었습니다.', 'success');
        } else {
            showAlert('메모가 수정되었습니다.', 'success');
        }
    };
    
    processFiles();
}

/**
 * 모달 닫기
 */
function closeMemoModal() {
    const modal = document.getElementById('memo-modal');
    const titleInput = document.getElementById('memo-title');
    const contentTextarea = document.getElementById('memo-content');
    const fileInput = document.getElementById('memo-file');
    const filePreview = document.getElementById('file-preview');

    if (modal) {
        modal.style.display = 'none';
    }

    // 입력 필드 초기화
    if (titleInput) titleInput.value = '';
    if (contentTextarea) contentTextarea.value = '';
    if (fileInput) fileInput.value = '';
    if (filePreview) filePreview.innerHTML = '';
}

/**
 * 모달에서 메모 제출
 */
function submitMemoFromModal() {
    const titleInput = document.getElementById('memo-title');
    const contentTextarea = document.getElementById('memo-content');
    const fileInput = document.getElementById('memo-file');
    const bgColorInput = document.querySelector('input[name="memo-bg-color"]:checked');
    
    // 색상이 선택되지 않았으면 랜덤 색상 사용
    const selectedColor = bgColorInput ? bgColorInput.value : memoColors[Math.floor(Math.random() * memoColors.length)];

    if (!titleInput || !contentTextarea) return;

    const title = titleInput.value.trim();
    const content = contentTextarea.value.trim();

    if (!title) {
        showAlert('제목을 입력해주세요.', 'warning');
        return;
    }

    if (!content) {
        showAlert('내용을 입력해주세요.', 'warning');
        return;
    }

    // 파일 처리 (비동기적으로 처리 - 이미지를 위한 Data URL 생성)
    const processFiles = async () => {
        const files = [];
        if (fileInput && fileInput.files.length > 0) {
            for (const file of Array.from(fileInput.files)) {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size
                };
                
                // 이미지인 경우 Data URL 생성
                if (file.type && file.type.startsWith('image/')) {
                    try {
                        const dataUrl = await readFileAsDataURL(file);
                        fileData.url = dataUrl;
                    } catch (error) {
                        console.error('Failed to read image:', error);
                    }
                }
                
                files.push(fileData);
            }
        }

        // 새 메모 생성
        const newMemo = {
            id: generateId('memo'),
            title: title,
            text: content,
            files: files,
            bgColor: selectedColor,
            author: currentUser.name,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        memos.unshift(newMemo);
        saveMemos();
        closeMemoModal();
        filterAndRenderMemos();

        // 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('메모가 등록되었습니다.', 'success');
        } else {
            showAlert('메모가 등록되었습니다.', 'success');
        }
    };

    processFiles();
}

/**
 * 파일을 Data URL로 읽기
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 파일 선택 핸들러
 */
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('file-preview');
    
    if (!preview) return;

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
            <i class="bx bx-file"></i>
            <span class="file-name">${escapeHtml(file.name)}</span>
            <button class="file-remove" onclick="removeFilePreview(this)">
                <i class="bx bx-x"></i>
            </button>
        `;
        preview.appendChild(fileItem);
    });
}

/**
 * 파일 미리보기 제거
 */
function removeFilePreview(button) {
    const fileItem = button.parentElement;
    fileItem.remove();
}

/**
 * 수정 모달에서 파일 선택 핸들러
 */
function handleViewEditFileSelect(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('view-edit-file-preview');
    
    if (!preview) return;

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
            <i class="bx bx-file"></i>
            <span class="file-name">${escapeHtml(file.name)}</span>
            <button class="file-remove" onclick="removeFilePreview(this)">
                <i class="bx bx-x"></i>
            </button>
        `;
        preview.appendChild(fileItem);
    });
}

/**
 * 메모 추가 (기존 함수 - 호환성 유지)
 */
function addMemo() {
    openMemoModal();
}

/**
 * 메모 삭제
 */
function deleteMemo(index) {
    if (index < 0 || index >= memos.length) return;

    showConfirm('이 메모를 삭제하시겠습니까?', 'warning').then(confirmed => {
        if (!confirmed) return;

        memos.splice(index, 1);
        saveMemos();
        filterAndRenderMemos();

        // 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('메모가 삭제되었습니다.', 'success');
        }
    });
}

/**
 * 메모 저장
 */
function saveMemos() {
    if (!currentSessionId) return;

    const storageKey = `activity_memos_${currentSessionId}`;
    setStoredData(storageKey, memos);
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
    return getTimeAgoFromUtils(dateString);
}

/**
 * HTML 이스케이프
 */
/**
 * 프로필 정보 로드
 */
function loadProfileInfo() {
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    
    if (profileName && userName) {
        profileName.textContent = userName;
    }
    
    if (profileRole && userRole) {
        profileRole.textContent = userRole === 'admin' ? '교사' : '학생';
    }
}

/**
 * 메모 수정 시작
 */
function editMemo(index) {
    if (index < 0 || index >= memos.length) return;
    
    memos[index].editMode = true;
    saveMemos();
    filterAndRenderMemos();
}

/**
 * 메모 저장
 */
function saveMemo(index) {
    if (index < 0 || index >= memos.length) return;

    const memo = memos[index];
    const card = document.querySelector(`[data-memo-id="${memo.id}"]`);
    
    if (card) {
        const textarea = card.querySelector('textarea');
        const titleInput = card.querySelector('.memo-title-edit');
        
        if (textarea) {
            memo.text = textarea.value;
        }
        
        if (titleInput) {
            memo.title = titleInput.value.trim() || null;
        }
        
        memo.updatedAt = new Date().toISOString();
        delete memo.editMode;
        
        saveMemos();
        filterAndRenderMemos();
        
        if (typeof showToast === 'function') {
            showToast('메모가 수정되었습니다.', 'success');
        }
    }
}

/**
 * 메모 수정 취소
 */
function cancelEditMemo(index) {
    if (index < 0 || index >= memos.length) return;
    
    delete memos[index].editMode;
    saveMemos();
    filterAndRenderMemos();
}

/**
 * 전역 함수로 등록
 */
/**
 * 과제 관련 기능
 */
let assignmentData = null;

// 과제 로드
function loadAssignment() {
    const sessionId = currentSessionId || 'default';
    const saved = getStoredData(`assignment_${sessionId}`, null);
    if (saved) {
        assignmentData = saved;
        renderAssignment();
    }
}

// 과제 저장
function saveAssignment() {
    const sessionId = currentSessionId || 'default';
    if (assignmentData) {
        setStoredData(`assignment_${sessionId}`, assignmentData);
    }
}

// 과제 렌더링
function renderAssignment() {
    const emptyState = document.getElementById('assignment-empty');
    const display = document.getElementById('assignment-display');
    const footer = document.getElementById('assignment-footer');
    const titleEl = document.getElementById('assignment-title');
    const imagesEl = document.getElementById('assignment-images');
    const textEl = document.getElementById('assignment-text');
    const attachmentsEl = document.getElementById('assignment-attachments');
    const dateEl = document.getElementById('assignment-date');
    const authorEl = document.getElementById('assignment-author');

    if (!assignmentData || (!assignmentData.title && !assignmentData.text)) {
        if (emptyState) emptyState.style.display = 'flex';
        if (display) display.style.display = 'none';
        if (footer) footer.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (display) display.style.display = 'flex';
    if (footer) footer.style.display = 'block';

    if (titleEl) {
        titleEl.textContent = assignmentData.title || '';
    }

    // 이미지 렌더링 (제목과 텍스트 사이)
    if (imagesEl) {
        imagesEl.innerHTML = '';
        if (assignmentData.attachments && assignmentData.attachments.length > 0) {
            const images = assignmentData.attachments.filter(file => file.type && file.type.startsWith('image/'));
            if (images.length > 0) {
                images.forEach((file) => {
                    const item = document.createElement('div');
                    item.className = 'assignment-attachment-item';
                    item.innerHTML = `<img src="${file.url || file.name}" alt="${escapeHtml(file.name)}" />`;
                    item.addEventListener('click', () => {
                        window.open(file.url || file.name, '_blank');
                    });
                    imagesEl.appendChild(item);
                });
            }
        }
    }

    if (textEl) {
        textEl.textContent = assignmentData.text;
    }

    // 파일 렌더링 (텍스트 아래)
    if (attachmentsEl) {
        attachmentsEl.innerHTML = '';
        if (assignmentData.attachments && assignmentData.attachments.length > 0) {
            const files = assignmentData.attachments.filter(file => !file.type || !file.type.startsWith('image/'));
            if (files.length > 0) {
                files.forEach((file) => {
                    const item = document.createElement('div');
                    item.className = 'assignment-attachment-item file';
                    const icon = file.type && file.type.includes('pdf') ? 'bx-file-blank' : 'bx-file';
                    item.innerHTML = `
                        <i class="bx ${icon}"></i>
                        <span>${escapeHtml(file.name)}</span>
                    `;
                    item.addEventListener('click', () => {
                        console.log('Download file:', file.name);
                    });
                    attachmentsEl.appendChild(item);
                });
            }
        }
    }

    if (dateEl && assignmentData.date) {
        dateEl.textContent = formatDateFromUtils(assignmentData.date, { style: 'literal' });
    }

    if (authorEl && assignmentData.author) {
        authorEl.textContent = assignmentData.author;
    }
}

// 과제 편집 모달 열기
function openAssignmentModal() {
    const modal = document.getElementById('assignment-modal');
    const titleInput = document.getElementById('assignment-title-input');
    const textInput = document.getElementById('assignment-text-input');
    const filePreview = document.getElementById('assignment-file-preview');
    
    if (!modal) return;

    if (titleInput) {
        titleInput.value = assignmentData ? assignmentData.title || '' : '';
    }

    if (textInput) {
        textInput.value = assignmentData ? assignmentData.text || '' : '';
    }

    if (filePreview) {
        filePreview.innerHTML = '';
        if (assignmentData && assignmentData.attachments) {
            assignmentData.attachments.forEach(file => {
                const item = document.createElement('div');
                item.className = 'file-preview-item';
                item.innerHTML = `
                    <i class="bx bx-file"></i>
                    <span class="file-name">${escapeHtml(file.name)}</span>
                    <button class="file-remove" onclick="removeAssignmentFile(this, '${escapeHtml(file.name)}')">
                        <i class="bx bx-x"></i>
                    </button>
                `;
                filePreview.appendChild(item);
            });
        }
    }

    modal.style.display = 'flex';
}

// 과제 편집 모달 닫기
function closeAssignmentModal() {
    const modal = document.getElementById('assignment-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 과제 상세보기 모달 열기 (읽기 전용)
function openAssignmentViewModal() {
    if (!assignmentData) return;
    
    const modal = document.getElementById('assignment-view-modal');
    if (!modal) return;
    
    const titleEl = document.getElementById('assignment-view-title');
    const textEl = document.getElementById('assignment-view-text');
    const imagesEl = document.getElementById('assignment-view-images');
    const filesEl = document.getElementById('assignment-view-files');
    const dateEl = document.getElementById('assignment-view-date');
    const authorEl = document.getElementById('assignment-view-author');
    
    if (titleEl) {
        titleEl.textContent = assignmentData.title || '제목 없음';
    }
    
    if (textEl) {
        textEl.textContent = assignmentData.text || '';
    }
    
    // 이미지와 파일 분리
    const images = [];
    const files = [];
    if (assignmentData.attachments && assignmentData.attachments.length > 0) {
        assignmentData.attachments.forEach(file => {
            if (file.type && file.type.startsWith('image/')) {
                images.push(file);
            } else {
                files.push(file);
            }
        });
    }
    
    // 이미지 렌더링
    if (imagesEl) {
        if (images.length > 0) {
            imagesEl.innerHTML = images.map(file => `
                <img src="${file.url || file.name}" alt="${escapeHtml(file.name)}" onclick="window.open('${file.url || file.name}', '_blank')" style="width: 100%; height: auto; border-radius: 8px; cursor: pointer; margin-bottom: 1rem;" />
            `).join('');
        } else {
            imagesEl.innerHTML = '';
        }
    }
    
    // 파일 렌더링
    if (filesEl) {
        if (files.length > 0) {
            filesEl.innerHTML = files.map(file => `
                <div class="view-memo-file-item">
                    <i class="bx bx-file"></i>
                    <span>${escapeHtml(file.name)}</span>
                </div>
            `).join('');
        } else {
            filesEl.innerHTML = '';
        }
    }
    
    if (dateEl && assignmentData.date) {
        dateEl.textContent = formatDateFromUtils(assignmentData.date, { style: 'literal' });
    }
    
    if (authorEl && assignmentData.author) {
        authorEl.textContent = assignmentData.author;
    }
    
    modal.style.display = 'flex';
}

// 과제 상세보기 모달 닫기
function closeAssignmentViewModal() {
    const modal = document.getElementById('assignment-view-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 과제 저장
function saveAssignmentFromModal() {
    const titleInput = document.getElementById('assignment-title-input');
    const textInput = document.getElementById('assignment-text-input');
    const fileInput = document.getElementById('assignment-file-input');
    const filePreview = document.getElementById('assignment-file-preview');

    if (!textInput) return;

    const title = titleInput ? titleInput.value.trim() : '';
    const text = textInput.value.trim();
    
    if (!assignmentData) {
        assignmentData = {
            title: '',
            text: '',
            attachments: [],
            date: new Date().toISOString(),
            author: currentUser.name
        };
    }

    assignmentData.title = title;
    assignmentData.text = text;
    assignmentData.date = new Date().toISOString();
    assignmentData.author = currentUser.name;

    // 기존 파일들 가져오기
    const existingFiles = [];
    if (filePreview) {
        filePreview.querySelectorAll('.file-preview-item').forEach(item => {
            const fileName = item.querySelector('.file-name').textContent;
            const existingFile = assignmentData.attachments.find(f => f.name === fileName);
            if (existingFile) {
                existingFiles.push(existingFile);
            }
        });
    }

    // 새로 추가된 파일들
    const newFiles = [];
    if (fileInput && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: e.target.result
                };
                newFiles.push(fileData);
                
                if (newFiles.length === fileInput.files.length) {
                    assignmentData.attachments = [...existingFiles, ...newFiles];
                    saveAssignment();
                    renderAssignment();
                    closeAssignmentModal();
                    if (typeof showToast === 'function') {
                        showToast('과제가 저장되었습니다.', 'success');
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        assignmentData.attachments = existingFiles;
        saveAssignment();
        renderAssignment();
        closeAssignmentModal();
        if (typeof showToast === 'function') {
            showToast('과제가 저장되었습니다.', 'success');
        }
    }
}

// 과제 파일 제거
function removeAssignmentFile(button, fileName) {
    const filePreview = document.getElementById('assignment-file-preview');
    if (filePreview) {
        const item = button.closest('.file-preview-item');
        if (item) {
            item.remove();
        }
    }
    
    if (assignmentData && assignmentData.attachments) {
        assignmentData.attachments = assignmentData.attachments.filter(f => f.name !== fileName);
    }
}

// 과제 파일 선택 핸들러
function handleAssignmentFileSelect(event) {
    const fileInput = event.target;
    const filePreview = document.getElementById('assignment-file-preview');
    
    if (!filePreview) return;

    Array.from(fileInput.files).forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        item.innerHTML = `
            <i class="bx bx-file"></i>
            <span class="file-name">${escapeHtml(file.name)}</span>
            <button class="file-remove" onclick="removeAssignmentFile(this, '${escapeHtml(file.name)}')">
                <i class="bx bx-x"></i>
            </button>
        `;
        filePreview.appendChild(item);
    });
}

window.deleteMemo = deleteMemo;
window.removeFilePreview = removeFilePreview;
window.editMemo = editMemo;
window.saveMemo = saveMemo;
window.cancelEditMemo = cancelEditMemo;
window.removeAssignmentFile = removeAssignmentFile;

/**
 * 초기화 실행
 */
document.addEventListener('DOMContentLoaded', initActivitySession);

const ActivitySessionModule = {
    initActivitySession,
    addMemo,
    deleteMemo,
    renderMemos,
    filterAndRenderMemos
};

if (typeof window !== 'undefined') {
    window.ActivitySessionModule = Object.assign({}, window.ActivitySessionModule || {}, ActivitySessionModule);
    Object.assign(window, ActivitySessionModule);
}

export {
    initActivitySession,
    addMemo,
    deleteMemo,
    renderMemos,
    filterAndRenderMemos
};

export default ActivitySessionModule;
