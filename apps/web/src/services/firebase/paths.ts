export const FIRESTORE_PATHS = {
  classrooms: 'classrooms',
  classroom: (classId: string) => `classrooms/${classId}`,
  classroomMembers: (classId: string) => `classrooms/${classId}/members`,
  classroomMember: (classId: string, userId: string) =>
    `classrooms/${classId}/members/${userId}`,
  classroomSessions: (classId: string) => `classrooms/${classId}/sessions`,
  classroomSession: (classId: string, sessionId: string) =>
    `classrooms/${classId}/sessions/${sessionId}`,
  sessionActivityPosts: (classId: string, sessionId: string) =>
    `classrooms/${classId}/sessions/${sessionId}/activityPosts`,
  sessionQuestions: (classId: string, sessionId: string) =>
    `classrooms/${classId}/sessions/${sessionId}/askQuestions`,
  sessionChatMessages: (classId: string, sessionId: string) =>
    `classrooms/${classId}/sessions/${sessionId}/chatMessages`,
} as const

export const STORAGE_PATHS = {
  sessionMaterials: (classId: string, sessionId: string, fileName: string) =>
    `materials/${classId}/${sessionId}/${fileName}`,
} as const


