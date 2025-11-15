/**
 * Ask Session Page JavaScript
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * 카카오톡 단체 채팅방 - 더미 데이터 모드
 * TODO: Firebase 연결 시
 */

// 전역 변수
let messages = [];
let askPosts = []; // Ask 게시글
let imagesToUpload = []; // Ask 게시글 이미지
// 현재 사용자 정보 (localStorage에서 불러오기)
let currentUser = {
    id: localStorage.getItem('userName') ? `user_${localStorage.getItem('userName')}` : 'user_' + Date.now(),
    name: localStorage.getItem('userName') || '익명',
    isAnonymous: false
};

// Gemini API 설정 (실제 API 키로 교체 필요)
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

// OpenAI API 설정 (실제 API 키로 교체 필요)
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * 초기화 함수
 */
function initAsk() {
    // Ask 콘텐츠가 없으면 초기화하지 않음
    const askContent = document.getElementById('ask-content');
    if (!askContent) {
        return;
    }
    
    // 채팅 입력 이벤트
    const chatInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    
    if (chatSendBtn && !chatSendBtn.hasAttribute('data-initialized')) {
        chatSendBtn.setAttribute('data-initialized', 'true');
        chatSendBtn.addEventListener('click', handleSendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // 파일 첨부 이벤트
    const fileInput = document.getElementById('chat-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                showAlert('파일 첨부 기능은 추후 구현 예정입니다.', 'info');
                e.target.value = ''; // 초기화
            }
        });
    }

    // 이모티콘 버튼 (현재는 플레이스홀더)
    const emojiBtn = document.querySelector('.chat-input-btn');
    if (emojiBtn && emojiBtn.querySelector('.bx-smile')) {
        emojiBtn.addEventListener('click', () => {
            showAlert('이모티콘 기능은 추후 구현 예정입니다.', 'info');
        });
    }

    // 익명 모드 토글
    const anonymousSwitch = document.getElementById('anonymous-switch');
    if (anonymousSwitch) {
        anonymousSwitch.addEventListener('change', (e) => {
            currentUser.isAnonymous = e.target.checked;
            currentUser.name = e.target.checked ? '익명' : '사용자';
        });
    }

    // AI 요약 버튼 이벤트
    const aiSummaryBtn = document.getElementById('btn-ai-summary');
    const closeSummaryModal = document.getElementById('close-summary-modal');
    const summaryModal = document.getElementById('summary-modal');
    
    if (aiSummaryBtn) {
        aiSummaryBtn.addEventListener('click', () => {
            generateQuestionSummary();
        });
    }

    if (closeSummaryModal) {
        closeSummaryModal.addEventListener('click', () => {
            closeSummaryModalFunc();
        });
    }

    if (summaryModal) {
        summaryModal.addEventListener('click', (e) => {
            if (e.target === summaryModal) {
                closeSummaryModalFunc();
            }
        });
    }

    // 나가기 버튼
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', () => {
            showConfirm('채팅방을 나가시겠습니까?', 'warning').then(confirmed => {
                if (confirmed) {
                    showAlert('채팅방을 나갔습니다.', 'success');
                }
            });
        });
    }

    // Firebase 실시간 동기화 (나중에 구현)
    loadMessages();
    
    // Ask 게시글 기능 초기화는 ask-session.html 또는 session.html에서만
    // (main-session.html의 ask-content는 게시판 테이블만 표시하므로 initAskPosts 불필요)
    const askBoard = document.getElementById('ask-board');
    if (askBoard) {
        initAskPosts();
    }
}

/**
 * Ask 게시글 기능 초기화
 */
function initAskPosts() {
    // 모달 이벤트
    const askPostModal = document.getElementById('ask-post-modal');
    const askCloseModalBtn = document.getElementById('ask-close-modal');
    const askCancelPostBtn = document.getElementById('ask-cancel-post');
    const askSubmitPostBtn = document.getElementById('ask-submit-post');
    const askImageUpload = document.getElementById('ask-image-upload');

    // Ask 페이지 글쓰기 버튼 클릭 시 모달 열기
    const askWriteBtn = document.getElementById('ask-create-session-btn');
    if (askWriteBtn && !askWriteBtn.hasAttribute('data-initialized')) {
        askWriteBtn.setAttribute('data-initialized', 'true');
        askWriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (askPostModal) {
                askPostModal.classList.add('active');
            }
        });
    }

    if (askCloseModalBtn) {
        askCloseModalBtn.addEventListener('click', () => {
            closeAskModal();
        });
    }

    if (askCancelPostBtn) {
        askCancelPostBtn.addEventListener('click', () => {
            closeAskModal();
        });
    }

    if (askSubmitPostBtn) {
        askSubmitPostBtn.addEventListener('click', handleAskSubmitPost);
    }

    if (askImageUpload) {
        askImageUpload.addEventListener('change', handleAskImageSelect);
    }

    // 모달 외부 클릭 시 닫기
    if (askPostModal) {
        askPostModal.addEventListener('click', (e) => {
            if (e.target === askPostModal) {
                closeAskModal();
            }
        });
    }

    // Ask 게시글 불러오기
    loadAskPosts();
}

/**
 * 메시지 전송 핸들러
 */
async function handleSendMessage() {
    const chatInput = document.getElementById('chat-message-input');
    
    if (!chatInput || !chatInput.value.trim()) {
        return;
    }

    // 메시지 데이터
    const messageData = {
        text: chatInput.value.trim(),
        sender: currentUser.name,
        senderId: currentUser.id,
        isAnonymous: currentUser.isAnonymous,
        timestamp: new Date(),
        likes: []
    };

    // sessionId 가져오기
    const sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    
    if (!sessionId) {
        showAlert('세션 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    // 메시지 추가
    messages.push(messageData);
    
    // localStorage에 저장 (sessionId 기반, 클래스 코드 기반)
    if (typeof setSessionClassStorage === 'function') {
        setSessionClassStorage('session_messages', sessionId, messages);
    } else {
        // 폴백: 클래스 코드 직접 사용
        const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
        localStorage.setItem(`session_messages_${classCode}_${sessionId}`, JSON.stringify(messages));
    }
    
    // UI 업데이트
    renderMessages();
    
    // 입력 필드 초기화
    chatInput.value = '';
    
    // 스크롤 맨 아래로
    scrollToBottom();

    // 저장 토스트 메시지
    if (typeof showToast === 'function') {
        showToast('메시지가 저장되었습니다.', 'success');
    }
}

/**
 * Ask 기능 초기화 (sessionId 기반)
 */
function initAskForSession(sessionId, readOnlyMode = false) {
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    // 기존 initAsk 함수 호출
    initAsk();
    
    // sessionId 기반 메시지 불러오기
    loadMessagesForSession(sessionId);
    
    // 보기 전용 모드 적용
    if (readOnlyMode) {
        applyReadOnlyModeToAsk();
    }
}

/**
 * Ask 탭에 보기 전용 모드 적용
 */
function applyReadOnlyModeToAsk() {
    // 채팅 입력 필드 비활성화
    const chatInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatInputBtns = document.querySelectorAll('.chat-input-btn');
    
    if (chatInput) {
        chatInput.disabled = true;
        chatInput.placeholder = '이전 수업입니다. 입력할 수 없습니다.';
        chatInput.style.opacity = '0.6';
        chatInput.style.cursor = 'not-allowed';
    }
    
    if (chatSendBtn) {
        chatSendBtn.disabled = true;
        chatSendBtn.style.opacity = '0.6';
        chatSendBtn.style.cursor = 'not-allowed';
    }
    
    chatInputBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
        btn.style.pointerEvents = 'none';
    });
    
    // 익명 스위치 비활성화
    const anonymousSwitch = document.getElementById('anonymous-switch');
    if (anonymousSwitch) {
        anonymousSwitch.disabled = true;
    }
}

/**
 * 메시지 불러오기 (sessionId 기반)
 */
function loadMessagesForSession(sessionId) {
    // localStorage에서 해당 sessionId의 메시지 불러오기 (클래스 코드 기반)
    const sessionMessages = typeof getSessionClassStorage === 'function'
        ? getSessionClassStorage('session_messages', sessionId, [])
        : JSON.parse(localStorage.getItem(`session_messages_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}_${sessionId}`) || '[]');
    
    if (sessionMessages.length === 0) {
        // 기본 환영 메시지
        messages = [
            {
                text: '안녕하세요! 수업 관련 질문이나 토론이 있으시면 언제든지 말씀해주세요.',
                sender: '담임선생님',
                senderId: 'teacher_001',
                isAnonymous: false,
                timestamp: new Date(Date.now() - 60000 * 5),
                likes: []
            }
        ];
    } else {
        messages = sessionMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
    }

    renderMessages();
}

/**
 * 메시지 불러오기 (Firebase 나중에 구현) - 기본 호환성 유지
 */
function loadMessages() {
    // session.html에서는 loadMessagesForSession 사용
    const sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    if (sessionId) {
        loadMessagesForSession(sessionId);
        return;
    }

    // main-session.html에서 사용할 경우 기존 로직 유지
    if (messages.length === 0) {
        messages = [
            {
                text: '안녕하세요! 수업 관련 질문이나 토론이 있으시면 언제든지 말씀해주세요.',
                sender: '담임선생님',
                senderId: 'teacher_001',
                isAnonymous: false,
                timestamp: new Date(Date.now() - 60000 * 5),
                likes: []
            }
        ];
    }

    renderMessages();
}

/**
 * 메시지 렌더링
 */
function renderMessages() {
    const chatMessages = document.getElementById('chatMessages');

    if (!chatMessages) return;

    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="empty-state">
                <i class="bx bxs-chat"></i>
                <h3>메시지가 없습니다</h3>
                <p>첫 번째 메시지를 보내보세요!</p>
            </div>
        `;
        return;
    }

    chatMessages.innerHTML = '';

    messages.forEach((message, index) => {
        const messageElement = createMessageElement(message, index);
        chatMessages.appendChild(messageElement);
    });

    scrollToBottom();
    
    // WordCloud 업데이트
    renderWordCloud();
}

/**
 * WordCloud 렌더링
 */
function renderWordCloud() {
    const canvas = document.getElementById('wordCloudCanvas');
    if (!canvas || typeof WordCloud === 'undefined') {
        return;
    }

    // 질문과 메시지에서 모든 단어 추출
    const allQuestions = [];
    const sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    
    // 질문 데이터 로드 (클래스 코드 기반)
    if (sessionId) {
        const questions = typeof getSessionClassStorage === 'function'
            ? getSessionClassStorage('session_questions', sessionId, [])
            : JSON.parse(localStorage.getItem(`session_questions_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}_${sessionId}`) || '[]');
        if (questions && questions.length > 0) {
            allQuestions.push(...questions.map(q => q.text));
        }
    }
    
    // 메시지에서 단어 추출
    messages.forEach(msg => {
        if (msg.text && typeof msg.text === 'string') {
            allQuestions.push(msg.text);
        }
    });

    // 모든 텍스트를 하나로 합치고 단어로 분리
    const allText = allQuestions.join(' ');
    const words = allText.split(/\s+/).filter(word => word.length > 1);
    
    // 한글 불용어 목록 (가장 일반적인 것들)
    const stopWords = ['것', '거', '이', '가', '을', '를', '에', '의', '로', '와', '과', '은', '는', '한', '하', '수', '도', '있', '없', '게', '로', '개', '번', '될', '데', '전', '후', '서', '만', '겠', '습니', '입니', '하세', '겠습', '입니다', '합니다', '하세요', '습니다', '네요', '아요', '어요', '이요', '니다', '게요', '지요', '세요', '든요', '랍니', '시대', '정도', '이상', '것을', '것은', '것이', '것을', '것도', '것만', '것을', '해요', '해도', '했어', '했을', '할지', '할까', '한데', '하네', '하나', '처럼', '하거나', '하면서', '하지만', '하므로', '그러나', '그래서', '그리고', '하거나', '그런데', '그때', '그렇게', '그렇게', '그렇다', '그런', '그럴', '그러면', '어떻게', '무엇', '어떤', '언제', '어디', '누구', '왜', '거기', '여기', '저기'];
    
    // 단어 빈도 계산
    const wordCount = {};
    words.forEach(word => {
        // 한글, 영어, 숫자만 포함하고 길이가 2 이상인 단어만 처리
        const cleanWord = word.replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, '').toLowerCase();
        if (cleanWord.length >= 2 && !stopWords.includes(cleanWord)) {
            wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
        }
    });
    
    // 배열로 변환 [['단어', 빈도], ...] 형태
    const wordList = Object.entries(wordCount);
    
    // WordCloud 렌더링
    if (wordList.length > 0) {
        // canvas 크기 조정
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
        
        // 색상 배열
        const colors = ['#3C91E6', '#FF723D', '#A855F7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
        
        WordCloud(canvas, {
            list: wordList,
            gridSize: Math.round(16 * window.devicePixelRatio),
            weightFactor: function (size) {
                return Math.pow(size, 2.3) * canvas.width / 1024;
            },
            fontFamily: 'Noto Sans KR, Poppins, Arial, sans-serif',
            color: function(word, weight, fontSize, distance, theta) {
                // 단어의 첫 글자를 기준으로 일관된 색상 할당
                const charCode = word.charCodeAt(0);
                const colorIndex = charCode % colors.length;
                return colors[colorIndex];
            },
            rotateRatio: 0,
            rotationSteps: 0,
            backgroundColor: 'transparent',
            drawOutOfBound: false,
            shrinkToFit: true
        });
    }
}

/**
 * 메시지 요소 생성
 */
function createMessageElement(message, index) {
    const messageDiv = document.createElement('div');
    
    // 이전 메시지와 같은 사람인지 확인
    const prevMessage = messages[index - 1];
    const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
    const isOwn = message.senderId === currentUser.id;

    messageDiv.className = `chat-bubble ${isOwn ? 'self' : 'other'}`;
    messageDiv.style.animation = 'fadeIn 0.3s ease-in';
    messageDiv.textContent = message.text;

    return messageDiv;
}

/**
 * 시간 포맷 (HH:MM)
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
 * 스크롤 맨 아래로 (부드러운 스크롤)
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // 부드러운 스크롤
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }
}

/**
 * 질문 요약 생성 (Gemini API)
 */
async function generateQuestionSummary() {
    try {
        // 질문이 없으면 알림
        if (messages.length === 0) {
            showAlert('요약할 메시지가 없습니다.', 'warning');
            return;
        }

        // 모달 열기
        const summaryModal = document.getElementById('summary-modal');
        const summaryLoading = document.getElementById('summary-loading');
        const summaryResult = document.getElementById('summary-result');
        
        summaryModal.classList.add('active');
        summaryLoading.style.display = 'block';
        summaryResult.style.display = 'none';

        // 모든 메시지 텍스트 수집
        const messagesText = messages
            .filter(m => !m.senderId.startsWith('teacher'))
            .map(m => m.text)
            .join('\n\n');

        if (messagesText.trim() === '') {
            summaryLoading.innerHTML = '<p>요약할 학생 메시지가 없습니다.</p>';
            return;
        }

        // Gemini API 호출
        const summary = await callGeminiAPI(messagesText);
        
        // 결과 표시
        displaySummaryResult(summary);

    } catch (error) {
        console.error('메시지 요약 실패:', error);
        showSummaryError(error);
    }
}

/**
 * Gemini API 호출
 */
async function callGeminiAPI(messagesText) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `다음은 채팅방에서 학생들이 올린 메시지들입니다:

${messagesText}

이 메시지들을 분석하여:
1. 주요 주제별로 분류
2. 각 주제에 대한 핵심 내용 요약
3. 교사에게 도움이 되는 통찰 제공

한국어로 명확하고 구조화된 형태로 응답해주세요.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error('API 호출 실패');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('응답 형식 오류');
        }

    } catch (error) {
        console.error('Gemini API 호출 실패:', error);
        // API 키가 설정되지 않은 경우 임시 요약 생성
        if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            return generateMockSummary(messagesText);
        }
        throw error;
    }
}

/**
 * 요약 결과 표시
 */
function displaySummaryResult(summary) {
    const summaryLoading = document.getElementById('summary-loading');
    const summaryResult = document.getElementById('summary-result');
    
    summaryLoading.style.display = 'none';
    summaryResult.style.display = 'block';
    
    summaryResult.innerHTML = `
        <div class="summary-content">
            ${formatSummaryText(summary)}
        </div>
    `;
}

/**
 * 요약 텍스트 포맷팅
 */
function formatSummaryText(text) {
    // Markdown 스타일을 HTML로 변환
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // 리스트 아이템 감싸기
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    return '<p>' + formatted + '</p>';
}

/**
 * 에러 표시
 */
function showSummaryError(error) {
    const summaryLoading = document.getElementById('summary-loading');
    const summaryResult = document.getElementById('summary-result');
    
    summaryLoading.style.display = 'none';
    summaryResult.style.display = 'block';
    
    summaryResult.innerHTML = `
        <div class="summary-error">
            <i class="bx bx-error-circle"></i>
            <p>요약 생성에 실패했습니다.</p>
            <p style="color: #999; font-size: 0.9rem;">${error.message || '알 수 없는 오류가 발생했습니다.'}</p>
        </div>
    `;
}

/**
 * 모달 닫기
 */
function closeSummaryModalFunc() {
    const summaryModal = document.getElementById('summary-modal');
    const summaryLoading = document.getElementById('summary-loading');
    const summaryResult = document.getElementById('summary-result');
    
    summaryModal.classList.remove('active');
    summaryLoading.style.display = 'block';
    summaryResult.style.display = 'none';
    summaryResult.innerHTML = '';
}

/**
 * 임시 요약 생성 (Gemini API 없이)
 */
function generateMockSummary(messagesText) {
    const messages = messagesText.split('\n\n').filter(m => m.trim());
    
    let summary = `## 채팅 요약\n\n`;
    
    // 주제별 분류 (간단한 키워드 매칭)
    const topics = {
        '질문': [],
        '논의': [],
        '과제': [],
        '기타': []
    };
    
    messages.forEach((m) => {
        if (m.includes('?') || m.includes('질문') || m.includes('왜') || m.includes('어떻게')) {
            topics['질문'].push(m);
        } else if (m.includes('과제') || m.includes('제출') || m.includes('마감')) {
            topics['과제'].push(m);
        } else if (m.includes('토론') || m.includes('의견') || m.includes('생각')) {
            topics['논의'].push(m);
        } else {
            topics['기타'].push(m);
        }
    });
    
    Object.keys(topics).forEach(topic => {
        if (topics[topic].length > 0) {
            summary += `\n### ${topic} (${topics[topic].length}개)\n\n`;
            topics[topic].slice(0, 3).forEach(m => {
                summary += `- ${m.substring(0, 50)}${m.length > 50 ? '...' : ''}\n`;
            });
        }
    });
    
    summary += `\n\n**총 메시지 수**: ${messages.length}개`;
    summary += `\n\n**주요 주제**: ${Object.keys(topics).filter(k => topics[k].length > 0).join(', ')}`;
    
    return summary;
}

/**
 * Ask 게시글 모달 닫기
 */
function closeAskModal() {
    const askPostModal = document.getElementById('ask-post-modal');
    const askPostTitle = document.getElementById('ask-post-title');
    const askPostText = document.getElementById('ask-post-text');
    const askImagePreview = document.getElementById('ask-image-preview');
    const askImageUpload = document.getElementById('ask-image-upload');

    if (askPostModal) {
        askPostModal.classList.remove('active');
    }
    if (askPostTitle) {
        askPostTitle.value = '';
    }
    if (askPostText) {
        askPostText.value = '';
    }
    if (askImagePreview) {
        askImagePreview.innerHTML = '';
    }
    if (askImageUpload) {
        askImageUpload.value = '';
    }
    imagesToUpload = [];
}

/**
 * Ask 이미지 선택 핸들러
 */
function handleAskImageSelect(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('ask-image-preview');

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                imagesToUpload.push({ file, previewUrl: imageUrl });
                displayAskImagePreview(preview, imageUrl, imagesToUpload.length - 1);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Ask 이미지 미리보기 표시
 */
function displayAskImagePreview(container, imageUrl, index) {
    const div = document.createElement('div');
    div.className = 'preview-image';
    div.innerHTML = `
        <img src="${imageUrl}" alt="미리보기">
        <button type="button" class="preview-remove" onclick="removeAskImagePreview(${index})">
            <i class="bx bx-x"></i>
        </button>
    `;
    container.appendChild(div);
}

/**
 * Ask 이미지 미리보기 제거
 */
function removeAskImagePreview(index) {
    imagesToUpload.splice(index, 1);
    const preview = document.getElementById('ask-image-preview');
    preview.innerHTML = '';
    
    imagesToUpload.forEach((img, idx) => {
        displayAskImagePreview(preview, img.previewUrl, idx);
    });
}

/**
 * Ask 게시글 제출 핸들러
 */
async function handleAskSubmitPost() {
    const askPostText = document.getElementById('ask-post-text');
    const askSubmitBtn = document.getElementById('ask-submit-post');
    
    if (!askPostText || !askPostText.value.trim()) {
        showAlert('내용을 입력해주세요.', 'warning');
        return;
    }

    // 버튼 비활성화
    askSubmitBtn.disabled = true;
    askSubmitBtn.textContent = '게시 중...';

    try {
        // 이미지 업로드
        const imageUrls = await uploadAskImages();

        // 게시글 데이터
        const askPostTitleEl = document.getElementById('ask-post-title');
        const askPostTitle = askPostTitleEl && askPostTitleEl.value.trim() ? askPostTitleEl.value.trim() : null;
        const askPostContent = askPostText.value.trim();
        
        const postData = {
            id: 'ask_post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: askPostTitle,
            text: askPostContent,
            images: imageUrls,
            author: currentUser.name,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
            likes: [],
            comments: []
        };

        // localStorage에 저장 (클래스 코드 기반)
        const storedPosts = typeof getClassStorage === 'function'
            ? getClassStorage('ask_posts', [])
            : JSON.parse(localStorage.getItem(`ask_posts_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}`) || '[]');
        storedPosts.unshift(postData);
        if (typeof setClassStorage === 'function') {
            setClassStorage('ask_posts', storedPosts);
        } else {
            const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
            localStorage.setItem(`ask_posts_${classCode}`, JSON.stringify(storedPosts));
        }
        
        // posts 배열에 추가
        askPosts.unshift(postData);
        
        // sessions 테이블에도 추가 (게시판 목록에 표시하기 위해)
        const sessionId = `ask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData = {
            id: sessionId,
            title: askPostTitle || '제목 없음',
            date: new Date().toISOString().split('T')[0],
            number: 1,
            createdAt: new Date().toISOString(),
            type: 'ask', // Ask 게시글 표시
            postId: postData.id, // 연결된 게시글 ID
            author: currentUser.name // 작성자
        };
        
        // 클래스별 세션 목록 로드 및 저장 (클래스 코드 기반)
        const sessions = typeof getClassStorage === 'function'
            ? getClassStorage('sessions', [])
            : JSON.parse(localStorage.getItem(`sessions_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}`) || '[]');
        sessions.unshift(sessionData);
        if (typeof setClassStorage === 'function') {
            setClassStorage('sessions', sessions);
        } else {
            // 폴백: 클래스 코드 직접 사용
            const classCode = typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default';
            localStorage.setItem(`sessions_${classCode}`, JSON.stringify(sessions));
        }
        
        // UI 업데이트
        renderAskPosts();
        
        // 모달 닫기
        closeAskModal();

        // 저장 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('게시글이 저장되었습니다.', 'success');
        }
        
        // 테이블 새로고침
        if (typeof loadSessionsForBoard === 'function') {
            loadSessionsForBoard('ask-sessions-table-body');
        }
    } catch (error) {
        console.error('게시글 저장 실패:', error);
        showAlert('게시글 저장에 실패했습니다.', 'error');
    } finally {
        askSubmitBtn.disabled = false;
        askSubmitBtn.textContent = '게시하기';
    }
}

/**
 * Ask 이미지 업로드
 */
async function uploadAskImages() {
    if (imagesToUpload.length === 0) return [];

    // base64로 변환하여 저장
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
 * Ask 게시글 불러오기
 */
function loadAskPosts() {
    const askBoard = document.getElementById('ask-board');

    if (!askBoard) return;

    // localStorage에서 게시글 불러오기 (클래스 코드 기반)
    askPosts = typeof getClassStorage === 'function'
        ? getClassStorage('ask_posts', [])
        : JSON.parse(localStorage.getItem(`ask_posts_${typeof getCurrentClassId === 'function' ? getCurrentClassId() : 'default'}`) || '[]');
    
    // UI에 렌더링
    renderAskPosts();
}

/**
 * Ask 게시글 렌더링
 */
function renderAskPosts() {
    const askBoard = document.getElementById('ask-board');

    if (!askBoard) return;

    if (askPosts.length === 0) {
        askBoard.innerHTML = `
            <div class="empty-state">
                <i class="bx bxs-lightbulb"></i>
                <h3>첫 번째 게시글을 작성해주세요!</h3>
                <p>여러분의 아이디어를 자유롭게 공유해요</p>
            </div>
        `;
        return;
    }

    // 게시물 정렬 (최신순)
    const sortedPosts = [...askPosts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const postsContainer = document.createElement('div');
    postsContainer.className = 'posts-container';

    sortedPosts.forEach(post => {
        const postElement = createAskPostElement(post);
        postsContainer.appendChild(postElement);
    });

    // 기존 posts-container가 있으면 교체
    const existingContainer = askBoard.querySelector('.posts-container');
    
    if (existingContainer) {
        existingContainer.replaceWith(postsContainer);
    } else {
        askBoard.innerHTML = '';
        askBoard.appendChild(postsContainer);
    }
}

/**
 * Ask 게시글 요소 생성
 */
function createAskPostElement(post) {
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
    const likeCount = post.likes ? post.likes.length : 0;

    // 댓글 개수
    const commentCount = post.comments ? post.comments.length : 0;

    // 날짜 포맷
    const postDate = formatAskRelativeTime(post.createdAt);

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
        <div class="post-actions">
            <button class="action-btn" disabled>
                <i class="bx bx-heart"></i>
                <span class="like-count">${likeCount}</span>
            </button>
            <button class="action-btn" disabled>
                <i class="bx bx-comment"></i>
                <span class="comment-count">${commentCount}</span>
            </button>
        </div>
    `;

    return postDiv;
}

/**
 * Ask 상대 시간 포맷
 */
function formatAskRelativeTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
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
 * Ask HTML 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 전역 함수로 등록
window.removeAskImagePreview = removeAskImagePreview;

// DOM 로드 시 초기화는 제거 (main-session.js에서 관리)
// document.addEventListener('DOMContentLoaded', () => {
//     if (document.getElementById('ask-content')) {
//         initAsk();
//     }
// });

// 내보내기 (모듈 시스템 지원)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAsk,
        handleSendMessage,
        generateQuestionSummary,
        callGeminiAPI
    };
}

