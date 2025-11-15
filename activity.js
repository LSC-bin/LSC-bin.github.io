/**
 * Activity Page JavaScript
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * Padlet형 실시간 협업보드 - 더미 데이터 모드
 * TODO: Firebase 연결 시
 */

// 전역 변수
let currentUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: localStorage.getItem('userName') || '학생' + Math.floor(Math.random() * 100)
};

// 교사 여부 확인
function isTeacher() {
    return localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'teacher';
}

let posts = [];
let imagesToUpload = [];

// OpenAI API 설정 (실제 API 키로 교체 필요)
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Activity 기능 초기화 (sessionId 기반)
 */
function initActivityForSession(sessionId, readOnlyMode = false) {
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    // 기존 initActivity 함수 호출
    initActivity();
    
    // sessionId 기반 게시글 불러오기
    loadPostsForSession(sessionId);
    
    // 보기 전용 모드 적용
    if (readOnlyMode) {
        applyReadOnlyModeToActivity();
    }
}

/**
 * Activity 탭에 보기 전용 모드 적용
 */
function applyReadOnlyModeToActivity() {
    // 게시글 작성 버튼 비활성화
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
        createPostBtn.disabled = true;
        createPostBtn.style.opacity = '0.6';
        createPostBtn.style.cursor = 'not-allowed';
        createPostBtn.title = '이전 수업입니다. 게시글을 작성할 수 없습니다.';
        
        // 버튼 텍스트 변경
        const icon = createPostBtn.querySelector('i');
        if (icon) {
            createPostBtn.innerHTML = '<i class="bx bx-lock-alt"></i> 작성 불가 (이전 수업)';
        }
    }
    
    // 모든 좋아요/댓글 버튼 비활성화
    setTimeout(() => {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            // 좋아요와 댓글 버튼만 비활성화 (AI 피드백은 보기 가능)
            if (btn.onclick && btn.onclick.toString().includes('toggleLike') || 
                btn.onclick && btn.onclick.toString().includes('toggleComments')) {
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                btn.style.pointerEvents = 'none';
            }
        });
        
        // 댓글 입력 필드 비활성화
        const commentInputs = document.querySelectorAll('.comment-input');
        commentInputs.forEach(input => {
            input.disabled = true;
            input.placeholder = '이전 수업입니다. 댓글을 입력할 수 없습니다.';
            input.style.opacity = '0.6';
            input.style.cursor = 'not-allowed';
        });
        
        const commentSubmitBtns = document.querySelectorAll('.comment-submit');
        commentSubmitBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        });
    }, 500);
}

/**
 * 현재 선택된 세션 ID 가져오기 (Activity 페이지용)
 */
function getCurrentActivitySessionId() {
    return window.currentActivitySessionId || null;
}

/**
 * 초기화 함수 (기본 호환성 유지)
 */
function initActivity() {
    // activity-content 내부에서만 요소 찾기 (다른 페이지와 격리)
    const activityContent = document.getElementById('activity-content');
    if (!activityContent) return; // activity-content가 없으면 초기화하지 않음
    
    // activity-content 내부에서만 요소 찾기
    const createPostBtn = activityContent.querySelector('#activity-create-session-btn');
    const closeModalBtn = activityContent.querySelector('#close-modal');
    const cancelPostBtn = activityContent.querySelector('#cancel-post');
    const submitPostBtn = activityContent.querySelector('#submit-post');
    const postModal = activityContent.querySelector('#post-modal');
    const imageUpload = activityContent.querySelector('#image-upload');
    
    // 모달이 열려있으면 닫기 (초기화 시 항상 닫힌 상태로 시작)
    if (postModal) {
        postModal.classList.remove('active');
        postModal.setAttribute('hidden', '');
    }

    // 중복 이벤트 리스너 방지
    if (createPostBtn && !createPostBtn.hasAttribute('data-activity-initialized')) {
        createPostBtn.setAttribute('data-activity-initialized', 'true');
        createPostBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // 이벤트 버블링 방지
            if (postModal) {
                postModal.removeAttribute('hidden');
            postModal.classList.add('active');
            }
        });
    }

    // 중복 이벤트 리스너 방지
    if (closeModalBtn && !closeModalBtn.hasAttribute('data-activity-initialized')) {
        closeModalBtn.setAttribute('data-activity-initialized', 'true');
        closeModalBtn.addEventListener('click', () => {
            closeModal();
        });
    }

    if (cancelPostBtn && !cancelPostBtn.hasAttribute('data-activity-initialized')) {
        cancelPostBtn.setAttribute('data-activity-initialized', 'true');
        cancelPostBtn.addEventListener('click', () => {
            closeModal();
        });
    }

    if (submitPostBtn && !submitPostBtn.hasAttribute('data-activity-initialized')) {
        submitPostBtn.setAttribute('data-activity-initialized', 'true');
        submitPostBtn.addEventListener('click', handleSubmitPost);
    }

    if (imageUpload && !imageUpload.hasAttribute('data-activity-initialized')) {
        imageUpload.setAttribute('data-activity-initialized', 'true');
        imageUpload.addEventListener('change', handleImageSelect);
    }

    // 모달 외부 클릭 시 닫기 (한 번만 등록)
    if (postModal && !postModal.hasAttribute('data-activity-initialized')) {
        postModal.setAttribute('data-activity-initialized', 'true');
        postModal.addEventListener('click', (e) => {
            if (e.target === postModal) {
                closeModal();
            }
        });
    }

    // Firebase 실시간 동기화
    // Activity 페이지에서 세션이 선택된 경우 해당 세션의 게시글 로드
    const activitySessionId = getCurrentActivitySessionId();
    if (activitySessionId) {
        loadPostsForSession(activitySessionId);
    } else {
    loadPosts();
    }
}

/**
 * 모달 닫기
 */
function closeModal() {
    // activity-content 내부에서만 모달 찾기 (다른 페이지와 격리)
    const activityContent = document.getElementById('activity-content');
    const postModal = activityContent ? activityContent.querySelector('#post-modal') : document.getElementById('post-modal');
    const postTitle = activityContent ? activityContent.querySelector('#post-title') : document.getElementById('post-title');
    const postText = activityContent ? activityContent.querySelector('#post-text') : document.getElementById('post-text');
    const imagePreview = activityContent ? activityContent.querySelector('#image-preview') : document.getElementById('image-preview');
    const imageUpload = activityContent ? activityContent.querySelector('#image-upload') : document.getElementById('image-upload');

    if (postModal) {
        postModal.classList.remove('active');
        postModal.setAttribute('hidden', '');
    }
    if (postTitle) {
        postTitle.value = '';
    }
    if (postText) {
        postText.value = '';
    }
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
    if (imageUpload) {
        imageUpload.value = '';
    }
    imagesToUpload = [];
}

/**
 * 이미지 선택 핸들러
 */
function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    // activity-content 내부에서만 요소 찾기
    const activityContent = document.getElementById('activity-content');
    const preview = activityContent ? activityContent.querySelector('#image-preview') : document.getElementById('image-preview');

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                imagesToUpload.push({ file, previewUrl: imageUrl });
                displayImagePreview(preview, imageUrl, imagesToUpload.length - 1);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * 이미지 미리보기 표시
 */
function displayImagePreview(container, imageUrl, index) {
    const div = document.createElement('div');
    div.className = 'preview-image';
    div.innerHTML = `
        <img src="${imageUrl}" alt="미리보기">
        <button type="button" class="preview-remove" onclick="removeImagePreview(${index})">
            <i class="bx bx-x"></i>
        </button>
    `;
    container.appendChild(div);
}

/**
 * 이미지 미리보기 제거
 */
function removeImagePreview(index) {
    imagesToUpload.splice(index, 1);
    // activity-content 내부에서만 요소 찾기
    const activityContent = document.getElementById('activity-content');
    const preview = activityContent ? activityContent.querySelector('#image-preview') : document.getElementById('image-preview');
    preview.innerHTML = '';
    
    imagesToUpload.forEach((img, idx) => {
        displayImagePreview(preview, img.previewUrl, idx);
    });
}

/**
 * 게시글 제출 핸들러
 */
async function handleSubmitPost() {
    // activity-content 내부에서만 요소 찾기
    const activityContent = document.getElementById('activity-content');
    const postText = activityContent ? activityContent.querySelector('#post-text') : document.getElementById('post-text');
    const submitBtn = activityContent ? activityContent.querySelector('#submit-post') : document.getElementById('submit-post');
    
    if (!postText || !postText.value.trim()) {
        showAlert('내용을 입력해주세요.', 'warning');
        return;
    }

    // 버튼 비활성화
    submitBtn.disabled = true;
    submitBtn.textContent = '게시 중...';

    try {
        // 이미지 업로드
        const imageUrls = await uploadImages();

        // 게시글 데이터
        const activityContent = document.getElementById('activity-content');
        const postTitleEl = activityContent ? activityContent.querySelector('#post-title') : document.getElementById('post-title');
        const postTitle = postTitleEl && postTitleEl.value.trim() ? postTitleEl.value.trim() : null;
        const postContent = postText.value.trim();
        
        // 간단한 설명 생성 (제목이 없으면 내용의 첫 60자)
        const description = postTitle ? null : (postContent.split('\n')[0].substring(0, 60) + (postContent.split('\n')[0].length > 60 ? '...' : ''));
        
        const postData = {
            id: 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: postTitle,
            description: description,
            text: postContent,
            images: imageUrls,
            author: currentUser.name,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            likes: [],
            comments: []
        };

        // sessionId 가져오기 (우선순위: session.html > Activity 페이지 선택 > 없음)
        let sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
        if (!sessionId) {
            sessionId = getCurrentActivitySessionId();
        }
        // 클래스별 스토리지 키 생성 (클래스 코드 기반)
        if (sessionId) {
            // 세션별 게시글 저장
            if (typeof getSessionClassStorage === 'function') {
                const storedPosts = getSessionClassStorage('session_posts', sessionId, []);
                storedPosts.unshift(postData);
                setSessionClassStorage('session_posts', sessionId, storedPosts);
            } else {
                const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
                const storedPosts = JSON.parse(localStorage.getItem(`session_posts_${classCode}_${sessionId}`) || '[]');
                storedPosts.unshift(postData);
                localStorage.setItem(`session_posts_${classCode}_${sessionId}`, JSON.stringify(storedPosts));
            }
        } else {
            // Activity 게시글 저장
            if (typeof getClassStorage === 'function') {
                const storedPosts = getClassStorage('activity_posts', []);
                storedPosts.unshift(postData);
                setClassStorage('activity_posts', storedPosts);
            } else {
                const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
                const storedPosts = JSON.parse(localStorage.getItem(`activity_posts_${classCode}`) || '[]');
                storedPosts.unshift(postData);
                localStorage.setItem(`activity_posts_${classCode}`, JSON.stringify(storedPosts));
            }
        }
        
        // posts 배열에 추가
        posts.unshift(postData);
        
        // UI 업데이트
        renderPosts();
        if (sessionId) {
            setTimeout(() => {
                renderAIFeedbackPanel();
            }, 100);
        }

        // 모달 닫기
        closeModal();

        // 저장 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('게시글이 저장되었습니다.', 'success');
        }
    } catch (error) {
        console.error('게시글 저장 실패:', error);
        showAlert('게시글 저장에 실패했습니다.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '게시하기';
    }
}

/**
 * 이미지 업로드
 */
/**
 * 이미지 업로드 (더미 데이터 모드 - base64 변환)
 */
async function uploadImages() {
    if (imagesToUpload.length === 0) return [];

    // Firebase 대신 base64로 변환하여 저장
    const uploadPromises = imagesToUpload.map(async (img) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result); // base64 데이터 URL
            };
            reader.readAsDataURL(img.file);
        });
    });

    return Promise.all(uploadPromises);
}

/**
 * 게시글 불러오기 (sessionId 기반)
 */
function loadPostsForSession(sessionId) {
    // activity-content 내부에서만 찾기
    const activityContent = document.getElementById('activity-content');
    const activityBoard = activityContent ? activityContent.querySelector('#activity-board') : document.getElementById('activity-board');

    if (!activityBoard) {
        // activity-board가 없으면 게시판 테이블만 있는 페이지
        return;
    }

    // localStorage에서 해당 sessionId의 게시글 불러오기 (클래스 코드 기반)
    posts = typeof getSessionClassStorage === 'function'
        ? getSessionClassStorage('session_posts', sessionId, [])
        : JSON.parse(localStorage.getItem(`session_posts_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}_${sessionId}`) || '[]');
    
    // 더미 데이터 추가 (처음 로드 시)
    if (posts.length === 0) {
        const dummyPosts = [
            {
                id: 'dummy_1',
                text: '디지털 윤리에 대해 생각해본 내용을 공유합니다!',
                images: [],
                author: '학생A',
                authorId: 'student_1',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                likes: ['student_2', 'student_3'],
                comments: [
                    { text: '좋은 생각이네요!', author: '학생B', authorId: 'student_2', createdAt: new Date(Date.now() - 3500000).toISOString() }
                ],
                aiFeedback: '디지털 윤리에 대한 깊이 있는 고민이 돋보입니다. 실제 사례를 추가하면 더욱 설득력 있는 글이 될 것 같습니다.'
            },
            {
                id: 'dummy_2',
                text: 'AI와 함께하는 미래 교육에 대한 아이디어입니다.',
                images: [],
                author: '학생B',
                authorId: 'student_2',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                likes: ['student_1'],
                comments: [],
                aiFeedback: '창의적인 아이디어를 제시하셨네요! 구체적인 실행 방안을 함께 제시하면 더욱 완성도 높은 내용이 될 것입니다.'
            },
            {
                id: 'dummy_3',
                text: '오늘 배운 내용을 정리했습니다. 도움이 되면 좋겠어요!',
                images: [],
                author: '학생C',
                authorId: 'student_3',
                createdAt: new Date(Date.now() - 10800000).toISOString(),
                likes: ['student_1', 'student_2'],
                comments: [
                    { text: '감사합니다!', author: '학생A', authorId: 'student_1', createdAt: new Date(Date.now() - 10750000).toISOString() }
                ]
            },
            {
                id: 'dummy_4',
                text: '프로젝트 진행 상황을 공유합니다.',
                images: [],
                author: '학생D',
                authorId: 'student_4',
                createdAt: new Date(Date.now() - 14400000).toISOString(),
                likes: [],
                comments: [],
                aiFeedback: '프로젝트에 대한 열정이 느껴집니다. 다음 단계 계획을 구체화하면 더 체계적으로 진행할 수 있을 것 같습니다.'
            },
            {
                id: 'dummy_5',
                text: '질문이 있어서 올립니다. 도와주세요!',
                images: [],
                author: '학생E',
                authorId: 'student_5',
                createdAt: new Date(Date.now() - 18000000).toISOString(),
                likes: [],
                comments: [
                    { text: '좋은 질문이네요!', author: '학생A', authorId: 'student_1', createdAt: new Date(Date.now() - 17950000).toISOString() }
                ]
            }
        ];
        posts = dummyPosts;
        // 클래스별 스토리지 키 생성 (클래스 코드 기반)
        if (typeof setSessionClassStorage === 'function') {
            setSessionClassStorage('session_posts', sessionId, posts);
        } else {
            // 폴백: 클래스 코드 직접 사용
            const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
            localStorage.setItem(`session_posts_${classCode}_${sessionId}`, JSON.stringify(posts));
        }
    }
    
    // UI에 렌더링
    renderPosts();
    
    // AI 피드백 패널 렌더링
    setTimeout(() => {
        renderAIFeedbackPanel();
    }, 100);
}

/**
 * 게시글 불러오기 (더미 데이터 모드) - 기본 호환성 유지
 */
function loadPosts() {
    // activity-board가 있는지 먼저 확인 (게시판 테이블만 있는 페이지인지 확인)
    const activityContent = document.getElementById('activity-content');
    const activityBoard = activityContent ? activityContent.querySelector('#activity-board') : document.getElementById('activity-board');
    
    // activity-board가 없으면 게시판 테이블만 있는 페이지 (main-session.html의 Activity)
    // 이 경우 게시글 로드하지 않음
    if (!activityBoard) {
        console.log('Activity 페이지: 게시판 테이블 모드 (Padlet 보드 없음)');
        return;
    }
    
    // session.html에서는 getCurrentSessionId 사용
    const sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    if (sessionId) {
        loadPostsForSession(sessionId);
        return;
    }
    
    // Activity 페이지에서 선택된 세션이 있는 경우
    const activitySessionId = getCurrentActivitySessionId();
    if (activitySessionId) {
        loadPostsForSession(activitySessionId);
        return;
    }

    // localStorage에서 게시글 불러오기 (클래스 코드 기반)
    posts = typeof getClassStorage === 'function'
        ? getClassStorage('activity_posts', [])
        : JSON.parse(localStorage.getItem(`activity_posts_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}`) || '[]');
    
    // UI 업데이트
            renderPosts();
}

/**
 * AI 피드백 패널 렌더링 (비활성화됨)
 * 요약 패널 기능은 제거되었습니다.
 */
function renderAIFeedbackPanel() {
    // AI 피드백 요약 패널은 제거되었습니다.
    // 게시글별 AI 피드백은 계속 표시됩니다.
    return;
}

/**
 * 게시글 렌더링
 */
function renderPosts() {
    // activity-content 내부에서만 찾기 (다른 페이지와 격리)
    const activityContent = document.getElementById('activity-content');
    const activityBoard = activityContent ? activityContent.querySelector('#activity-board') : document.getElementById('activity-board');

    if (!activityBoard) {
        // activity-board가 없으면 게시판 테이블만 있는 페이지
        return;
    }

    if (posts.length === 0) {
        activityBoard.innerHTML = `
            <div class="empty-state">
                <i class="bx bxs-lightbulb"></i>
                <h3>첫 번째 게시글을 작성해주세요!</h3>
                <p>여러분의 아이디어를 자유롭게 공유해요</p>
            </div>
        `;
        return;
    }

    // 게시물 정렬 (고정된 게시물이 위로)
    const sortedPosts = [...posts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const postsContainer = document.createElement('div');
    postsContainer.className = 'posts-container';

    sortedPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });

    // 기존 posts-container가 있으면 교체, 없으면 추가
    const existingContainer = activityBoard.querySelector('.posts-container');
    
    if (existingContainer) {
        existingContainer.replaceWith(postsContainer);
    } else {
    activityBoard.innerHTML = '';
    activityBoard.appendChild(postsContainer);
    }
    
    // AI 피드백 요약 패널 제거
    const existingPanel = activityBoard.querySelector('.ai-feedback-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
}

/**
 * 게시글 요소 생성
 */
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'activity-post';

    // 작성자 아바타 첫 글자
    const avatarLetter = post.author.charAt(0);

    // 이미지 HTML
    const imagesHtml = post.images && post.images.length > 0
        ? `<div class="post-images">
            ${post.images.map(img => `<img src="${img}" alt="게시글 이미지" class="post-image">`).join('')}
           </div>`
        : '';

    // 좋아요 상태
    const isLiked = post.likes && post.likes.includes(currentUser.id);
    const likeIcon = isLiked ? 'bxs' : 'bx';
    const likeClass = isLiked ? 'active' : '';
    const likeCount = post.likes ? post.likes.length : 0;

    // 댓글 개수
    const commentCount = post.comments ? post.comments.length : 0;

    // 날짜 포맷
    const postDate = formatRelativeTime(post.createdAt);

    // AI 피드백 HTML
    const aiFeedbackHtml = post.aiFeedback 
        ? `<div class="ai-feedback-post">
            <div class="ai-feedback-header">
                <i class="bx bx-brain"></i>
                <span class="ai-feedback-label">AI 피드백</span>
            </div>
            <div class="ai-feedback-content">${post.aiFeedback}</div>
          </div>`
        : '';

    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${avatarLetter}</div>
            <div class="post-user-info">
                <div class="post-username">${post.author}</div>
                <div class="post-date">${postDate}</div>
            </div>
        </div>
        <div class="post-content">${escapeHtml(post.text)}</div>
        ${imagesHtml}
        ${aiFeedbackHtml}
        <div class="post-actions">
            <button class="action-btn ${likeClass}" onclick="toggleLike('${post.id}')">
                <i class="${likeIcon} bx-heart"></i>
                <span class="like-count">${likeCount}</span>
            </button>
            <button class="action-btn" onclick="toggleComments('${post.id}')">
                <i class="bx bx-comment"></i>
                <span class="comment-count">${commentCount}</span>
            </button>
            <button class="action-btn ai-feedback-btn" onclick="generateAIFeedback('${post.id}')">
                <i class="bx bx-brain"></i>
                <span>AI 피드백</span>
            </button>
        </div>
        ${isTeacher() ? `
        <div class="teacher-actions">
            <button class="btn-pin" onclick="pinPost('${post.id}')" title="공지로 고정">
                <i class="bx bx-pin"></i>
                <span>공지</span>
            </button>
            <button class="btn-delete-post" onclick="deletePost('${post.id}')" title="게시물 삭제">
                <i class="bx bx-trash"></i>
                <span>삭제</span>
            </button>
        </div>
        ` : ''}
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            ${renderComments(post.comments, post.id)}
        </div>
    `;

    return postDiv;
}

/**
 * 좋아요 토글
 */
async function toggleLike(postId) {
    try {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const postData = posts[postIndex];
        let likes = postData.likes || [];
        const index = likes.indexOf(currentUser.id);

        if (index > -1) {
            // 좋아요 취소
            likes.splice(index, 1);
        } else {
            // 좋아요 추가
            likes.push(currentUser.id);
        }

        // localStorage에 저장
        posts[postIndex].likes = likes;
        saveToLocalStorage();
        
        // UI 업데이트
        renderPosts();
        if (typeof getCurrentSessionId === 'function' && getCurrentSessionId()) {
            setTimeout(() => {
                renderAIFeedbackPanel();
            }, 100);
        }
        
        // 하트 애니메이션 트리거
        const likeBtn = document.querySelector(`[onclick="toggleLike('${postId}')"]`);
        if (likeBtn) {
            const icon = likeBtn.querySelector('i');
            if (icon && !likes.includes(currentUser.id)) {
                icon.classList.add('heart-animate');
                setTimeout(() => icon.classList.remove('heart-animate'), 500);
            }
        }

        // 저장 토스트 메시지
        if (typeof showToast === 'function') {
            showToast(likes.includes(currentUser.id) ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.', 'success');
        }

    } catch (error) {
        console.error('좋아요 실패:', error);
    }
}

/**
 * 댓글 토글
 */
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * 댓글 렌더링
 */
function renderComments(comments, postId) {
    const commentsList = comments && comments.length > 0
        ? comments.map(comment => `
            <div class="comment-item">
                <div class="comment-avatar">${comment.author.charAt(0)}</div>
                <div class="comment-content">
                    <div class="comment-author">${escapeHtml(comment.author)}</div>
                    <div class="comment-text">${escapeHtml(comment.text)}</div>
                    <div class="comment-time">${formatRelativeTime(comment.createdAt)}</div>
                </div>
            </div>
        `).join('')
        : '<p style="text-align: center; color: #999; padding: 1rem;">댓글이 없습니다.</p>';

    return `
        ${commentsList}
        <div class="comment-form">
            <input type="text" class="comment-input" placeholder="댓글을 입력하세요..." id="comment-input-${postId}">
            <button class="comment-submit" onclick="submitComment('${postId}')">
                <i class="bx bx-send"></i>
            </button>
        </div>
    `;
}

/**
 * 댓글 제출
 */
async function submitComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    
    if (!commentInput || !commentInput.value.trim()) {
        return;
    }

    try {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const comments = posts[postIndex].comments || [];
        comments.push({
            text: commentInput.value,
            author: currentUser.name,
            authorId: currentUser.id,
            createdAt: new Date().toISOString()
        });

        // localStorage에 저장
        posts[postIndex].comments = comments;
        saveToLocalStorage();
        
        // UI 업데이트
        renderPosts();
        if (typeof getCurrentSessionId === 'function' && getCurrentSessionId()) {
            setTimeout(() => {
                renderAIFeedbackPanel();
            }, 100);
        }
        commentInput.value = '';

        // 저장 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('댓글이 저장되었습니다.', 'success');
        }

    } catch (error) {
        console.error('댓글 추가 실패:', error);
    }
}

/**
 * 상대 시간 포맷
 */
function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 로컬 스토리지에서 불러오기 (오프라인 모드)
 */
function loadFromLocalStorage() {
    // 클래스별 게시글 불러오기 (클래스 코드 기반)
    posts = typeof getClassStorage === 'function'
        ? getClassStorage('activity_posts', [])
        : JSON.parse(localStorage.getItem(`activity_posts_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}`) || '[]');
    if (posts.length > 0) {
        renderPosts();
    }
}

/**
 * 로컬 스토리지에 저장 (sessionId 기반)
 */
function saveToLocalStorage() {
    // sessionId 가져오기 (우선순위: session.html > Activity 페이지 선택 > 없음)
    let sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    if (!sessionId) {
        sessionId = getCurrentActivitySessionId();
    }
    // 클래스별 스토리지 키 생성 (클래스 코드 기반)
    if (sessionId) {
        // 세션별 게시글 저장
        if (typeof setSessionClassStorage === 'function') {
            setSessionClassStorage('session_posts', sessionId, posts);
        } else {
            const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
            localStorage.setItem(`session_posts_${classCode}_${sessionId}`, JSON.stringify(posts));
        }
    } else {
        // Activity 게시글 저장
        if (typeof setClassStorage === 'function') {
            setClassStorage('activity_posts', posts);
        } else {
            const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
            localStorage.setItem(`activity_posts_${classCode}`, JSON.stringify(posts));
        }
    }
}

/**
 * 게시물 공지 고정
 */
function pinPost(postId) {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    posts[postIndex].pinned = !posts[postIndex].pinned;
    saveToLocalStorage();
    
    // 게시물을 정렬 (고정된 게시물이 위로)
    posts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    renderPosts();
    renderAIFeedbackPanel();
    
    if (typeof showToast === 'function') {
        showToast(posts[postIndex].pinned ? '공지로 고정되었습니다.' : '공지 고정이 해제되었습니다.', 'success');
    } else {
        showAlert(posts[postIndex].pinned ? '공지로 고정되었습니다.' : '공지 고정이 해제되었습니다.', 'success');
    }
}

/**
 * 게시물 삭제
 */
function deletePost(postId) {
    showConfirm('이 게시물을 삭제하시겠습니까?', 'danger').then(confirmed => {
        if (!confirmed) return;
        
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;
        
        posts.splice(postIndex, 1);
        saveToLocalStorage();
        
        renderPosts();
        
        if (typeof showToast === 'function') {
            showToast('게시물이 삭제되었습니다.', 'success');
        } else {
            showAlert('게시물이 삭제되었습니다.', 'success');
        }
    });
}

/**
 * AI 피드백 생성
 */
async function generateAIFeedback(postId) {
    try {
        // 게시글 데이터 가져오기 (localStorage에서)
        const postData = posts.find(p => p.id === postId);

        if (!postData) {
            showAlert('게시글을 찾을 수 없습니다.', 'error');
            return;
        }

        // 이미 피드백이 있으면 재생성 여부 확인
        if (postData.aiFeedback) {
            const confirmed = await showConfirm('AI 피드백이 이미 존재합니다. 다시 생성하시겠습니까?', 'warning');
            if (!confirmed) {
                return;
            }
        }

        // 로딩 표시
        showFeedbackLoading(postId);

        // OpenAI API 호출
        const prompt = `다음은 학생이 작성한 Activity 게시글입니다:

"${postData.text}"

이 게시글에 대해 다음을 수행해주세요:
1. 게시글의 핵심 내용을 간결하게 요약 (1-2문장)
2. 긍정적이고 격려하는 피드백 제공 (2-3문장)
3. 학습에 도움이 되는 제안 포함

피드백은 한국어로 친근하고 따뜻한 톤으로 작성해주세요.`;

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: '당신은 교육 전문가로서 학생들의 학습을 도와주는 친근한 조언자입니다.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('API 호출 실패');
        }

        const data = await response.json();
        const aiFeedback = data.choices[0].message.content;

        // localStorage에 피드백 저장
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            posts[postIndex].aiFeedback = aiFeedback;
            saveToLocalStorage();
        }

        // UI 업데이트
        hideFeedbackLoading(postId);
        renderPosts();
        showAlert('AI 피드백이 생성되었습니다!', 'success');

    } catch (error) {
        console.error('AI 피드백 생성 실패:', error);
        hideFeedbackLoading(postId);
        
        // API 키가 설정되지 않은 경우 임시 피드백 생성
        if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            showAlert('OpenAI API 키가 설정되지 않았습니다. 임시 피드백을 생성합니다.', 'warning');
            await generateMockFeedback(postId);
        } else {
            showAlert('AI 피드백 생성에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        }
    }
}

/**
 * 임시 피드백 생성 (OpenAI API 없이)
 */
async function generateMockFeedback(postId) {
    try {
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const mockFeedbacks = [
            '훌륭한 생각을 공유해주셨네요! 게시글의 핵심 내용이 잘 전달되고 있습니다. 이런 적극적인 참여는 학습에 큰 도움이 됩니다. 계속해서 자신의 의견을 자유롭게 표현해보세요.',
            '이 게시글은 창의적인 아이디어를 담고 있습니다. 아이디어를 구체화하는 과정에서 더 많은 예시나 사례를 추가한다면 더욱 완성도 높은 글을 만들 수 있을 것 같습니다.',
            '수업 내용을 잘 이해하고 있으신 것 같습니다. 나아가 다른 관점에서 생각해볼 기회를 갖는다면 더욱 풍부한 학습 경험이 될 것입니다. 좋은 시작입니다!'
        ];

        const randomFeedback = mockFeedbacks[Math.floor(Math.random() * mockFeedbacks.length)];
        
        // localStorage에 저장
        posts[postIndex].aiFeedback = randomFeedback;
        saveToLocalStorage();
        
        // UI 업데이트
        renderPosts();
        
        if (typeof showToast === 'function') {
            showToast('AI 피드백이 생성되었습니다!', 'success');
        } else {
            showAlert('AI 피드백이 생성되었습니다!', 'success');
        }
    } catch (error) {
        console.error('임시 피드백 생성 실패:', error);
    }
}

/**
 * 게시글 상세보기
 */
function viewPostDetail(postId) {
    // 상세보기 기능은 필요하지 않습니다 (이미 카드 형식으로 표시됨)
    // 필요하다면 나중에 추가할 수 있습니다
}

/**
 * 피드백 로딩 표시
 */
function showFeedbackLoading(postId) {
    const postElement = document.querySelector(`.activity-post`);
    if (postElement) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'ai-feedback-loading';
        loadingDiv.id = `loading-${postId}`;
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <i class="bx bx-loader-alt bx-spin"></i>
                <span>AI 피드백 생성 중...</span>
            </div>
        `;
        postElement.appendChild(loadingDiv);
    }
}

/**
 * 피드백 로딩 숨기기
 */
function hideFeedbackLoading(postId) {
    const loadingDiv = document.getElementById(`loading-${postId}`);
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // Activity 페이지가 로드되었을 때만 초기화
    if (document.getElementById('activity-content')) {
        initActivity();
    }
});

// 전역 함수로 등록
window.generateAIFeedback = generateAIFeedback;
window.viewPostDetail = viewPostDetail;

// 내보내기 (모듈 시스템 지원)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initActivity,
        toggleLike,
        toggleComments,
        submitComment,
        removeImagePreview,
        generateAIFeedback
    };
}

