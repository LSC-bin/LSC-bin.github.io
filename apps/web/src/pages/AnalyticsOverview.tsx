import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '../components/common/EmptyState'
import { Skeleton } from '../components/common/Skeleton'
import { useAnalyticsSummary, useAuth } from '../hooks'
import { logger } from '../lib/logger'
import { aiService } from '../services'

const formatNumber = new Intl.NumberFormat('ko-KR').format

const formatDateTime = (value?: string) => {
  if (!value) return '데이터 없음'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const HighlightCard = ({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel?: string
}) => (
  <article className="rounded-2xl border border-slate-800 bg-surface-900/60 p-6 shadow-sm shadow-black/20">
    <h3 className="text-sm font-medium text-slate-300">{label}</h3>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    {sublabel && <p className="mt-2 text-xs text-slate-500">{sublabel}</p>}
  </article>
)

export const AnalyticsOverview = () => {
  const { user } = useAuth()
  const canViewAnalytics = Boolean(user && ['teacher', 'assistant', 'admin'].includes(user.role))
  const analyticsQuery = useAnalyticsSummary()
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const sessionTop5 = useMemo(() => {
    if (!analyticsQuery.data) return []
    return analyticsQuery.data.sessionContributions.slice(0, 5)
  }, [analyticsQuery.data])

  if (!user || !canViewAnalytics) {
    return (
      <section className="space-y-6">
        <header className="space-y-3">
          <h2 className="text-3xl font-bold text-white">통계 · 모니터링</h2>
          <p className="text-sm text-slate-300">
            교사, 보조 교사 또는 관리자 권한으로 로그인하면 학급 및 세션 통계를 확인할 수 있습니다.
          </p>
        </header>
        <EmptyState
          title="권한이 필요한 영역입니다."
          description="교사/보조 교사/Admin 계정으로 로그인한 뒤 다시 시도해주세요."
        />
      </section>
    )
  }

  const handleRefresh = async () => {
    try {
      await analyticsQuery.refetch()
      toast.success('통계 데이터를 새로고침했습니다.')
    } catch (error) {
      logger.error('Analytics refresh failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      toast.error('통계 데이터를 불러오지 못했습니다.')
    }
  }

  const handleGenerateSummary = async () => {
    if (!analyticsQuery.data) return
    setIsGeneratingSummary(true)
    try {
      const summary = await aiService.generateAnalyticsSummary({
        analytics: analyticsQuery.data,
      })
      setAiSummary(summary)
    } catch (error) {
      logger.error('AI analytics summary failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      toast.error('AI 요약을 생성하지 못했습니다.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-white">통계 · 모니터링</h2>
          <p className="mt-2 text-sm text-slate-300">
            Firestore 데이터를 기반으로 현재 클래스·세션 활동 현황과 참여 지표를 요약합니다. 실시간
            데이터를 확인하려면 에뮬레이터 또는 실제 프로젝트와 연결한 뒤 사용하세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/60 px-4 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/20 disabled:opacity-60"
            disabled={analyticsQuery.isFetching}
          >
            {analyticsQuery.isFetching ? '불러오는 중...' : '데이터 새로고침'}
          </button>
          <span>
            마지막 활동 시각:{' '}
            <span className="font-medium text-slate-200">
              {analyticsQuery.isLoading
                ? '계산 중...'
                : formatDateTime(analyticsQuery.data?.latestActivityAt)}
            </span>
          </span>
        </div>
      </header>

      {analyticsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : analyticsQuery.isError ? (
        <EmptyState
          title="통계 데이터를 불러오지 못했습니다."
          description="네트워크 상태 또는 Firebase 연결을 확인한 뒤 다시 시도해주세요."
        />
      ) : analyticsQuery.data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HighlightCard
              label="전체 학급 수"
              value={formatNumber(analyticsQuery.data.classroomCount)}
              sublabel="Firestore에 존재하는 학급 수"
            />
            <HighlightCard
              label="전체 세션 수"
              value={formatNumber(analyticsQuery.data.sessionCount)}
              sublabel="학급별 세션을 포함한 총합"
            />
            <HighlightCard
              label="활동 게시물"
              value={formatNumber(analyticsQuery.data.totalActivityPosts)}
              sublabel="Padlet형 활동 게시물 개수"
            />
            <HighlightCard
              label="질문 · 채팅"
              value={`${formatNumber(
                analyticsQuery.data.totalQuestions + analyticsQuery.data.totalChatMessages,
              )}`}
              sublabel={`질문 ${formatNumber(analyticsQuery.data.totalQuestions)} · 채팅 ${formatNumber(
                analyticsQuery.data.totalChatMessages,
              )}`}
            />
          </section>

          <section className="rounded-3xl border border-slate-800 bg-surface-900/60 p-6 shadow-sm shadow-black/10">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">세션별 참여도</h3>
                <p className="text-xs text-slate-400">
                  최근 활동 시각을 기준으로 상위 5개의 세션을 보여줍니다.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                데이터 기준: {formatDateTime(analyticsQuery.data.latestActivityAt)}
              </span>
            </header>
            {sessionTop5.length ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-3 pr-4">학급</th>
                      <th className="pb-3 pr-4">세션</th>
                      <th className="pb-3 pr-4 text-right">게시물</th>
                      <th className="pb-3 pr-4 text-right">질문</th>
                      <th className="pb-3 pr-4 text-right">채팅</th>
                      <th className="pb-3 text-right">마지막 활동</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sessionTop5.map((session) => (
                      <tr key={session.sessionId}>
                        <td className="py-3 pr-4">{session.classroomName}</td>
                        <td className="py-3 pr-4 text-slate-300">{session.sessionTitle}</td>
                        <td className="py-3 pr-4 text-right">{formatNumber(session.activityPosts)}</td>
                        <td className="py-3 pr-4 text-right">{formatNumber(session.questions)}</td>
                        <td className="py-3 pr-4 text-right">{formatNumber(session.chatMessages)}</td>
                        <td className="py-3 text-right text-slate-400">
                          {formatDateTime(session.lastActivityAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="통계에 활용할 데이터가 없습니다."
                description="활동 게시물이나 질문을 생성하면 세션 참여도 표가 채워집니다."
              />
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-800 bg-surface-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">모니터링 이벤트</h3>
              <p className="mt-2 text-xs text-slate-400">
                개발 모드에서는 최근 로깅 이벤트가 브라우저 전역 변수(`window.__classboardTelemetry`)
                에 저장됩니다.
              </p>
              <div className="mt-4 rounded-xl border border-slate-800 bg-surface-950/80 p-3 text-xs text-slate-300">
                <code>
                  window.__classboardTelemetry?.slice(-5)
                </code>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-800 bg-surface-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">운영 체크리스트</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Firestore 규칙에 참여 권한(교사/보조/학생) 조건 반영</li>
                <li>• Vitest 통합 후 CI에서 `npm run test` 실행</li>
                <li>• Firebase Analytics 또는 LogRocket 연계 시 이벤트 맵핑 정리</li>
                <li>• 통계 지표 기반 Slack/메일 알림 조건 정의</li>
              </ul>
            </article>

            <article className="rounded-3xl border border-brand-500/40 bg-surface-900/60 p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI 요약 (프리뷰)</h3>
                  <p className="text-xs text-slate-400">
                    향후 OpenAI/Gemini 연동을 대비한 프리뷰입니다. 현재는 로컬 템플릿으로 요약을 제공합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-500/60 px-4 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/20 disabled:opacity-60"
                  disabled={isGeneratingSummary || analyticsQuery.isLoading || analyticsQuery.isError}
                >
                  {isGeneratingSummary ? '요약 생성 중...' : 'AI 요약 보기'}
                </button>
              </div>
              <div
                className="mt-4 rounded-2xl border border-slate-800 bg-surface-950/80 p-4 text-sm text-slate-200"
                role="status"
                aria-live="polite"
              >
                {aiSummary
                  ? aiSummary
                  : 'AI 요약이 여기에 표시됩니다. 버튼을 눌러 최신 데이터를 요약해 보세요.'}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </section>
  )
}


