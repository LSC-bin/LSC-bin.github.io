import { useCallback } from 'react'

import { authService } from '../services/auth-service'
import { useAuthStore } from '../stores'

import type { UserProfile, UserRole } from '../types'

type SignUpInput = {
  email: string
  password: string
  displayName: string
  role: UserRole
}

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const setUser = useAuthStore((state) => state.setUser)
  const startLoading = useAuthStore((state) => state.startLoading)
  const stopLoading = useAuthStore((state) => state.stopLoading)
  const resetUser = useAuthStore((state) => state.signOut)

  const signIn = useCallback(
    async (email: string, password: string): Promise<UserProfile> => {
      startLoading()
      try {
        const credential = await authService.signIn(email, password)
        const profile = await authService.ensureUserProfile(credential.user)
        setUser({
          id: profile.id,
          displayName: profile.displayName,
          email: profile.email,
          role: profile.role,
        })
        return profile
      } catch (error) {
        resetUser()
        throw error
      } finally {
        stopLoading()
      }
    },
    [resetUser, setUser, startLoading, stopLoading],
  )

  const signUp = useCallback(
    async (input: SignUpInput): Promise<UserProfile> => {
      startLoading()
      try {
        const profile = await authService.signUp(input)
        setUser({
          id: profile.id,
          displayName: profile.displayName,
          email: profile.email,
          role: profile.role,
        })
        return profile
      } catch (error) {
        resetUser()
        throw error
      } finally {
        stopLoading()
      }
    },
    [resetUser, setUser, startLoading, stopLoading],
  )

  const signOut = useCallback(async () => {
    startLoading()
    try {
      await authService.signOut()
      resetUser()
    } finally {
      stopLoading()
    }
  }, [resetUser, startLoading, stopLoading])

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }
}



