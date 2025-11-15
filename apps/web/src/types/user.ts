export type UserRole = 'teacher' | 'student' | 'assistant' | 'admin'

export type UserProfile = {
  id: string
  displayName: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}



