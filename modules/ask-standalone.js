/**
 * ask-standalone.js
 * AI ClassBoard - Ask 페이지 독립 실행 버전
 * WordCloud + 실시간 채팅 통합
 * 
 * 주요 기능:
 * 1. WordCloud 폰트 크기 고정 (사이드바 상태와 무관)
 * 2. 리사이저로 패널 크기 조절 가능
 */

// ===================================
// WordCloud - 고정 폰트 크기
// ===================================
import { AppUtils } from '../utils/app-utils.js';

const AppUtilsRef = window.AppUtils || AppUtils;
const {
    escapeHtml: escapeHtmlUtil = AppUtils.escapeHtml,
    getStoredData: getStoredDataUtil = AppUtils.getStoredData,
    setStoredData: setStoredDataUtil = AppUtils.setStoredData
} = AppUtilsRef;

const escapeHtml = (text) => escapeHtmlUtil(text);
const getStoredData = (key, fallback) => getStoredDataUtil(key, fallback);
const setStoredData = (key, value) => setStoredDataUtil(key, value);

let wordCloudWords = [];

// 고정 폰트 크기 상수
const WORDCLOUD_CONFIG = {
    baseFontSize: 40,    // 기본 폰트 크기 (고정)
    minFontSize: 16,     // 최소 폰트 크기
    maxFontSize: 120,    // 최대 폰트 크기
    minWidth: 400,       // 최소 캔버스 너비
    minHeight: 400       // 최소 캔버스 높이
};

function renderWordCloud() {
    const canvas = document.getElementById("wordCloudCanvas");
    if (!canvas || typeof WordCloud === 'undefined') {
        return;
    }

    // 채팅 메시지 텍스트에서 단어 추출
    const allText = chatHistory.map(msg => msg.text).join(' ');
    const words = allText.split(/\s+/).filter(word => word.length > 1);
    
    // 한글 불용어 제거 (최소한만)
    const stopWords = ['것', '이', '가', '을', '를', '에', '의', '은', '는'];
    
    // 단어 빈도 계산
    const wordCount = {};
    words.forEach(w => {
        w = w.trim().replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, '');
        if (w.length >= 2 && !stopWords.includes(w)) {
            const lowerW = w.toLowerCase();
            wordCount[lowerW] = (wordCount[lowerW] || 0) + 1;
        }
    });
    
    // 빈도수 순으로 정렬하고 상위 30개만 선택
    const wordList = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
    
    // 컨테이너 크기 가져오기 - 실제 카드 크기에 맞춰 렌더링 (여백 고려)
    const container = canvas.parentElement;
    let containerWidth = WORDCLOUD_CONFIG.minWidth;
    let containerHeight = WORDCLOUD_CONFIG.minHeight;
    
    // 캔버스의 실제 렌더링 가능 영역 계산 (margin 1.5rem 좌우 제거)
    if (container && canvas) {
        const containerRect = container.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // CSS margin 1.5rem (좌우 각각)을 고려한 실제 사용 가능한 너비
        const marginLeftRight = 24; // 1.5rem = 24px (일반적으로)
        const availableWidth = canvasRect.width || (containerRect.width - (marginLeftRight * 2));
        const availableHeight = canvasRect.height || containerRect.height;
        
        containerWidth = Math.max(availableWidth || WORDCLOUD_CONFIG.minWidth, WORDCLOUD_CONFIG.minWidth);
        containerHeight = Math.max(availableHeight || WORDCLOUD_CONFIG.minHeight, WORDCLOUD_CONFIG.minHeight);
    }
    
    // 캔버스를 실제 사용 가능한 크기로 설정 (여백 제외된 실제 렌더링 영역)
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // CSS는 부모 크기에 맞춰 자동 조정되도록 유지 (margin이 적용된 상태)
    canvas.style.imageRendering = 'auto';
    
    if (wordList.length === 0) {
        // 빈 상태일 때 기본 메시지 표시 (중앙 정렬)
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999';
        ctx.font = '16px Noto Sans KR';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('채팅을 시작하면 WordCloud가 표시됩니다', canvas.width / 2, canvas.height / 2);
        // 페이드인 애니메이션
        canvas.style.opacity = '0';
        setTimeout(() => {
            canvas.style.opacity = '1';
        }, 100);
        return;
    }
    
    // 회색, 파랑, 초록 계열 팔레트
    const colors = [
        '#64748B', '#475569', '#334155', '#1E293B',  // 회색 계열
        '#3B82F6', '#2563EB', '#1E40AF', '#1E3A8A',  // 파랑 계열
        '#10B981', '#059669', '#047857', '#065F46',  // 초록 계열
        '#0EA5E9', '#0284C7', '#0369A1', '#075985',  // 하늘 계열
        '#6366F1', '#4F46E5', '#4338CA', '#3730A3'   // 보라 계열
    ];
    
    // 부드러운 페이드인 애니메이션
    if (canvas.style.opacity === '' || canvas.style.opacity === '1') {
        canvas.style.opacity = '0';
    }
    canvas.style.transition = 'opacity 0.5s ease-in';
    
    // WordCloud 렌더링 - 카드 크기에 맞춰 렌더링하고 항상 중앙 정렬
    // 기준 크기 대비 비율 계산 (일정한 폰트 크기 유지)
    const baseCanvasWidth = 800;
    const baseCanvasHeight = 600;
    const widthRatio = containerWidth / baseCanvasWidth;
    const heightRatio = containerHeight / baseCanvasHeight;
    const avgRatio = Math.min(widthRatio, heightRatio); // 비율 유지
    
    WordCloud(canvas, {
        list: wordList,
        gridSize: Math.round(16 * avgRatio), // 크기에 따라 그리드 조정 (일정한 밀도 유지)
        weightFactor: function (size) {
            // 일정한 폰트 크기 범위 사용 (카드 크기에 따라 스케일 조정)
            const normalizedSize = Math.max(
                WORDCLOUD_CONFIG.minFontSize * avgRatio, 
                Math.min(WORDCLOUD_CONFIG.maxFontSize * avgRatio, size * WORDCLOUD_CONFIG.baseFontSize * avgRatio)
            );
            return normalizedSize;
        },
        ellipticity: 1, // 원형으로 유지 (가로/세로 완전히 동일)
        fontFamily: 'Noto Sans KR, Poppins, Arial, sans-serif',
        minSize: WORDCLOUD_CONFIG.minFontSize * avgRatio,
        color: function(word, weight, fontSize, distance, theta) {
            const charCode = word.charCodeAt(0);
            const colorIndex = charCode % colors.length;
            return colors[colorIndex];
        },
        rotateRatio: 0, // 회전 없음
        rotationSteps: 0,
        backgroundColor: 'transparent',
        drawOutOfBound: false, // 경계 내에서만 렌더링
        shrinkToFit: true, // 크기 조정하여 중앙 정렬
        // 커스텀 draw 함수로 배경 박스 추가
        draw: function(ctx, word, weight, fontSize, position, distance, theta) {
            // 배경 박스 그리기
            const textMetrics = ctx.measureText(word);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;
            const padding = 6;
            const cornerRadius = 12;
            
            const x = position[0] - textWidth / 2 - padding;
            const y = position[1] - textHeight / 2 - padding;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = textHeight + padding * 2;
            
            // 배경 색상 (텍스트 색상의 옅은 버전)
            const charCode = word.charCodeAt(0);
            const colorIndex = charCode % colors.length;
            const bgColor = convertToRgba(colors[colorIndex], 0.15);
            
            // 둥근 모서리 박스 그리기 (직접 구현)
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.moveTo(x + cornerRadius, y);
            ctx.lineTo(x + boxWidth - cornerRadius, y);
            ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + cornerRadius);
            ctx.lineTo(x + boxWidth, y + boxHeight - cornerRadius);
            ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - cornerRadius, y + boxHeight);
            ctx.lineTo(x + cornerRadius, y + boxHeight);
            ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - cornerRadius);
            ctx.lineTo(x, y + cornerRadius);
            ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
            ctx.closePath();
            ctx.fill();
            
            // 텍스트 그리기
            ctx.fillStyle = colors[colorIndex];
            ctx.fillText(word, position[0], position[1]);
        }
    });
    
    // 자연스러운 페이드인 애니메이션
    requestAnimationFrame(() => {
        setTimeout(() => {
            canvas.style.opacity = '1';
        }, 100);
    });
}

// HEX 색상을 RGBA로 변환
function convertToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ===================================
// 실시간 채팅
// ===================================
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");

let chatHistory = [];

// localStorage에서 채팅 불러오기
function loadChatHistory() {
    // URL 파라미터에서 sessionId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    
    if (sessionId) {
        // 세션별 채팅 불러오기
        const saved = getStoredData(`session_messages_${sessionId}`, null);
        if (Array.isArray(saved)) {
            chatHistory = saved;
            renderChatMessages();
        } else {
            initializeDummyDataForSession(sessionId);
        }
    } else {
        // 전체 채팅 불러오기 (기존 방식)
        const saved = getStoredData('askChatHistory', null);
        if (Array.isArray(saved)) {
            chatHistory = saved;
            renderChatMessages();
        } else {
            initializeDummyData();
        }
    }
}

// 더미 채팅 데이터 초기화 (전체 채팅용)
function initializeDummyData() {
    chatHistory = [
        { text: 'AI 수업 시작합니다. 모두 환영합니다!', sender: 'other', author: '담임선생님', timestamp: new Date() },
        { text: '오늘은 인공지능의 역사와 미래에 대해 토론해봅시다', sender: 'other', author: '선생님', timestamp: new Date() },
        { text: 'AI가 일상생활에서 어떻게 사용되고 있는지 생각해볼까요?', sender: 'user', author: '학생1', timestamp: new Date() },
        { text: '아마존 알렉사, 구글 어시스턴트 같은 음성 인식이 좋은 예시가 될 것 같아요', sender: 'other', author: '학생2', timestamp: new Date() },
        { text: '음성 인식 말고도 얼굴 인식이나 자율주행 자동차도 있죠', sender: 'other', author: '학생3', timestamp: new Date() },
        { text: '맞아요! 자율주행 자동차는 딥러닝 기술을 사용해서 사고를 줄이려고 노력하고 있어요', sender: 'other', author: '학생4', timestamp: new Date() }
    ];
    saveChatHistory();
    renderChatMessages();
}

// 세션별 더미 채팅 데이터 초기화
function initializeDummyDataForSession(sessionId) {
    chatHistory = [
        { text: '안녕하세요! 질문이나 토론이 있으시면 자유롭게 말씀해주세요.', sender: 'other', author: '담임선생님', timestamp: new Date(Date.now() - 60000 * 5) }
    ];
    saveChatHistoryForSession(sessionId);
    renderChatMessages();
}

// 채팅 저장
function saveChatHistory() {
    // URL 파라미터에서 sessionId 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    
    if (sessionId) {
        // 세션별 채팅 저장
        saveChatHistoryForSession(sessionId);
    } else {
        // 전체 채팅 저장
    setStoredData('askChatHistory', chatHistory);
    }
}

// 세션별 채팅 저장
function saveChatHistoryForSession(sessionId) {
    setStoredData(`session_messages_${sessionId}`, chatHistory);
}

// 채팅 메시지 렌더링 - 카카오톡 단톡방 스타일
function renderChatMessages() {
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    if (chatHistory.length === 0) {
        chatMessages.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #999;">
                <i class="bx bxs-chat" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; display: block;"></i>
                <p>아직 메시지가 없습니다.</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">첫 메시지를 보내보세요!</p>
            </div>
        `;
        renderWordCloud();
        return;
    }
    
    chatHistory.forEach(msg => {
        const msgDiv = document.createElement("div");
        const isSelf = msg.sender === "self" || msg.sender === "user";
        msgDiv.className = `chat-bubble ${isSelf ? 'self' : 'other'}`;
        
        if (isSelf) {
            msgDiv.textContent = msg.text;
        } else {
            msgDiv.innerHTML = `<strong>${escapeHtml(msg.author || '익명')}:</strong> ${escapeHtml(msg.text)}`;
        }
        
        chatMessages.appendChild(msgDiv);
    });
    
    scrollToBottom();
    renderWordCloud();
}

// 메시지 추가
function addChatMessage(text, sender = "self", author = null) {
    const userName = getUserName();
    chatHistory.push({
        text: text,
        sender: sender,
        author: sender === "self" ? userName : (author || '익명'),
        timestamp: new Date()
    });
    saveChatHistory();
    renderChatMessages();
}

// 하단 스크롤
function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 채팅 전송
if (sendChat && chatInput) {
    sendChat.addEventListener("click", () => {
        const val = chatInput.value.trim();
        if (!val) return;
        
        addChatMessage(val, "self");
        chatInput.value = "";
    });

    // 엔터 키로 전송
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChat.click();
        }
    });
}

// ===================================
// 유틸리티
// ===================================
function getUserName() {
    const userName = localStorage.getItem('userName');
    return userName || '익명';
}

// ===================================
// 초기화
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    
    // ResizeObserver를 사용하여 WordCloud 컨테이너 크기 변경 감지 (자연스러운 애니메이션)
    const canvas = document.getElementById("wordCloudCanvas");
    if (canvas && canvas.parentElement) {
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(entries => {
            // 자연스러운 애니메이션을 위한 debounce
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // 부드러운 페이드 아웃 -> 재렌더링 -> 페이드 인
                if (canvas.style.opacity !== '0' && canvas.style.opacity !== '0.3') {
                    canvas.style.transition = 'opacity 0.3s ease-out';
                    canvas.style.opacity = '0.3';
                    
                    // 재렌더링 후 페이드 인
                    setTimeout(() => {
                        renderWordCloud();
                        canvas.style.transition = 'opacity 0.5s ease-in';
                        setTimeout(() => {
                            canvas.style.opacity = '1';
                        }, 50);
                    }, 200);
                } else {
                    renderWordCloud();
                }
            }, 150);
        });
        
        resizeObserver.observe(canvas.parentElement);
    }
    
    // 윈도우 리사이즈 이벤트도 처리 (debounce)
    let windowResizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(windowResizeTimeout);
        windowResizeTimeout = setTimeout(() => {
            renderWordCloud();
        }, 300);
    });
});
