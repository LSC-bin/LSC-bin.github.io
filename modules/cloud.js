/**
 * Cloud Page JavaScript
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * WordCloud 시각화 - 더미 데이터 모드
 * TODO: Firebase 연결 시
 */

// 전역 변수
let currentDataSource = 'all'; // all, activity, ask
let wordFrequency = {};

/**
 * 초기화 함수
 */
function initCloud() {
    // 데이터 소스 필터 이벤트
    const filterBtns = document.querySelectorAll('.filter-btn-cloud');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 활성 상태 변경
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 데이터 소스 변경
            currentDataSource = btn.getAttribute('data-source');
            loadCloudData();
        });
    });

    // 새로고침 버튼 이벤트
    const refreshBtn = document.getElementById('refresh-cloud');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadCloudData);
    }

    // 초기 로드
    loadCloudData();
}

/**
 * 클라우드 데이터 로드
 */
async function loadCloudData() {
    showLoading();

    try {
        let allText = '';

        // 데이터 소스에 따라 데이터 수집
        if (currentDataSource === 'all' || currentDataSource === 'activity') {
            const activityText = await collectActivityData();
            allText += activityText + ' ';
        }

        if (currentDataSource === 'all' || currentDataSource === 'ask') {
            const askText = await collectAskData();
            allText += askText + ' ';
        }

        // 단어 빈도 분석
        wordFrequency = analyzeWordFrequency(allText);

        // WordCloud 생성
        createWordCloud();

        // 통계 업데이트
        updateStatistics();

        // 키워드 목록 업데이트
        updateKeywordList();

        hideLoading();

    } catch (error) {
        console.error('데이터 로드 실패:', error);
        hideLoading();
        showError('데이터를 불러오는데 실패했습니다.');
    }
}

/**
 * Activity 데이터 수집
 */
async function collectActivityData() {
    try {
        const snapshot = await db.collection('posts').get();
        let text = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // 게시글 본문
            if (data.text) {
                text += data.text + ' ';
            }

            // 댓글
            if (data.comments && data.comments.length > 0) {
                data.comments.forEach(comment => {
                    if (comment.text) {
                        text += comment.text + ' ';
                    }
                });
            }
        });

        return text;
    } catch (error) {
        console.error('Activity 데이터 수집 실패:', error);
        return '';
    }
}

/**
 * Ask 데이터 수집
 */
async function collectAskData() {
    try {
        const snapshot = await db.collection('questions').get();
        let text = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // 질문 본문
            if (data.text) {
                text += data.text + ' ';
            }

            // 답변
            if (data.answer) {
                text += data.answer + ' ';
            }
        });

        return text;
    } catch (error) {
        console.error('Ask 데이터 수집 실패:', error);
        return '';
    }
}

/**
 * 단어 빈도 분석
 */
function analyzeWordFrequency(text) {
    // 한국어 불용어 (제외할 단어들)
    const stopwords = [
        '은', '는', '이', '가', '을', '를', '에', '의', '와', '과', '도', '로', '으로',
        '다', '요', '을까', '나', '까', '지만', '그런데', '그리고', '또', '이렇게',
        '그것', '이것', '저것', '여기', '거기', '저기', '이런', '그런', '저런',
        '한다', '한다고', '하였다', '하겠습니다', '했다', '합니다'
    ];

    // 특수문자 제거 및 소문자 변환
    const cleanText = text.replace(/[^\w\s가-힣]/g, ' ').toLowerCase();

    // 단어 분리
    const words = cleanText.split(/\s+/).filter(word => 
        word.length > 1 && !stopwords.includes(word)
    );

    // 빈도 계산
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // 2회 이상 나온 단어만 선택
    const filteredFrequency = {};
    Object.keys(frequency).forEach(word => {
        if (frequency[word] >= 2) {
            filteredFrequency[word] = frequency[word];
        }
    });

    return filteredFrequency;
}

/**
 * WordCloud 생성
 */
function createWordCloud() {
    const canvas = document.getElementById('wordcloud-canvas');
    if (!canvas) return;

    // 이전 캔버스 초기화
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // WordCloud2 형식으로 데이터 변환
    const wordList = Object.keys(wordFrequency).map(word => [
        word,
        wordFrequency[word]
    ]);

    if (wordList.length === 0) {
        canvas.width = 800;
        canvas.height = 400;
        ctx.font = '20px Poppins';
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.fillText('표시할 데이터가 없습니다', canvas.width / 2, canvas.height / 2);
        return;
    }

    // 캔버스 크기 설정
    const wrapper = canvas.parentElement;
    const width = wrapper.clientWidth - 80;
    const height = 500;

    canvas.width = width;
    canvas.height = height;

    // WordCloud2 설정
    const options = {
        list: wordList,
        gridSize: 8,
        weightFactor: function(size) {
            return Math.pow(size, 0.5) * width / 50;
        },
        fontFamily: 'Poppins, sans-serif',
        color: function() {
            const colors = [
                '#3C91E6', // blue
                '#FD7238', // orange
                '#FFCE26', // yellow
                '#DB504A', // red
                '#764BA2', // purple
                '#0A7C89', // teal
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        rotateRatio: 0.3,
        rotationSteps: 2,
        backgroundColor: 'transparent',
        drawOutOfBound: false,
        shrinkToFit: true
    };

    // WordCloud 생성
    WordCloud(canvas, options);
}

/**
 * 통계 업데이트
 */
function updateStatistics() {
    const totalComments = document.getElementById('total-comments');
    const totalPosts = document.getElementById('total-posts');
    const uniqueWords = document.getElementById('unique-words');
    const updateTime = document.getElementById('update-time');

    if (totalComments) {
        // 댓글 수 계산
        let commentCount = 0;
        Object.keys(wordFrequency).forEach(() => commentCount++);
        totalComments.textContent = commentCount;
    }

    if (totalPosts) {
        // 게시글 수 계산
        const wordList = Object.keys(wordFrequency);
        totalPosts.textContent = wordList.length;
    }

    if (uniqueWords) {
        // 고유 단어 수
        uniqueWords.textContent = Object.keys(wordFrequency).length;
    }

    if (updateTime) {
        // 업데이트 시간
        updateTime.textContent = '방금 전';
    }
}

/**
 * 키워드 목록 업데이트
 */
function updateKeywordList() {
    const keywordList = document.getElementById('keyword-list');
    if (!keywordList) return;

    // 빈도순으로 정렬
    const sortedWords = Object.keys(wordFrequency).sort((a, b) => 
        wordFrequency[b] - wordFrequency[a]
    ).slice(0, 20); // 상위 20개만

    keywordList.innerHTML = '';

    if (sortedWords.length === 0) {
        keywordList.innerHTML = '<p style="text-align: center; color: #999; padding: 1rem;">표시할 키워드가 없습니다.</p>';
        return;
    }

    sortedWords.forEach(word => {
        const item = document.createElement('div');
        item.className = 'keyword-item';
        item.innerHTML = `
            <span class="keyword-name">${word}</span>
            <span class="keyword-count">${wordFrequency[word]}</span>
        `;
        keywordList.appendChild(item);
    });
}

/**
 * 로딩 표시
 */
function showLoading() {
    const loading = document.getElementById('cloud-loading');
    const container = document.querySelector('.cloud-container');
    
    if (loading) {
        loading.style.display = 'block';
    }
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * 로딩 숨기기
 */
function hideLoading() {
    const loading = document.getElementById('cloud-loading');
    const container = document.querySelector('.cloud-container');
    
    if (loading) {
        loading.style.display = 'none';
    }
    if (container) {
        container.style.display = 'grid';
    }
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
    const canvas = document.getElementById('wordcloud-canvas');
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.font = '20px Poppins';
    ctx.fillStyle = '#DB504A';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// 윈도우 리사이즈 이벤트
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (Object.keys(wordFrequency).length > 0) {
            createWordCloud();
        }
    }, 300);
});

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // Cloud 페이지가 로드되었을 때만 초기화
    if (document.getElementById('cloud-content')) {
        initCloud();
    }
});

const CloudModule = {
    initCloud,
    loadCloudData,
    analyzeWordFrequency,
    createWordCloud
};

if (typeof window !== 'undefined') {
    window.CloudModule = Object.assign({}, window.CloudModule || {}, CloudModule);
    Object.assign(window, CloudModule);
}

export {
    initCloud,
    loadCloudData,
    analyzeWordFrequency,
    createWordCloud
};

export default CloudModule;

