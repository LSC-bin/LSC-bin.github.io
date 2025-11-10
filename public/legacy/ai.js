/**
 * AI Integration Module
 * [ClassBoard Update] 완전 리팩터링 및 통합 리디자인
 * AI 확장 준비 구조 (Gemini & OpenAI API)
 * TODO: 실제 API 연결 시
 */

// ===================================
// Configuration
// ===================================
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// ===================================
// OpenAI API Functions
// ===================================

/**
 * OpenAI를 사용한 텍스트 요약 생성
 * @param {string} text - 요약할 텍스트
 * @returns {Promise<string>} 요약된 텍스트
 */
async function generateSummaryWithOpenAI(text) {
    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `다음 텍스트를 요약해주세요:\n\n${text}`
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API 호출 실패');
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            throw new Error('응답 형식 오류');
        }

    } catch (error) {
        console.error('OpenAI 요약 실패:', error);
        
        // API 키가 설정되지 않은 경우 더미 데이터 반환
        if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return generateMockSummary(text);
        }
        
        throw error;
    }
}

/**
 * OpenAI를 사용한 피드백 생성
 * @param {Object} data - 피드백을 생성할 데이터
 * @returns {Promise<string>} 생성된 피드백
 */
async function generateFeedbackWithOpenAI(data) {
    try {
        const prompt = createFeedbackPrompt(data);
        
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API 호출 실패');
        }

        const responseData = await response.json();
        
        if (responseData.choices && responseData.choices[0]) {
            return responseData.choices[0].message.content;
        } else {
            throw new Error('응답 형식 오류');
        }

    } catch (error) {
        console.error('OpenAI 피드백 실패:', error);
        
        if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return generateMockFeedback(data);
        }
        
        throw error;
    }
}

/**
 * 피드백 프롬프트 생성
 * @param {Object} data - 피드백 데이터
 * @returns {string} 생성된 프롬프트
 */
function createFeedbackPrompt(data) {
    return `
다음 활동에 대한 긍정적이고 구체적인 피드백을 작성해주세요:

제목: ${data.title || '제목 없음'}
내용: ${data.content || ''}

피드백 요구사항:
1. 긍정적인 어조로 시작
2. 구체적인 칭찬 포인트 2-3개
3. 개선 제안 1-2개
4. 격려의 말로 마무리

한국어로 답변해주세요.
    `.trim();
}

// ===================================
// Gemini API Functions
// ===================================

/**
 * Gemini를 사용한 텍스트 요약 생성
 * @param {string} text - 요약할 텍스트
 * @returns {Promise<string>} 요약된 텍스트
 */
async function generateSummaryWithGemini(text) {
    try {
        const response = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `다음 텍스트를 요약해주세요:\n\n${text}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error('Gemini API 호출 실패');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('응답 형식 오류');
        }

    } catch (error) {
        console.error('Gemini 요약 실패:', error);
        
        if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            return generateMockSummary(text);
        }
        
        throw error;
    }
}

/**
 * Gemini를 사용한 대화 분석
 * @param {Array} messages - 분석할 메시지 배열
 * @returns {Promise<string>} 분석 결과
 */
async function analyzeConversationWithGemini(messages) {
    try {
        const messagesText = messages.map(m => m.text).join('\n\n');
        
        const response = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `다음 대화 내용을 분석하여:
1. 주요 주제별로 분류
2. 각 주제의 핵심 내용 요약
3. 교사에게 도움이 되는 통찰 제공

대화 내용:
${messagesText}

한국어로 구조화된 형태로 응답해주세요.`
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
            throw new Error('Gemini API 호출 실패');
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('응답 형식 오류');
        }

    } catch (error) {
        console.error('Gemini 대화 분석 실패:', error);
        
        if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
            return generateMockConversationAnalysis(messages);
        }
        
        throw error;
    }
}

// ===================================
// Mock Functions (더미 데이터)
// ===================================

/**
 * Mock 요약 생성
 * @param {string} text - 원본 텍스트
 * @returns {string} 더미 요약
 */
function generateMockSummary(text) {
    const words = text.split(' ');
    const summaryLength = Math.min(50, Math.floor(words.length * 0.3));
    const summary = words.slice(0, summaryLength).join(' ');
    
    return `[더미 데이터] ${summary}... (요약 기능은 API 연결 후 활성화됩니다.)`;
}

/**
 * Mock 피드백 생성
 * @param {Object} data - 피드백 데이터
 * @returns {string} 더미 피드백
 */
function generateMockFeedback(data) {
    return `
[더미 데이터] AI 피드백

훌륭한 작업입니다! 학생님의 아이디어가 매우 창의적입니다.

칭찬 포인트:
- 명확한 논리 전개
- 적절한 예시 제시
- 독창적인 관점

개선 제안:
- 더 구체적인 데이터 추가 고려

계속 노력하시면 더욱 발전할 것입니다!

(실제 AI 피드백은 API 연결 후 활성화됩니다.)
    `.trim();
}

/**
 * Mock 대화 분석 생성
 * @param {Array} messages - 메시지 배열
 * @returns {string} 더미 분석 결과
 */
function generateMockConversationAnalysis(messages) {
    const topics = messages.length > 0 ? ['주제1', '주제2'] : ['주제 없음'];
    
    return `
[더미 데이터] 대화 분석 결과

주요 주제: ${topics.join(', ')}

각 주제별 요약:
- 주제1: 관련 대화 내용 요약
- 주제2: 관련 대화 내용 요약

통찰:
- 학생들의 관심 분야 파악
- 추가 설명이 필요한 영역 식별

(실제 AI 분석은 API 연결 후 활성화됩니다.)
    `.trim();
}

// ===================================
// Utility Functions
// ===================================

/**
 * AI 응답 포맷팅 (Markdown → HTML)
 * @param {string} text - 원본 텍스트
 * @returns {string} 포맷된 HTML
 */
function formatAIResponse(text) {
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
 * AI 응답 에러 처리
 * @param {Error} error - 에러 객체
 * @returns {string} 에러 메시지
 */
function handleAIError(error) {
    console.error('AI 처리 오류:', error);
    return `
        <div class="ai-error">
            <i class="bx bx-error-circle"></i>
            <p>AI 처리가 실패했습니다.</p>
            <p style="color: #999; font-size: 0.9rem;">${error.message || '알 수 없는 오류가 발생했습니다.'}</p>
        </div>
    `;
}

// ===================================
// Module Export
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSummaryWithOpenAI,
        generateFeedbackWithOpenAI,
        generateSummaryWithGemini,
        analyzeConversationWithGemini,
        generateMockSummary,
        generateMockFeedback,
        formatAIResponse,
        handleAIError
    };
}

// ===================================
// Logging
// ===================================

console.log('[AI Module] AI 확장 준비 구조가 로드되었습니다.');
console.log('[AI Module] OpenAI 및 Gemini API 연결 필요');
