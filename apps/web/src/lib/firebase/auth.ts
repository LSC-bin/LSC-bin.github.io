import { getAuth, type Auth } from 'firebase/auth'

import { getFirebaseApp } from './app'

let authInstance: Auth | null = null

export const getFirebaseAuth = (): Auth => {
  if (authInstance) {
    return authInstance
  }

  authInstance = getAuth(getFirebaseApp())
  return authInstance
}


