/* eslint-disable import/order */

import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import { getApp, getApps, initializeApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

import { getEnv } from './env'

let cachedConfig: FirebaseOptions | null = null
let cachedApp: FirebaseApp | null = null
let cachedFirestore: Firestore | null = null
let cachedAuth: Auth | null = null
let cachedStorage: FirebaseStorage | null = null

const getEmulatorHost = (): string => {
  const viteValue =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_FIRESTORE_EMULATOR_HOST as string | undefined)
      : undefined
  if (viteValue && viteValue.length > 0) {
    return viteValue
  }
  return typeof process !== 'undefined' ? process.env.FIRESTORE_EMULATOR_HOST ?? '' : ''
}
const parseHostPort = (hostPort: string): [string, number] => {
  const [host, port] = hostPort.split(':')
  return [host || '127.0.0.1', Number(port || 8080)]
}

export const getFirebaseConfig = (): FirebaseOptions => {
  if (cachedConfig) {
    return cachedConfig
  }

  const env = getEnv()
  cachedConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  }

  return cachedConfig
}

export const getFirebaseApp = (): FirebaseApp => {
  if (cachedApp) {
    return cachedApp
  }

  cachedApp = getApps().length ? getApp() : initializeApp(getFirebaseConfig())

  const emulatorHost = import.meta.env.DEV ? getEmulatorHost() : ''
  if (emulatorHost) {
    const [host, port] = parseHostPort(emulatorHost)

    if (!cachedFirestore) {
      cachedFirestore = getFirestore(cachedApp)
      connectFirestoreEmulator(cachedFirestore, host, port)
    }

    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp)
      connectAuthEmulator(cachedAuth, `http://${host}:9099`, { disableWarnings: true })
    }

    if (!cachedStorage) {
      cachedStorage = getStorage(cachedApp)
      connectStorageEmulator(cachedStorage, host, 9199)
    }
  }

  return cachedApp
}

export const getEmulatedFirestore = (): Firestore => {
  if (!cachedFirestore) {
    cachedFirestore = getFirestore(getFirebaseApp())
  }
  return cachedFirestore
}

