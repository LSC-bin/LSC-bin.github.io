import { useEffect } from 'react'

import { handleError } from '../lib/error-handler'
import { authService } from '../services'
import { useAuthStore } from '../stores'

export const AuthSync = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.signOut)
  const startLoading = useAuthStore((state) => state.startLoading)
  const stopLoading = useAuthStore((state) => state.stopLoading)

  useEffect(() => {
    startLoading()
    const unsubscribe = authService.observeAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        clearUser()
        stopLoading()
        return
      }

      try {
        const profile =
          (await authService.fetchUserProfile(firebaseUser.uid)) ??
          (await authService.ensureUserProfile(firebaseUser))

        setUser({
          id: profile.id,
          displayName: profile.displayName,
          email: profile.email,
          role: profile.role,
        })
      } catch (error) {
        handleError(error, { component: 'AuthSync', action: 'syncAuthState' })
        clearUser()
      } finally {
        stopLoading()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [clearUser, setUser, startLoading, stopLoading])

  return null
}



