import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { UserProfile, UserRole } from '../types'

export type AuthUser = Pick<UserProfile, 'id' | 'displayName' | 'email' | 'role'>

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
}

type AuthActions = {
  setUser: (user: AuthUser | null) => void
  startLoading: () => void
  stopLoading: () => void
  signOut: () => void
}

const fallbackStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  length: 0,
  key: () => null,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user, isLoading: false }),
      startLoading: () => set({ isLoading: true }),
      stopLoading: () => set({ isLoading: false }),
      signOut: () => set({ user: null, isLoading: false }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : fallbackStorage,
      ),
      version: 1,
      partialize: (state) => ({ user: state.user }),
    },
  ),
)


