/**
 * Quiz Page JavaScript
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * AI 기반 자동 채점 시스템 - 더미 모드
 * TODO: Firebase & OpenAI API 연결 시
 */

// 전역 변수
let currentQuiz = null;
let currentAnswers = {};
let quizResults = [];

// OpenAI API 키 (실제 API 키로 교체 필요)
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Quiz 기능 초기화 (sessionId 기반)
 */
function initQuizForSession(sessionId, readOnlyMode = false) {
    if (!sessionId) {
        console.error('sessionId가 필요합니다.');
        return;
    }

    // 기존 initQuiz 함수 호출
    initQuiz();
    
    // sessionId 기반 퀴즈 불러오기
    loadQuizListForSession(sessionId);
    
    // 보기 전용 모드 적용
    if (readOnlyMode) {
        applyReadOnlyModeToQuiz();
    }
}

/**
 * Quiz 탭에 보기 전용 모드 적용
 */
function applyReadOnlyModeToQuiz() {
    // 퀴즈 카드 클릭 비활성화
    setTimeout(() => {
        const quizCards = document.querySelectorAll('.quiz-card');
        quizCards.forEach(card => {
            card.style.opacity = '0.7';
            card.style.cursor = 'not-allowed';
            card.style.pointerEvents = 'none';
            
            // 카드에 보기 전용 표시 추가
            const badge = document.createElement('div');
            badge.className = 'read-only-badge';
            badge.innerHTML = '<i class="bx bx-lock-alt"></i> 이전 수업 - 보기 전용';
            badge.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(255, 152, 0, 0.9); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; z-index: 10;';
            card.style.position = 'relative';
            card.appendChild(badge);
        });
    }, 500);
    
    // 제출 버튼 비활성화
    const submitBtn = document.getElementById('submit-quiz-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
    }
    
    // 퀴즈 답변 입력 필드 비활성화
    setTimeout(() => {
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        const textInputs = document.querySelectorAll('input[type="text"]');
        
        [...radioInputs, ...textInputs].forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.6';
            input.style.cursor = 'not-allowed';
        });
    }, 500);
}

/**
 * 초기화 함수 (기본 호환성 유지)
 */
function initQuiz() {
    // 샘플 퀴즈 데이터
    loadQuizList();

    // 제출 버튼 이벤트
    const submitBtn = document.getElementById('submit-quiz-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmitQuiz);
    }

    // 이전 버튼 이벤트
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', goBackToQuizList);
    }
}

/**
 * 퀴즈 목록 로드 (sessionId 기반)
 */
function loadQuizListForSession(sessionId) {
    // localStorage에서 해당 sessionId의 퀴즈 불러오기
    const storedQuizzes = JSON.parse(localStorage.getItem(`session_quizzes_${sessionId}`) || '[]');
    
    if (storedQuizzes.length === 0) {
        // 기본 퀴즈 데이터
        const quizList = [
            {
                id: `quiz_${sessionId}_1`,
                title: '디지털 윤리 기초 퀴즈',
                description: '디지털 환경에서의 윤리적 의사결정에 대한 기본 퀴즈입니다.',
                questionCount: 5,
                difficulty: '쉬움',
                timeLimit: 30
            }
        ];
        renderQuizList(quizList);
    } else {
        renderQuizList(storedQuizzes);
    }
}

/**
 * 퀴즈 목록 로드 (기본 호환성 유지)
 */
function loadQuizList() {
    // session.html에서는 loadQuizListForSession 사용
    const sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    if (sessionId) {
        loadQuizListForSession(sessionId);
        return;
    }

    // index.html에서 사용할 경우 기존 로직 유지
    const quizList = [
        {
            id: 'quiz1',
            title: '디지털 윤리 기초 퀴즈',
            description: '디지털 환경에서의 윤리적 의사결정에 대한 기본 퀴즈입니다.',
            questionCount: 5,
            difficulty: '쉬움',
            timeLimit: 30
        },
        {
            id: 'quiz2',
            title: 'AI 기술 이해도 테스트',
            description: '인공지능의 기본 개념과 활용에 대한 종합 퀴즈입니다.',
            questionCount: 10,
            difficulty: '중급',
            timeLimit: 45
        }
    ];

    renderQuizList(quizList);
}

/**
 * 퀴즈 목록 렌더링
 */
function renderQuizList(quizzes) {
    const quizListContainer = document.getElementById('quiz-list');
    if (!quizListContainer) return;

    quizListContainer.innerHTML = '';

    quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.onclick = () => startQuiz(quiz.id);

        quizCard.innerHTML = `
            <div class="quiz-card-header">
                <div>
                    <div class="quiz-card-title">${quiz.title}</div>
                    <div class="quiz-card-badge">${quiz.difficulty}</div>
                </div>
            </div>
            <div class="quiz-card-description">${quiz.description}</div>
            <div class="quiz-card-meta">
                <div class="quiz-meta-item">
                    <i class="bx bx-list-ol"></i>
                    <span>${quiz.questionCount}문제</span>
                </div>
                <div class="quiz-meta-item">
                    <i class="bx bx-time"></i>
                    <span>${quiz.timeLimit}분</span>
                </div>
            </div>
        `;

        quizListContainer.appendChild(quizCard);
    });
}

/**
 * 퀴즈 시작
 */
function startQuiz(quizId) {
    currentQuiz = getQuizData(quizId);
    currentAnswers = {};

    // UI 전환
    document.getElementById('quiz-list').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    // 퀴즈 정보 표시
    document.getElementById('quiz-title').textContent = currentQuiz.title;
    document.getElementById('total-questions').textContent = currentQuiz.questions.length;

    // 문제 렌더링
    renderQuestions();
}

/**
 * 퀴즈 데이터 가져오기
 */
function getQuizData(quizId) {
    // 샘플 퀴즈 데이터
    const quizzes = {
        quiz1: {
            title: '디지털 윤리 기초 퀴즈',
            questions: [
                {
                    id: 1,
                    type: 'multiple',
                    text: '디지털 윤리란 무엇인가요?',
                    options: [
                        { text: '디지털 기술 사용에 대한 도덕적 원칙', correct: true },
                        { text: '인터넷 사용 방법', correct: false },
                        { text: '컴퓨터 프로그래밍 규칙', correct: false },
                        { text: '하드웨어 관리 원칙', correct: false }
                    ]
                },
                {
                    id: 2,
                    type: 'ox',
                    text: '온라인에서 타인의 개인정보를 무단으로 공유하는 것은 윤리적입니다.',
                    correctAnswer: 'X'
                },
                {
                    id: 3,
                    type: 'short',
                    text: '디지털 플랫폼에서 자신을 표현하는 과정을 한 단어로 말하면?',
                    correctAnswer: '자기표현'
                },
                {
                    id: 4,
                    type: 'multiple',
                    text: '사이버 불링을 방지하기 위해 해야 할 일은?',
                    options: [
                        { text: '증거를 모으고 신고하기', correct: true },
                        { text: '보복하기', correct: false },
                        { text: '무시하기', correct: false },
                        { text: '동료에게만 말하기', correct: false }
                    ]
                },
                {
                    id: 5,
                    type: 'ox',
                    text: '인공지능 기술은 모든 영역에서 편향성이 없다.',
                    correctAnswer: 'X'
                }
            ]
        },
        quiz2: {
            title: 'AI 기술 이해도 테스트',
            questions: [
                {
                    id: 1,
                    type: 'multiple',
                    text: '머신러닝의 기본 개념은?',
                    options: [
                        { text: '데이터로부터 학습하는 알고리즘', correct: true },
                        { text: '하드코딩된 규칙', correct: false },
                        { text: '수동 프로그래밍', correct: false },
                        { text: '전통적 데이터베이스', correct: false }
                    ]
                },
                {
                    id: 2,
                    type: 'ox',
                    text: '딥러닝은 머신러닝의 한 종류입니다.',
                    correctAnswer: 'O'
                },
                {
                    id: 3,
                    type: 'short',
                    text: 'AI가 특정 태스크에서 인간보다 뛰어난 성능을 보이는 현상을 무엇이라고 하나요?',
                    correctAnswer: '강인공지능'
                }
            ]
        }
    };

    return quizzes[quizId];
}

/**
 * 문제 렌더링
 */
function renderQuestions() {
    const questionsContainer = document.getElementById('quiz-questions');
    if (!questionsContainer || !currentQuiz) return;

    questionsContainer.innerHTML = '';

    currentQuiz.questions.forEach(question => {
        const questionElement = createQuestionElement(question);
        questionsContainer.appendChild(questionElement);
    });
}

/**
 * 문제 요소 생성
 */
function createQuestionElement(question) {
    const div = document.createElement('div');
    div.className = 'question-card-quiz';

    let questionContent = '';

    if (question.type === 'multiple') {
        questionContent = `
            <div class="question-title">
                <span class="question-number">Q${question.id}.</span>
                <span class="question-type multiple">객관식</span>
            </div>
            <div class="question-text">${question.text}</div>
            <div class="options-list">
                ${question.options.map((option, index) => `
                    <label class="option-item">
                        <input type="radio" name="q${question.id}" value="${index}" 
                               ${currentAnswers[question.id] === index ? 'checked' : ''}>
                        <span>${option.text}</span>
                    </label>
                `).join('')}
            </div>
        `;
    } else if (question.type === 'ox') {
        questionContent = `
            <div class="question-title">
                <span class="question-number">Q${question.id}.</span>
                <span class="question-type ox">OX</span>
            </div>
            <div class="question-text">${question.text}</div>
            <div class="ox-options">
                <div class="ox-option ${currentAnswers[question.id] === 'O' ? 'selected-o' : ''}" 
                     onclick="selectOX(${question.id}, 'O')">O</div>
                <div class="ox-option ${currentAnswers[question.id] === 'X' ? 'selected-x' : ''}" 
                     onclick="selectOX(${question.id}, 'X')">X</div>
            </div>
        `;
    } else if (question.type === 'short') {
        questionContent = `
            <div class="question-title">
                <span class="question-number">Q${question.id}.</span>
                <span class="question-type short">단답형</span>
            </div>
            <div class="question-text">${question.text}</div>
            <input type="text" class="short-answer-input" 
                   value="${currentAnswers[question.id] || ''}"
                   onchange="setShortAnswer(${question.id}, this.value)"
                   placeholder="정답을 입력하세요">
        `;
    }

    div.innerHTML = questionContent;

    // 객관식 선택 이벤트
    div.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentAnswers[question.id] = parseInt(e.target.value);
        });
    });

    return div;
}

/**
 * OX 선택
 */
function selectOX(questionId, answer) {
    currentAnswers[questionId] = answer;
    
    // UI 업데이트
    const questionCard = event.target.closest('.question-card-quiz');
    const oxOptions = questionCard.querySelectorAll('.ox-option');
    oxOptions.forEach(option => {
        option.classList.remove('selected-o', 'selected-x');
    });
    
    if (answer === 'O') {
        event.target.classList.add('selected-o');
    } else {
        event.target.classList.add('selected-x');
    }
}

/**
 * 단답형 답변 설정
 */
function setShortAnswer(questionId, answer) {
    currentAnswers[questionId] = answer;
}

/**
 * 퀴즈 제출 처리
 */
async function handleSubmitQuiz() {
    if (!currentQuiz) return;

    // 답변 검증
    const totalQuestions = currentQuiz.questions.length;
    const answeredQuestions = Object.keys(currentAnswers).length;

    if (answeredQuestions < totalQuestions) {
        const confirmed = await showConfirm(`${totalQuestions - answeredQuestions}개의 문제가 남았습니다. 그래도 제출하시겠습니까?`, 'warning');
        if (!confirmed) {
            return;
        }
    }

    // 채점
    quizResults = gradeQuiz(currentQuiz, currentAnswers);

    // sessionId 가져오기
    const sessionId = typeof getCurrentSessionId === 'function' ? getCurrentSessionId() : null;
    
    // localStorage에 저장 (sessionId 기반)
    if (sessionId) {
        const quizResult = {
            quizId: currentQuiz.id,
            quizTitle: currentQuiz.title,
            results: quizResults,
            score: Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100),
            submittedAt: new Date().toISOString()
        };
        
        const storedResults = JSON.parse(localStorage.getItem(`session_quiz_results_${sessionId}`) || '[]');
        storedResults.push(quizResult);
        localStorage.setItem(`session_quiz_results_${sessionId}`, JSON.stringify(storedResults));
        
        // 저장 토스트 메시지
        if (typeof showToast === 'function') {
            showToast('퀴즈 결과가 저장되었습니다.', 'success');
        }
    }

    // 결과 페이지 표시
    showResults();

    // AI 피드백 생성
    await generateAIFeedback();
}

/**
 * 퀴즈 채점
 */
function gradeQuiz(quiz, answers) {
    const results = [];

    quiz.questions.forEach(question => {
        const userAnswer = answers[question.id];
        let isCorrect = false;
        let correctAnswer = '';

        if (question.type === 'multiple') {
            const selectedOption = question.options[userAnswer];
            isCorrect = selectedOption && selectedOption.correct;
            correctAnswer = question.options.find(opt => opt.correct)?.text;
        } else if (question.type === 'ox') {
            isCorrect = userAnswer === question.correctAnswer;
            correctAnswer = question.correctAnswer;
        } else if (question.type === 'short') {
            // 단답형은 대소문자 무시하고 비교
            isCorrect = userAnswer && 
                       userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
            correctAnswer = question.correctAnswer;
        }

        results.push({
            question: question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        });
    });

    return results;
}

/**
 * 결과 표시
 */
function showResults() {
    // UI 전환
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';

    // 통계 계산
    const correctCount = quizResults.filter(r => r.isCorrect).length;
    const incorrectCount = quizResults.filter(r => !r.isCorrect).length;
    const totalCount = quizResults.length;
    const score = Math.round((correctCount / totalCount) * 100);

    // 결과 업데이트
    document.getElementById('final-score').textContent = score;
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('incorrect-count').textContent = incorrectCount;
    document.getElementById('total-count').textContent = totalCount;

    // 결과 상세 렌더링
    renderResultDetails();
}

/**
 * 결과 상세 렌더링
 */
function renderResultDetails() {
    const container = document.getElementById('result-questions');
    if (!container) return;

    container.innerHTML = '';

    quizResults.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = `result-question-item ${result.isCorrect ? 'correct' : 'incorrect'}`;

        let answerDisplay = '';
        if (result.question.type === 'multiple') {
            const userOption = result.question.options[result.userAnswer];
            answerDisplay = `
                <div class="user-answer">
                    <strong>제출한 답:</strong> ${userOption ? userOption.text : '미답변'}
                </div>
                ${!result.isCorrect ? `<div class="correct-answer">
                    <strong>정답:</strong> ${result.correctAnswer}
                </div>` : ''}
            `;
        } else if (result.question.type === 'ox' || result.question.type === 'short') {
            answerDisplay = `
                <div class="user-answer">
                    <strong>제출한 답:</strong> ${result.userAnswer || '미답변'}
                </div>
                ${!result.isCorrect ? `<div class="correct-answer">
                    <strong>정답:</strong> ${result.correctAnswer}
                </div>` : ''}
            `;
        }

        div.innerHTML = `
            <div class="question-title">
                <span class="question-number">Q${index + 1}.</span>
                <span class="result-status ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <i class="bx ${result.isCorrect ? 'bx-check-circle' : 'bx-x-circle'}"></i>
                    ${result.isCorrect ? '정답' : '오답'}
                </span>
            </div>
            <div class="question-text">${result.question.text}</div>
            ${answerDisplay}
        `;

        container.appendChild(div);
    });
}

/**
 * AI 피드백 생성
 */
async function generateAIFeedback() {
    const feedbackContent = document.getElementById('feedback-content');
    if (!feedbackContent) return;

    try {
        // 피드백 요청 데이터 구성
        const quizInfo = `
            퀴즈 제목: ${currentQuiz.title}
            총 문제 수: ${quizResults.length}
            정답 수: ${quizResults.filter(r => r.isCorrect).length}
            오답 수: ${quizResults.filter(r => !r.isCorrect).length}
            점수: ${Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100)}점
        `;

        const wrongQuestions = quizResults
            .filter(r => !r.isCorrect)
            .map(r => `- ${r.question.text}`)
            .join('\n');

        const prompt = `다음은 학생의 퀴즈 결과입니다:

${quizInfo}

${wrongQuestions ? `틀린 문제들:\n${wrongQuestions}` : ''}

학생에게 격려와 함께 구체적이고 도움이 되는 피드백을 제공해주세요. 
피드백은 한국어로 3-4문장 정도로 간결하게 작성해주세요.`;

        // OpenAI API 호출 (실제 구현 시)
        // const response = await fetch(OPENAI_API_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${OPENAI_API_KEY}`
        //     },
        //     body: JSON.stringify({
        //         model: 'gpt-3.5-turbo',
        //         messages: [
        //             { role: 'system', content: '당신은 교육 전문가입니다.' },
        //             { role: 'user', content: prompt }
        //         ],
        //         temperature: 0.7,
        //         max_tokens: 500
        //     })
        // });

        // const data = await response.json();
        // const feedback = data.choices[0].message.content;

        // 임시 피드백 (실제 API 통합 전)
        const feedback = generateMockFeedback(quizResults);

        feedbackContent.innerHTML = `<p>${feedback}</p>`;

    } catch (error) {
        console.error('AI 피드백 생성 실패:', error);
        feedbackContent.innerHTML = '<p>피드백 생성에 실패했습니다. 죄송합니다.</p>';
    }
}

/**
 * 임시 피드백 생성 (OpenAI API 없이)
 */
function generateMockFeedback(results) {
    const score = Math.round((results.filter(r => r.isCorrect).length / results.length) * 100);
    const wrongCount = results.filter(r => !r.isCorrect).length;

    if (score === 100) {
        return '완벽합니다! 모든 문제를 정확하게 풀었습니다. 이와 같은 성실한 자세를 유지하시면 더욱 훌륭한 학습 성과를 얻을 수 있을 것입니다.';
    } else if (score >= 80) {
        return `훌륭한 결과입니다! 대부분의 문제를 정확하게 해결하셨네요. ${wrongCount}개의 문제를 다시 복습하시면 더욱 견고한 학습 기반을 쌓을 수 있을 것입니다.`;
    } else if (score >= 60) {
        return `좋은 시도였습니다! 기본 개념은 이해하고 계신 것 같습니다. 틀린 ${wrongCount}개의 문제를 중심으로 복습하시기 바랍니다. 관련 개념을 다시 확인하며 학습하면 실력이 향상될 것입니다.`;
    } else {
        return `노력하신 흔적이 보입니다. 아직 몇 가지 개념을 더 공부하시면 좋겠습니다. 틀린 문제들을 중심으로 교재와 자료를 다시 확인하며 차근차근 학습해 나가시기 바랍니다.`;
    }
}

/**
 * 퀴즈 목록으로 돌아가기
 */
function goToQuizList() {
    const quizContainer = document.getElementById('quiz-container');
    const quizResult = document.getElementById('quiz-result');
    const quizList = document.getElementById('quiz-list');
    
    if (quizContainer) quizContainer.style.display = 'none';
    if (quizResult) quizResult.style.display = 'none';
    if (quizList) quizList.style.display = 'grid';
    
    currentQuiz = null;
    currentAnswers = {};
    quizResults = [];
}

/**
 * 퀴즈 목록으로 돌아가기 (기존 호환성)
 */
function goBackToQuizList() {
    goToQuizList();
}

// 전역 함수로 등록
window.selectOX = selectOX;
window.setShortAnswer = setShortAnswer;
window.goToQuizList = goToQuizList;

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quiz-content')) {
        initQuiz();
    }
});

// 내보내기 (모듈 시스템 지원)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initQuiz,
        startQuiz,
        handleSubmitQuiz,
        generateAIFeedback
    };
}

