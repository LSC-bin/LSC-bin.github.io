export type Role = 'teacher' | 'student' | 'assistant' | 'admin'
export type SessionStatus = 'draft' | 'live' | 'archived'

export type ClassroomFeatureConfig = {
  sidebar: Array<{
    toolId: string
    visibility: 'teacher' | 'student' | 'all'
    order: number
    settings: Record<string, unknown>
  }>
  presets: string[]
}

export type Classroom = {
  id: string
  name: string
  description?: string
  ownerId: string
  code: string
  featureConfig: ClassroomFeatureConfig
  createdAt: string
  updatedAt: string
}

export type ClassroomMember = {
  id: string
  userId: string
  role: Role
  status: 'pending' | 'active' | 'suspended'
  permissions?: Record<string, unknown>
  joinedAt: string
}

export type Session = {
  id: string
  classroomId: string
  title: string
  number: number
  agenda?: string
  date: string
  status: SessionStatus
  activeTools: string[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export type CreateSessionInput = {
  title: string
  number: number
  agenda?: string
  date: string
  status?: SessionStatus
  activeTools?: string[]
  createdBy?: string
}

export type ActivityPost = {
  id: string
  sessionId: string
  classroomId: string
  authorId: string
  authorName: string
  text: string
  images: string[]
  likes: string[]
  createdAt: string
  updatedAt: string
}

export type Question = {
  id: string
  sessionId: string
  classroomId: string
  authorId: string
  authorName: string
  text: string
  upvotes: number
  createdAt: string
}

export type ChatMessage = {
  id: string
  sessionId: string
  classroomId: string
  authorId: string
  authorName: string
  text: string
  createdAt: string
}

export type CreateActivityPostInput = {
  authorId: string
  authorName: string
  text: string
  images?: string[]
}

export type CreateQuestionInput = {
  authorId: string
  authorName: string
  text: string
}

export type CreateChatMessageInput = {
  authorId: string
  authorName: string
  text: string
}

export type Material = {
  id: string
  sessionId: string
  classroomId: string
  title: string
  description?: string
  fileName: string
  fileType: string
  fileSize: number
  downloadUrl: string
  uploadedBy: string
  uploadedAt: string
}

