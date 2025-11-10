/**
 * AIClient Module
 * ----------------
 * 단일 진입점을 통해 프런트엔드에서 AI 기능을 사용합니다.
 * 개발 모드에서는 utils/mock-ai.js의 더미 응답을 사용하고,
 * 프로덕션에서는 서버 프록시(`/api/ai/chat`)를 호출합니다.
 * 실제 배포 시에는 서버 레이어에서 AI API 키를 주입합니다.
 */


(function (global) {
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
    let mockModulePromise = null;

    async function loadMockModule() {
        if (!mockModulePromise) {
            mockModulePromise = import('@utils/mock-ai.js');
        }
        return mockModulePromise;
    }

    async function requestChat(body) {
        if (!body || typeof body !== 'object') {
            throw new Error('AI 요청 본문이 필요합니다.');
        }

        if (isDev) {
            const mockModule = await loadMockModule();
            if (typeof mockModule.handleMockChat !== 'function') {
                throw new Error('Mock AI 모듈이 올바르게 구성되지 않았습니다.');
            }
            return mockModule.handleMockChat(body);
        }

        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorMessage = await response.text().catch(() => '');
            throw new Error(errorMessage || 'AI 서버 요청에 실패했습니다.');
        }

        const data = await response.json();
        if (!data || typeof data.content !== 'string') {
            throw new Error('AI 서버 응답 형식이 올바르지 않습니다.');
        }

        return data;
    }

    function normalizeConversation(conversation = []) {
        return conversation
            .filter((entry) => entry && typeof entry.text === 'string')
            .map((entry, index) => ({
                sender: entry.sender || `participant_${index + 1}`,
                role: entry.role || (entry.sender === 'AI 어시스턴트' ? 'assistant' : 'user'),
                text: entry.text.trim()
            }));
    }

    async function getChatReply({ conversation = [], topic } = {}) {
        const normalized = normalizeConversation(conversation);
        if (!normalized.length) {
            throw new Error('대화 이력이 필요합니다.');
        }

        const latest = normalized[normalized.length - 1];

        const messages = [
            {
                role: 'system',
                content: [
                    '당신은 학급 토론을 돕는 한국어 AI 어시스턴트입니다.',
                    '학생들의 의견을 존중하고 긍정적인 피드백과 질문으로 대화를 확장하세요.',
                    '응답은 2~3문장 이내로 간결하게 작성합니다.'
                ].join(' ')
            },
            ...normalized.map((entry) => ({
                role: entry.role === 'assistant' ? 'assistant' : 'user',
                content: `[${entry.sender}] ${entry.text}`
            }))
        ];

        const payload = {
            type: 'classroom-chat',
            topic: topic || 'classroom',
            messages,
            metadata: {
                conversation: normalized,
                lastUserMessage: latest
            }
        };

        const result = await requestChat(payload);
        return result.content;
    }

    async function summarizeQuestions({ studentMessages = [], language = 'ko' } = {}) {
        if (!Array.isArray(studentMessages) || studentMessages.length === 0) {
            throw new Error('요약할 학생 메시지가 없습니다.');
        }

        const trimmedMessages = studentMessages
            .filter((message) => message && typeof message.text === 'string' && message.text.trim() !== '')
            .map((message, index) => ({
                sender: message.sender || `student_${index + 1}`,
                text: message.text.trim()
            }));

        if (!trimmedMessages.length) {
            throw new Error('요약할 학생 메시지가 없습니다.');
        }

        const combined = trimmedMessages
            .map((entry, index) => `${index + 1}. [${entry.sender}] ${entry.text}`)
            .join('\n');

        const messages = [
            {
                role: 'system',
                content: [
                    '당신은 교실 질문을 분석하고 요약하는 한국어 AI 어시스턴트입니다.',
                    '학생 메시지를 주제별로 묶고, 핵심 요점과 교사를 위한 통찰을 제공합니다.'
                ].join(' ')
            },
            {
                role: 'user',
                content: [
                    '다음은 학생들이 보낸 메시지 목록입니다.',
                    '1) 주요 주제별로 분류하고,',
                    '2) 각 주제의 핵심 내용을 요약하며,',
                    '3) 교사가 참고할 통찰 1-2개를 제시해주세요.',
                    `학생 메시지:\n\n${combined}`
                ].join('\n')
            }
        ];

        const payload = {
            type: 'summary',
            language,
            messages,
            metadata: {
                studentMessages: trimmedMessages
            }
        };

        const result = await requestChat(payload);
        return result.content;
    }

    function formatMarkdown(text = '') {
        if (typeof text !== 'string' || text.trim() === '') {
            return '<p></p>';
        }

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

        formatted = formatted.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

        return `<p>${formatted}</p>`;
    }

    function handleError(error) {
        const message = error && error.message ? error.message : '알 수 없는 오류가 발생했습니다.';
        return `
            <div class="ai-error">
                <i class="bx bx-error-circle"></i>
                <p>AI 처리가 실패했습니다.</p>
                <p style="color: #999; font-size: 0.9rem;">${message}</p>
            </div>
        `;
    }

    const api = {
        requestChat,
        getChatReply,
        summarizeQuestions,
        formatMarkdown,
        handleError
    };

    if (global) {
        global.AIClient = api;
    }

    if (typeof console !== 'undefined') {
        console.log('[AIClient] 모듈이 초기화되었습니다. (isDev=%s)', isDev);
    }
})(typeof window !== 'undefined' ? window : globalThis);

export const AIClient = typeof window !== 'undefined' ? window.AIClient : undefined;
export default AIClient;
