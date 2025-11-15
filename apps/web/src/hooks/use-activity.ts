import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { activityService } from '../services'

import type {
  ActivityPost,
  ChatMessage,
  CreateActivityPostInput,
  CreateChatMessageInput,
  CreateQuestionInput,
  Question,
} from '../types'

const ACTIVITY_KEYS = {
  base: (classId: string, sessionId: string) => ['activity', classId, sessionId] as const,
  posts: (classId: string, sessionId: string) =>
    [...ACTIVITY_KEYS.base(classId, sessionId), 'posts'] as const,
  questions: (classId: string, sessionId: string) =>
    [...ACTIVITY_KEYS.base(classId, sessionId), 'questions'] as const,
  chat: (classId: string, sessionId: string) =>
    [...ACTIVITY_KEYS.base(classId, sessionId), 'chat'] as const,
}

export const useActivityPostsQuery = (
  classId: string,
  sessionId: string,
): UseQueryResult<ActivityPost[]> => {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: ACTIVITY_KEYS.posts(classId, sessionId),
    queryFn: () => activityService.listActivityPosts({ classId, sessionId }),
    enabled: Boolean(classId && sessionId),
  })

  useEffect(() => {
    if (!classId || !sessionId) return
    const unsubscribe = activityService.subscribeToActivityPosts(
      { classId, sessionId },
      (posts) => {
        queryClientRef.current.setQueryData(ACTIVITY_KEYS.posts(classId, sessionId), posts)
      },
    )
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, sessionId]) // queryClient 의존성 제거

  return queryResult
}

export const useQuestionsQuery = (
  classId: string,
  sessionId: string,
): UseQueryResult<Question[]> => {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: ACTIVITY_KEYS.questions(classId, sessionId),
    queryFn: () => activityService.listQuestions({ classId, sessionId }),
    enabled: Boolean(classId && sessionId),
  })

  useEffect(() => {
    if (!classId || !sessionId) return
    const unsubscribe = activityService.subscribeToQuestions(
      { classId, sessionId },
      (questions) => {
        queryClientRef.current.setQueryData(ACTIVITY_KEYS.questions(classId, sessionId), questions)
      },
    )
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, sessionId]) // queryClient 의존성 제거

  return queryResult
}

export const useChatMessagesQuery = (
  classId: string,
  sessionId: string,
): UseQueryResult<ChatMessage[]> => {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const queryResult = useQuery({
    queryKey: ACTIVITY_KEYS.chat(classId, sessionId),
    queryFn: () => activityService.listChatMessages({ classId, sessionId }),
    enabled: Boolean(classId && sessionId),
  })

  useEffect(() => {
    if (!classId || !sessionId) return
    const unsubscribe = activityService.subscribeToChatMessages(
      { classId, sessionId },
      (messages) => {
        queryClientRef.current.setQueryData(ACTIVITY_KEYS.chat(classId, sessionId), messages)
      },
    )
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, sessionId]) // queryClient 의존성 제거

  return queryResult
}

type SessionScopedVariables<T> = {
  classId: string
  sessionId: string
  data: T
}

type CreateActivityPostVariables = SessionScopedVariables<CreateActivityPostInput> & {
  attachments?: File[]
}

type MutationContext<T> = {
  previousData?: T[]
  tempId: string
  queryKey: readonly unknown[]
}

export const useCreateActivityPostMutation = (): UseMutationResult<
  ActivityPost,
  Error,
  CreateActivityPostVariables,
  MutationContext<ActivityPost>
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['activity', 'posts', 'create'],
    mutationFn: ({ classId, sessionId, data, attachments }) =>
      activityService.createActivityPost({ classId, sessionId, data, attachments }),
    onMutate: async ({ classId, sessionId, data }) => {
      const queryKey = ACTIVITY_KEYS.posts(classId, sessionId)
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<ActivityPost[]>(queryKey)
      const tempId = `temp-post-${Date.now()}`
      const optimisticPost: ActivityPost = {
        id: tempId,
        classroomId: classId,
        sessionId,
        authorId: data.authorId,
        authorName: data.authorName,
        text: data.text,
        images: data.images ?? [],
        likes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      queryClient.setQueryData<ActivityPost[]>(queryKey, (current = []) => [
        ...current,
        optimisticPost,
      ])
      return { previousData, tempId, queryKey }
    },
    onError: (_error, variables, context) => {
      if (!context) return
      queryClient.setQueryData(context.queryKey, context.previousData ?? [])
    },
    onSuccess: (createdPost, _variables, context) => {
      if (!context) return
      queryClient.setQueryData<ActivityPost[]>(context.queryKey, (current = []) =>
        current
          .map((post) => (post.id === context.tempId ? createdPost : post))
          .sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
      )
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACTIVITY_KEYS.posts(variables.classId, variables.sessionId),
      })
    },
  })
}

export const useCreateQuestionMutation = (): UseMutationResult<
  Question,
  Error,
  SessionScopedVariables<CreateQuestionInput>,
  MutationContext<Question>
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['activity', 'questions', 'create'],
    mutationFn: ({ classId, sessionId, data }) =>
      activityService.createQuestion({ classId, sessionId, data }),
    onMutate: async ({ classId, sessionId, data }) => {
      const queryKey = ACTIVITY_KEYS.questions(classId, sessionId)
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<Question[]>(queryKey)
      const tempId = `temp-question-${Date.now()}`
      const optimisticQuestion: Question = {
        id: tempId,
        classroomId: classId,
        sessionId,
        authorId: data.authorId,
        authorName: data.authorName,
        text: data.text,
        upvotes: 0,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData<Question[]>(queryKey, (current = []) => [
        optimisticQuestion,
        ...current,
      ])
      return { previousData, tempId, queryKey }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      queryClient.setQueryData(context.queryKey, context.previousData ?? [])
    },
    onSuccess: (createdQuestion, _variables, context) => {
      if (!context) return
      queryClient.setQueryData<Question[]>(context.queryKey, (current = []) =>
        current.map((question) =>
          question.id === context.tempId ? createdQuestion : question,
        ),
      )
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACTIVITY_KEYS.questions(variables.classId, variables.sessionId),
      })
    },
  })
}

export const useSendChatMessageMutation = (): UseMutationResult<
  ChatMessage,
  Error,
  SessionScopedVariables<CreateChatMessageInput>,
  MutationContext<ChatMessage>
> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['activity', 'chat', 'send'],
    mutationFn: ({ classId, sessionId, data }) =>
      activityService.sendChatMessage({ classId, sessionId, data }),
    onMutate: async ({ classId, sessionId, data }) => {
      const queryKey = ACTIVITY_KEYS.chat(classId, sessionId)
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<ChatMessage[]>(queryKey)
      const tempId = `temp-chat-${Date.now()}`
      const optimisticMessage: ChatMessage = {
        id: tempId,
        classroomId: classId,
        sessionId,
        authorId: data.authorId,
        authorName: data.authorName,
        text: data.text,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) => [
        ...current,
        optimisticMessage,
      ])
      return { previousData, tempId, queryKey }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      queryClient.setQueryData(context.queryKey, context.previousData ?? [])
    },
    onSuccess: (message, _variables, context) => {
      if (!context) return
      queryClient.setQueryData<ChatMessage[]>(context.queryKey, (current = []) =>
        current
          .map((item) => (item.id === context.tempId ? message : item))
          .sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
      )
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ACTIVITY_KEYS.chat(variables.classId, variables.sessionId),
      })
    },
  })
}

