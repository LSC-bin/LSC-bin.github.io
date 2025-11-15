import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  onSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'

import { getFirebaseApp } from '../config/firebase'
import {
  chatMessageSchema,
  classroomMemberSchema,
  classroomSchema,
  sessionSchema,
} from '../lib/firebase/schemas'
import { createConverter, firestore } from '../services/firebase'

import type { Classroom, ClassroomMember, CreateSessionInput, Session } from '../types'
import { logger } from '../lib/logger'

const mapClassroom = (docRef: QueryDocumentSnapshot<DocumentData>) =>
  ({
    id: docRef.id,
    ...(docRef.data() as Classroom),
  }) as Classroom

const mapMember = (classId: string, docRef: QueryDocumentSnapshot<DocumentData>) =>
  ({
    id: docRef.id,
    classroomId: classId,
    ...(docRef.data() as ClassroomMember),
  }) as ClassroomMember

const mapSession = (classId: string, docRef: QueryDocumentSnapshot<DocumentData>) => {
  const data = docRef.data() as Session
  return {
    id: docRef.id,
    classroomId: data.classroomId ?? classId,
    ...data,
    number: data.number ?? 1,
    status: data.status ?? 'draft',
    activeTools: data.activeTools ?? [],
  } as Session
}

const handleFirestoreError = (context: string, error: unknown): never => {
  logger.error(context, {
    error: error instanceof Error ? error.message : String(error),
  })
  throw error instanceof Error ? error : new Error(context)
}

export const classroomsService = {
  async listClassrooms(): Promise<Classroom[]> {
    try {
      if (!getFirebaseApp()) return []
      const snapshot = await getDocs(collection(firestore.getDb(), 'classrooms'))
      return snapshot.docs.map((docRef) => mapClassroom(docRef))
    } catch (error) {
      handleFirestoreError('Failed to list classrooms', error)
    }
  },

  async getClassroom(classId: string): Promise<Classroom | null> {
    try {
      if (!classId) return null
      if (!getFirebaseApp()) return null
      const classroomRef = firestore.getDocument<Classroom>(`classrooms/${classId}`, classroomSchema)
      const docSnap = await getDoc(classroomRef)
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
    } catch (error) {
      handleFirestoreError('Failed to load classroom detail', error)
    }
  },

  async listMembers(classId: string): Promise<ClassroomMember[]> {
    try {
      if (!classId) return []
      const membersCollection = collection(
        firestore.getDb(),
        `classrooms/${classId}/members`,
      ).withConverter(createConverter<ClassroomMember>(classroomMemberSchema))
      const snapshot = await getDocs(membersCollection)
      return snapshot.docs.map((docRef) => mapMember(classId, docRef))
    } catch (error) {
      handleFirestoreError('Failed to list classroom members', error)
    }
  },

  async listSessions(classId: string): Promise<Session[]> {
    try {
      if (!classId) return []
      const sessionsCollection = collection(
        firestore.getDb(),
        `classrooms/${classId}/sessions`,
      ).withConverter(createConverter<Session>(sessionSchema))
      const snapshot = await getDocs(sessionsCollection)
      return snapshot.docs.map((docRef) => mapSession(classId, docRef))
    } catch (error) {
      handleFirestoreError('Failed to list classroom sessions', error)
    }
  },

  async createSession(classId: string, input: CreateSessionInput): Promise<Session> {
    try {
      if (!classId) throw new Error('classId is required')
      const now = new Date().toISOString()
      const authorId = input.createdBy ?? 'unknown'
      const payload = {
        classroomId: classId,
        title: input.title,
        number: input.number,
        agenda: input.agenda ?? '',
        date: input.date,
        status: input.status ?? 'draft',
        activeTools: input.activeTools ?? [],
        createdAt: now,
        updatedAt: now,
        createdBy: authorId,
        updatedBy: authorId,
      }
      const sessionsCollection = collection(
        firestore.getDb(),
        `classrooms/${classId}/sessions`,
      ).withConverter(createConverter<Session>(sessionSchema))
      const docRef = await addDoc(sessionsCollection, payload)
      return { id: docRef.id, ...payload }
    } catch (error) {
      handleFirestoreError('Failed to create classroom session', error)
    }
  },

  subscribeToClassrooms(callback: (classrooms: Classroom[]) => void): Unsubscribe {
    if (!getFirebaseApp()) {
      return () => undefined
    }
    const classroomsCollection = collection(firestore.getDb(), 'classrooms')
    return onSnapshot(classroomsCollection, (snapshot) => {
      callback(snapshot.docs.map((docRef) => mapClassroom(docRef)))
    })
  },

  subscribeToClassroom(classId: string, callback: (classroom: Classroom | null) => void): Unsubscribe {
    if (!classId) {
      callback(null)
      return () => undefined
    }
    const docRef = firestore.getDocument<Classroom>(`classrooms/${classId}`)
    return onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback(null)
        return
      }
      callback({ id: docSnap.id, ...(docSnap.data() as Classroom) })
    })
  },

  subscribeToMembers(classId: string, callback: (members: ClassroomMember[]) => void): Unsubscribe {
    if (!classId) {
      callback([])
      return () => undefined
    }
    const membersCollection = collection(
      firestore.getDb(),
      `classrooms/${classId}/members`,
    ).withConverter(createConverter<ClassroomMember>(classroomMemberSchema))
    return onSnapshot(membersCollection, (snapshot) => {
      callback(snapshot.docs.map((docRef) => mapMember(classId, docRef)))
    })
  },

  subscribeToSessions(classId: string, callback: (sessions: Session[]) => void): Unsubscribe {
    if (!classId) {
      callback([])
      return () => undefined
    }
    const sessionsCollection = collection(
      firestore.getDb(),
      `classrooms/${classId}/sessions`,
    ).withConverter(createConverter<Session>())
    return onSnapshot(sessionsCollection, (snapshot) => {
      callback(snapshot.docs.map((docRef) => mapSession(classId, docRef)))
    })
  },
}

