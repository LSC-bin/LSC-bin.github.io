import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'

import { getFirebaseAuth } from '../lib/firebase'
import { userProfileSchema } from '../lib/firebase/schemas'
import { createConverter, firestore } from '../lib/firebase/firestore'

import type { Unsubscribe } from 'firebase/auth'
import type { UserProfile, UserRole } from '../types'

const getAuth = (): Auth => getFirebaseAuth()

const getUserDocRef = (userId: string) =>
  firestore.getDocument<UserProfile>(`users/${userId}`, userProfileSchema)

const ensureUserProfile = async (user: User): Promise<UserProfile> => {
  const snapshot = await getDoc(getUserDocRef(user.uid))
  const now = new Date().toISOString()

  if (!snapshot.exists()) {
    const profile: UserProfile = {
      id: user.uid,
      displayName: user.displayName ?? user.email ?? '사용자',
      email: user.email ?? '',
      role: 'teacher',
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(getUserDocRef(user.uid), profile, { merge: true })
    return profile
  }

  return { id: snapshot.id, ...snapshot.data() }
}

export const authService = {
  signUp: async (params: {
    email: string
    password: string
    displayName: string
    role: UserRole
  }): Promise<UserProfile> => {
    const credential = await createUserWithEmailAndPassword(
      getAuth(),
      params.email,
      params.password,
    )
    if (params.displayName) {
      await updateProfile(credential.user, { displayName: params.displayName })
    }

    const now = new Date().toISOString()
    const profile: UserProfile = {
      id: credential.user.uid,
      displayName: params.displayName || credential.user.displayName || params.email,
      email: credential.user.email ?? params.email,
      role: params.role,
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(getUserDocRef(credential.user.uid), { ...profile, updatedAt: now })
    return profile
  },

  signIn: async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(getAuth(), email, password)
  },

  signOut: async (): Promise<void> => {
    await signOut(getAuth())
  },

  observeAuthState: (callback: (user: User | null) => void): Unsubscribe => {
    return onAuthStateChanged(getAuth(), callback)
  },

  fetchUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const snapshot = await getDoc(getUserDocRef(userId))
    if (!snapshot.exists()) {
      return null
    }
    return { id: snapshot.id, ...snapshot.data() }
  },

  ensureUserProfile,
}


