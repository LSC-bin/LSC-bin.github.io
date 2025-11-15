import { z } from 'zod'

import type { ActivityPost, ChatMessage, Classroom, ClassroomMember, Question, Session, UserProfile } from '../../types'

// UserProfile 스키마
export const userProfileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  role: z.enum(['teacher', 'student', 'assistant', 'admin']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Classroom 스키마
export const classroomFeatureConfigSchema = z.object({
  sidebar: z.array(
    z.object({
      toolId: z.string(),
      visibility: z.enum(['teacher', 'student', 'all']),
      order: z.number(),
      settings: z.record(z.unknown()),
    }),
  ),
  presets: z.array(z.string()),
})

export const classroomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  code: z.string(),
  featureConfig: classroomFeatureConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

// ClassroomMember 스키마
export const classroomMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.enum(['teacher', 'student', 'assistant', 'admin']),
  status: z.enum(['pending', 'active', 'suspended']),
  permissions: z.record(z.unknown()).optional(),
  joinedAt: z.string(),
})

// Session 스키마
export const sessionSchema = z.object({
  id: z.string(),
  classroomId: z.string(),
  title: z.string(),
  number: z.number(),
  agenda: z.string().optional(),
  date: z.string(),
  status: z.enum(['draft', 'live', 'archived']),
  activeTools: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
})

// ActivityPost 스키마
export const activityPostSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  classroomId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  text: z.string(),
  images: z.array(z.string()),
  likes: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Question 스키마
export const questionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  classroomId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  text: z.string(),
  upvotes: z.number(),
  createdAt: z.string(),
})

// ChatMessage 스키마
export const chatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  classroomId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  text: z.string(),
  createdAt: z.string(),
})

// 타입 추론 헬퍼
export type ValidatedUserProfile = z.infer<typeof userProfileSchema>
export type ValidatedClassroom = z.infer<typeof classroomSchema>
export type ValidatedClassroomMember = z.infer<typeof classroomMemberSchema>
export type ValidatedSession = z.infer<typeof sessionSchema>
export type ValidatedActivityPost = z.infer<typeof activityPostSchema>
export type ValidatedQuestion = z.infer<typeof questionSchema>
export type ValidatedChatMessage = z.infer<typeof chatMessageSchema>

// 스키마 맵 (타입별 스키마 매핑)
export const schemas = {
  UserProfile: userProfileSchema,
  Classroom: classroomSchema,
  ClassroomMember: classroomMemberSchema,
  Session: sessionSchema,
  ActivityPost: activityPostSchema,
  Question: questionSchema,
  ChatMessage: chatMessageSchema,
} as const

