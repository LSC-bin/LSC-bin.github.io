import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { classroomsService } from '../services'

import type { Classroom, ClassroomMember, CreateSessionInput, Session } from '../types'

const CLASSROOM_KEYS = {
  all: ['classrooms'] as const,
  detail: (classId: string) => [...CLASSROOM_KEYS.all, classId] as const,
  members: (classId: string) => [...CLASSROOM_KEYS.detail(classId), 'members'] as const,
  sessions: (classId: string) => [...CLASSROOM_KEYS.detail(classId), 'sessions'] as const,
}

export const useClassroomsQuery = (): UseQueryResult<Classroom[]> => {
  const queryClient = useQueryClient()
  // queryClient는 안정적인 참조이지만, 의존성 배열에서 제거하여 불필요한 재구독 방지
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: CLASSROOM_KEYS.all,
    queryFn: () => classroomsService.listClassrooms(),
  })

  useEffect(() => {
    const unsubscribe = classroomsService.subscribeToClassrooms((classrooms) => {
      queryClientRef.current.setQueryData(CLASSROOM_KEYS.all, classrooms)
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // queryClient 의존성 제거

  return queryResult
}

export const useClassroomDetailQuery = (
  classId: string,
): UseQueryResult<Classroom | null> => {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: CLASSROOM_KEYS.detail(classId),
    queryFn: () => classroomsService.getClassroom(classId),
    enabled: Boolean(classId),
  })

  useEffect(() => {
    if (!classId) return
    const unsubscribe = classroomsService.subscribeToClassroom(classId, (classroom) => {
      queryClientRef.current.setQueryData(CLASSROOM_KEYS.detail(classId), classroom)
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]) // queryClient 의존성 제거

  return queryResult
}

export const useClassroomMembersQuery = (
  classId: string,
): UseQueryResult<ClassroomMember[]> => {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: CLASSROOM_KEYS.members(classId),
    queryFn: () => classroomsService.listMembers(classId),
    enabled: Boolean(classId),
  })

  useEffect(() => {
    if (!classId) return
    const unsubscribe = classroomsService.subscribeToMembers(classId, (members) => {
      queryClientRef.current.setQueryData(CLASSROOM_KEYS.members(classId), members)
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]) // queryClient 의존성 제거

  return queryResult
}

export const useClassroomSessionsQuery = (
  classId: string,
): UseQueryResult<Session[]> => {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: CLASSROOM_KEYS.sessions(classId),
    queryFn: () => classroomsService.listSessions(classId),
    enabled: Boolean(classId),
  })

  useEffect(() => {
    if (!classId) return
    const unsubscribe = classroomsService.subscribeToSessions(classId, (sessions) => {
      queryClientRef.current.setQueryData(CLASSROOM_KEYS.sessions(classId), sessions)
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]) // queryClient 의존성 제거

  return queryResult
}

type CreateSessionVariables = {
  classId: string
  input: CreateSessionInput
}

export const useCreateSessionMutation = (): UseMutationResult<
  Session,
  Error,
  CreateSessionVariables
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...CLASSROOM_KEYS.all, 'createSession'],
    mutationFn: ({ classId, input }) => classroomsService.createSession(classId, input),
    onSuccess: (createdSession) => {
      queryClient.setQueryData(
        CLASSROOM_KEYS.sessions(createdSession.classroomId),
        (current?: Session[]) => {
          if (!current) {
            return [createdSession]
          }
          const exists = current.some((session) => session.id === createdSession.id)
          if (exists) {
            return current.map((session) =>
              session.id === createdSession.id ? createdSession : session,
            )
          }
          return [...current, createdSession].sort((a, b) => a.number - b.number)
        },
      )
    },
  })
}

