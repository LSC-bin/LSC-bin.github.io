import { useQuery } from '@tanstack/react-query'

import { activityService, classroomsService } from '../services'
import { logger } from '../lib/logger'

type SessionContribution = {
  classroomId: string
  classroomName: string
  sessionId: string
  sessionTitle: string
  activityPosts: number
  questions: number
  chatMessages: number
  lastActivityAt?: string
}

export type AnalyticsSummary = {
  classroomCount: number
  sessionCount: number
  totalActivityPosts: number
  totalQuestions: number
  totalChatMessages: number
  latestActivityAt?: string
  sessionContributions: SessionContribution[]
}

const getMaxTimestamp = (...timestamps: (string | undefined)[]): string | undefined => {
  const valid = timestamps.filter(Boolean) as string[]
  if (!valid.length) return undefined
  return valid.reduce((latest, current) =>
    new Date(current).getTime() > new Date(latest).getTime() ? current : latest,
  )
}

const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  logger.debug('Analytics summary fetch started')
  const classrooms = await classroomsService.listClassrooms()

  let sessionCount = 0
  let totalActivityPosts = 0
  let totalQuestions = 0
  let totalChatMessages = 0
  let latestActivityAt: string | undefined

  const sessionContributions: SessionContribution[] = []

  await Promise.all(
    classrooms.map(async (classroom) => {
      const sessions = await classroomsService.listSessions(classroom.id)
      sessionCount += sessions.length

      await Promise.all(
        sessions.map(async (session) => {
          const [posts, questions, chat] = await Promise.all([
            activityService.listActivityPosts({ classId: classroom.id, sessionId: session.id }),
            activityService.listQuestions({ classId: classroom.id, sessionId: session.id }),
            activityService.listChatMessages({ classId: classroom.id, sessionId: session.id }),
          ])

          totalActivityPosts += posts.length
          totalQuestions += questions.length
          totalChatMessages += chat.length

          const sessionLatestActivity = getMaxTimestamp(
            ...posts.map((post) => post.updatedAt ?? post.createdAt),
            ...questions.map((question) => question.createdAt),
            ...chat.map((message) => message.createdAt),
          )

          if (
            sessionLatestActivity &&
            (!latestActivityAt ||
              new Date(sessionLatestActivity).getTime() > new Date(latestActivityAt).getTime())
          ) {
            latestActivityAt = sessionLatestActivity
          }

          sessionContributions.push({
            classroomId: classroom.id,
            classroomName: classroom.name,
            sessionId: session.id,
            sessionTitle: session.title,
            activityPosts: posts.length,
            questions: questions.length,
            chatMessages: chat.length,
            lastActivityAt: sessionLatestActivity,
          })
        }),
      )
    }),
  )

  sessionContributions.sort((a, b) => {
    if (!a.lastActivityAt && !b.lastActivityAt) return 0
    if (!a.lastActivityAt) return 1
    if (!b.lastActivityAt) return -1
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  })

  logger.debug('Analytics summary fetch completed', {
    classroomCount: classrooms.length,
    sessionCount,
    totalActivityPosts,
    totalQuestions,
    totalChatMessages,
  })

  return {
    classroomCount: classrooms.length,
    sessionCount,
    totalActivityPosts,
    totalQuestions,
    totalChatMessages,
    latestActivityAt,
    sessionContributions,
  }
}

export const useAnalyticsSummary = () =>
  useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: fetchAnalyticsSummary,
    staleTime: 1000 * 30,
  })




