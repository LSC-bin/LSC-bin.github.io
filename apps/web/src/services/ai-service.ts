import type { AnalyticsSummary } from '../hooks/use-analytics'

type AiSummaryInput = {
  analytics: AnalyticsSummary
}

export const aiService = {
  async generateAnalyticsSummary({ analytics }: AiSummaryInput): Promise<string> {
    // Placeholder implementation; replace with OpenAI/Gemini call later.
    const topSession = analytics.sessionContributions[0]
    const highlight = topSession
      ? `가장 최근 활동은 '${topSession.classroomName}'의 '${topSession.sessionTitle}' 세션에서 발생했으며, 게시물 ${topSession.activityPosts}건 · 질문 ${topSession.questions}건 · 채팅 ${topSession.chatMessages}건이 기록되었습니다.`
      : '아직 활동 데이터가 없어 세션 하이라이트를 보여줄 수 없습니다.'

    return [
      `총 ${analytics.classroomCount}개의 학급과 ${analytics.sessionCount}개의 세션이 운영 중이에요.`,
      `Padlet형 게시물 ${analytics.totalActivityPosts}건, 질문 ${analytics.totalQuestions}건, 채팅 ${analytics.totalChatMessages}건이 누적되었습니다.`,
      highlight,
    ].join(' ')
  },
}




