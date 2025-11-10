const randomSeed = () => Math.random().toString(36).slice(2, 8);

function buildMockSummary(messages = []) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return '## 요약 준비 중\n\n학생 메시지가 아직 수집되지 않았습니다.';
    }

    const topics = new Map();
    const keywordBuckets = [
        { key: '질문', keywords: ['?', '왜', '어떻게', '궁금', '질문'] },
        { key: '과제', keywords: ['과제', '숙제', '제출', '마감'] },
        { key: '토론', keywords: ['의견', '생각', '토론', '토의'] }
    ];

    messages.forEach((entry) => {
        const text = entry.text || '';
        const matched = keywordBuckets.find((bucket) =>
            bucket.keywords.some((keyword) => text.includes(keyword))
        );
        const topic = matched ? matched.key : '기타';
        if (!topics.has(topic)) {
            topics.set(topic, []);
        }
        topics.get(topic).push({ sender: entry.sender, text });
    });

    const lines = ['## 교실 요약 (모의 응답)', ''];

    topics.forEach((items, topic) => {
        lines.push(`### ${topic}`);
        items.slice(0, 3).forEach((item) => {
            lines.push(`- ${item.sender || '학생'}: ${item.text.slice(0, 80)}${item.text.length > 80 ? '...' : ''}`);
        });
        lines.push('');
    });

    lines.push('**통찰**');
    lines.push('- 학생들이 활발하게 참여하고 있습니다.');
    lines.push('- 교사는 후속 질문으로 이해를 점검해 보세요.');

    return lines.join('\n');
}

function buildMockChatReply(conversation = []) {
    const reversed = [...conversation].reverse();
    const latestStudent = reversed.find((entry) => entry.role !== 'assistant');

    if (!latestStudent) {
        return '모의 응답: 학생 메시지를 기다리고 있어요!';
    }

    const { sender, text } = latestStudent;
    const closingRemark = ['좋은 생각이에요!', '더 자세히 들려주면 좋겠어요.', '다른 친구들의 의견도 궁금하네요.'];
    const tail = closingRemark[Math.floor(Math.random() * closingRemark.length)];

    return `(${sender}) ${text.slice(0, 60)}${text.length > 60 ? '...' : ''} 에 대해 잘 봤어요. ${tail}`;
}

export async function handleMockChat(body = {}) {
    const { type, metadata } = body;

    if (type === 'summary') {
        return {
            content: buildMockSummary(metadata?.studentMessages)
        };
    }

    if (type === 'classroom-chat') {
        return {
            content: buildMockChatReply(metadata?.conversation)
        };
    }

    return {
        content: `모의 응답(${type || 'unknown'}) - ${randomSeed()}`
    };
}
