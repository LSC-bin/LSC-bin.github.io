/**
 * chat.js
 * AI ClassBoard - 단체 채팅 + 워드클라우드 자동 생성
 * 실시간 단체 대화방 (최대 50명)
 */

// ===================================
// 데이터 구조
// ===================================
// TODO: Firebase 구조 고려
// sessions/{classId}/chat/messages/{messageId}
// { text, sender, timestamp }

let chatMessagesData = [
    { id: 1, sender: "학생A", text: "오늘 수업 진짜 재밌었어요!", timestamp: new Date() },
    { id: 2, sender: "학생B", text: "AI가 어렵지만 흥미로워요.", timestamp: new Date() },
    { id: 3, sender: "학생C", text: "데이터 편향이 문제인 것 같아요.", timestamp: new Date() }
];

// 현재 사용자 정보
const currentUser = {
    id: 'user_' + Date.now(),
    name: localStorage.getItem('userName') || '익명'
};

// DOM 요소
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");

// localStorage에서 채팅 불러오기
function loadChatHistory() {
    const saved = localStorage.getItem('groupChatHistory');
    if (saved) {
        chatMessagesData = JSON.parse(saved);
        renderChat();
    } else {
        // 초기 채팅 렌더링
        renderChat();
    }
}

// 채팅 저장
function saveChatHistory() {
    localStorage.setItem('groupChatHistory', JSON.stringify(chatMessagesData));
}

// ===================================
// 채팅 UI 렌더링
// ===================================
function renderChat() {
    chatMessages.innerHTML = "";
    
    if (chatMessagesData.length === 0) {
        chatMessages.innerHTML = `
            <div class="empty-state">
                <i class="bx bxs-chat"></i>
                <p>아직 메시지가 없습니다</p>
                <p style="font-size: 0.9rem;">첫 메시지를 보내보세요!</p>
            </div>
        `;
        renderWordCloud();
        return;
    }
    
    chatMessagesData.forEach(msg => {
        const div = document.createElement("div");
        const isSelf = msg.sender === currentUser.name || msg.sender === "나";
        div.className = `chat-bubble ${isSelf ? "self" : "other"}`;
        
        if (isSelf) {
            div.textContent = msg.text;
        } else {
            div.textContent = `${escapeHtml(msg.sender)}: ${escapeHtml(msg.text)}`;
        }
        
        chatMessages.appendChild(div);
    });
    
    scrollToBottom();
    renderWordCloud();
}

// ===================================
// 메시지 전송
// ===================================
sendChat.addEventListener("click", handleSendMessage);

// 엔터 키로 전송
chatInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

function handleSendMessage() {
    const val = chatInput.value.trim();
    if (!val) return;
    
    chatMessagesData.push({
        id: Date.now(),
        sender: currentUser.name,
        text: val,
        timestamp: new Date()
    });
    
    chatInput.value = "";
    saveChatHistory();
    renderChat();
    
    // 테스트용 더미 응답
    setTimeout(() => {
        const fakeUsers = [
            "학생A", "학생B", "학생C", "학생D", "학생E",
            "김철수", "이영희", "박민수", "정수진", "최도현"
        ];
        const fakeResponses = [
            "좋은 의견이에요!",
            "공감합니다!",
            "정말 흥미롭네요!",
            "그게 궁금했어요!",
            "맞아요!",
            "흥미로운 주제네요",
            "좋은 질문입니다",
            "더 자세히 말씀해주세요"
        ];
        
        const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const randomResponse = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
        
        chatMessagesData.push({
            id: Date.now(),
            sender: randomUser,
            text: randomResponse,
            timestamp: new Date()
        });
        
        saveChatHistory();
        renderChat();
    }, 1200);
}

// ===================================
// 워드클라우드
// ===================================
function renderWordCloud() {
    const canvas = document.getElementById("wordCloudCanvas");
    if (!canvas || typeof WordCloud === 'undefined') {
        return;
    }

    // 모든 메시지에서 단어 추출
    const allText = chatMessagesData.map(m => m.text).join(' ');
    const words = allText.split(/\s+/).filter(word => word.length > 1);
    
    // 한글 불용어 제거
    const stopWords = ['것', '거', '이', '가', '을', '를', '에', '의', '로', '와', '과', '은', '는', '한', '하', '수', '도', '있', '없', '게', '로', '개', '번', '될', '데', '전', '후', '서', '만', '겠', '습니', '입니', '하세', '겠습', '입니다', '합니다', '하세요', '습니다', '네요', '아요', '어요', '이요', '니다', '게요', '지요', '세요', '든요', '래요', '해요', '그게', '그런', '그냥', '저도', '저는', '제가'];
    
    // 단어 빈도 계산
    const wordCount = {};
    words.forEach(w => {
        w = w.trim().toLowerCase().replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, '');
        if (w.length >= 2 && !stopWords.includes(w)) {
            wordCount[w] = (wordCount[w] || 0) + 1;
        }
    });
    
    const wordList = Object.entries(wordCount);
    
    if (wordList.length === 0) {
        return;
    }
    
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

// ===================================
// 유틸리티
// ===================================
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// 초기화
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    
    // 윈도우 리사이즈 시 WordCloud 재렌더링
    window.addEventListener('resize', () => {
        setTimeout(renderWordCloud, 300);
    });
});

