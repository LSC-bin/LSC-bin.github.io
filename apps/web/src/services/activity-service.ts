import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDownloadURL, uploadBytes } from 'firebase/storage'

import { getFirebaseApp } from '../config/firebase'
import {
  activityPostSchema,
  chatMessageSchema,
  questionSchema,
} from '../lib/firebase/schemas'
import { createConverter, firestore } from '../lib/firebase/firestore'
import { storage } from '../services/firebase'

import type {
  ActivityPost,
  ChatMessage,
  CreateActivityPostInput,
  CreateChatMessageInput,
  CreateQuestionInput,
  Question,
} from '../types'
import { logger } from '../lib/logger'

const mapActivityPost = (
  classId: string,
  sessionId: string,
  docRef: QueryDocumentSnapshot<DocumentData>,
) => {
  const data = docRef.data() as ActivityPost
  return {
    id: docRef.id,
    classroomId: data.classroomId ?? classId,
    sessionId: data.sessionId ?? sessionId,
    ...data,
    images: data.images ?? [],
    likes: data.likes ?? [],
  } as ActivityPost
}

const mapQuestion = (
  classId: string,
  sessionId: string,
  docRef: QueryDocumentSnapshot<DocumentData>,
) => {
  const data = docRef.data() as Question
  return {
    id: docRef.id,
    classroomId: data.classroomId ?? classId,
    sessionId: data.sessionId ?? sessionId,
    ...data,
    upvotes: data.upvotes ?? 0,
  } as Question
}

const mapChatMessage = (
  classId: string,
  sessionId: string,
  docRef: QueryDocumentSnapshot<DocumentData>,
) => {
  const data = docRef.data() as ChatMessage
  return {
    id: docRef.id,
    classroomId: data.classroomId ?? classId,
    sessionId: data.sessionId ?? sessionId,
    ...data,
  } as ChatMessage
}

const uploadAttachmentsToStorage = async (params: {
  classId: string
  sessionId: string
  files: File[]
}): Promise<string[]> => {
  if (!params.files.length) {
    return []
  }

  const uploadPromises = params.files.map((file, index) => {
    const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase()
    const filePath = `classrooms/${params.classId}/sessions/${params.sessionId}/activity/${Date.now()}-${index}-${sanitizedName}`
    const storageRef = storage.createRef(filePath)
    return uploadBytes(storageRef, file).then(async (snapshot) => {
      return getDownloadURL(snapshot.ref)
    })
  })

  return Promise.all(uploadPromises)
}

const handleActivityError = (context: string, error: unknown): never => {
  logger.error(context, {
    error: error instanceof Error ? error.message : String(error),
  })
  throw error instanceof Error ? error : new Error(context)
}

export const activityService = {
  async listActivityPosts(params: { classId: string; sessionId: string }): Promise<ActivityPost[]> {
    try {
      if (!params.classId || !params.sessionId) return []
      getFirebaseApp()
      const postsCollection = collection(
        firestore.getDb(),
        `classrooms/${params.classId}/sessions/${params.sessionId}/activityPosts`,
      ).withConverter(createConverter<ActivityPost>(activityPostSchema))
      const snapshot = await getDocs(postsCollection)
      return snapshot.docs.map((docRef) => mapActivityPost(params.classId, params.sessionId, docRef))
    } catch (error) {
      handleActivityError('Failed to load activity posts', error)
    }
  },

  async listQuestions(params: { classId: string; sessionId: string }): Promise<Question[]> {
    try {
      if (!params.classId || !params.sessionId) return []
      getFirebaseApp()
      const questionsCollection = collection(
        firestore.getDb(),
        `classrooms/${params.classId}/sessions/${params.sessionId}/askQuestions`,
      ).withConverter(createConverter<Question>(questionSchema))
      const snapshot = await getDocs(questionsCollection)
      return snapshot.docs.map((docRef) => mapQuestion(params.classId, params.sessionId, docRef))
    } catch (error) {
      handleActivityError('Failed to load questions', error)
    }
  },

  async listChatMessages(params: { classId: string; sessionId: string }): Promise<ChatMessage[]> {
    try {
      if (!params.classId || !params.sessionId) return []
      getFirebaseApp()
      const chatCollection = collection(
        firestore.getDb(),
        `classrooms/${params.classId}/sessions/${params.sessionId}/chatMessages`,
      ).withConverter(createConverter<ChatMessage>(chatMessageSchema))
      const snapshot = await getDocs(chatCollection)
      return snapshot.docs.map((docRef) => mapChatMessage(params.classId, params.sessionId, docRef))
    } catch (error) {
      handleActivityError('Failed to load chat messages', error)
    }
  },

  subscribeToActivityPosts(
    params: { classId: string; sessionId: string },
    callback: (posts: ActivityPost[]) => void,
  ): Unsubscribe {
    if (!params.classId || !params.sessionId) {
      callback([])
      return () => undefined
    }
    const postsCollection = collection(
      firestore.getDb(),
      `classrooms/${params.classId}/sessions/${params.sessionId}/activityPosts`,
    ).withConverter(createConverter<ActivityPost>())
    return onSnapshot(postsCollection, (snapshot) => {
      callback(
        snapshot.docs.map((docRef) => mapActivityPost(params.classId, params.sessionId, docRef)),
      )
    })
  },

  subscribeToQuestions(
    params: { classId: string; sessionId: string },
    callback: (questions: Question[]) => void,
  ): Unsubscribe {
    if (!params.classId || !params.sessionId) {
      callback([])
      return () => undefined
    }
    const questionsCollection = collection(
      firestore.getDb(),
      `classrooms/${params.classId}/sessions/${params.sessionId}/askQuestions`,
    ).withConverter(createConverter<Question>())
    return onSnapshot(questionsCollection, (snapshot) => {
      callback(
        snapshot.docs.map((docRef) => mapQuestion(params.classId, params.sessionId, docRef)),
      )
    })
  },

  subscribeToChatMessages(
    params: { classId: string; sessionId: string },
    callback: (chatMessages: ChatMessage[]) => void,
  ): Unsubscribe {
    if (!params.classId || !params.sessionId) {
      callback([])
      return () => undefined
    }
    const chatCollection = collection(
      firestore.getDb(),
      `classrooms/${params.classId}/sessions/${params.sessionId}/chatMessages`,
    ).withConverter(createConverter<ChatMessage>())
    return onSnapshot(chatCollection, (snapshot) => {
      callback(
        snapshot.docs.map((docRef) => mapChatMessage(params.classId, params.sessionId, docRef)),
      )
    })
  },

  async createActivityPost(params: {
    classId: string
    sessionId: string
    data: CreateActivityPostInput
    attachments?: File[]
  }): Promise<ActivityPost> {
    try {
      if (!params.classId || !params.sessionId) throw new Error('classId and sessionId are required')
      const now = new Date().toISOString()
      const attachmentUrls = params.attachments?.length
        ? await uploadAttachmentsToStorage({
            classId: params.classId,
            sessionId: params.sessionId,
            files: params.attachments,
          })
        : []
      const payload = {
        classroomId: params.classId,
        sessionId: params.sessionId,
        authorId: params.data.authorId,
        authorName: params.data.authorName,
        text: params.data.text,
        images: [...(params.data.images ?? []), ...attachmentUrls],
        likes: [],
        createdAt: now,
        updatedAt: now,
      }
      const collectionRef = collection(
        firestore.getDb(),
        `classrooms/${params.classId}/sessions/${params.sessionId}/activityPosts`,
      ).withConverter(createConverter<ActivityPost>(activityPostSchema))
      const docRef = await addDoc(collectionRef, payload)
      return { id: docRef.id, ...payload }
    } catch (error) {
      handleActivityError('Failed to create activity post', error)
    }
  },

  async createQuestion(params: {
    classId: string
    sessionId: string
    data: CreateQuestionInput
  }): Promise<Question> {
    try {
      if (!params.classId || !params.sessionId) throw new Error('classId and sessionId are required')
      const now = new Date().toISOString()
      const payload = {
        classroomId: params.classId,
        sessionId: params.sessionId,
        authorId: params.data.authorId,
        authorName: params.data.authorName,
        text: params.data.text,
        upvotes: 0,
        createdAt: now,
      }
      const collectionRef = collection(
        firestore.getDb(),
        `classrooms/${params.classId}/sessions/${params.sessionId}/askQuestions`,
      ).withConverter(createConverter<Question>(questionSchema))
      const docRef = await addDoc(collectionRef, payload)
      return { id: docRef.id, ...payload }
    } catch (error) {
      handleActivityError('Failed to create question', error)
    }
  },

  async sendChatMessage(params: {
    classId: string
    sessionId: string
    data: CreateChatMessageInput
  }): Promise<ChatMessage> {
    try {
      if (!params.classId || !params.sessionId) throw new Error('classId and sessionId are required')
      const now = new Date().toISOString()
      const payload = {
        classroomId: params.classId,
        sessionId: params.sessionId,
        authorId: params.data.authorId,
        authorName: params.data.authorName,
        text: params.data.text,
        createdAt: now,
      }
      const collectionRef = collection(
        firestore.getDb(),
        `classrooms/${params.classId}/sessions/${params.sessionId}/chatMessages`,
      ).withConverter(createConverter<ChatMessage>(chatMessageSchema))
      const docRef = await addDoc(collectionRef, payload)
      return { id: docRef.id, ...payload }
    } catch (error) {
      handleActivityError('Failed to send chat message', error)
    }
  },
}

