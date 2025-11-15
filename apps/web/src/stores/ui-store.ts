import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type ThemeMode = 'dark' | 'light'

type UIState = {
  theme: ThemeMode
  isSidebarOpen: boolean
  selectedClassId: string | null
  selectedSessionId: string | null
}

type UIActions = {
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
  setSelectedClassId: (classId: string | null) => void
  setSelectedSessionId: (sessionId: string | null) => void
  initializeSelection: (params: { classId?: string | null; sessionId?: string | null }) => void
}

const DEFAULT_STATE: UIState = {
  theme: 'dark',
  isSidebarOpen: false,
  selectedClassId: null,
  selectedSessionId: null,
}

const fallbackStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  length: 0,
  key: () => null,
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setTheme: (theme) => set({ theme }),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
      toggleSidebar: () =>
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
        })),
      setSelectedClassId: (selectedClassId) =>
        set((state) => ({
          selectedClassId,
          selectedSessionId:
            selectedClassId && selectedClassId === state.selectedClassId
              ? state.selectedSessionId
              : null,
        })),
      setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),
      initializeSelection: ({ classId, sessionId }) =>
        set((state) => ({
          selectedClassId: classId ?? state.selectedClassId,
          selectedSessionId: sessionId ?? state.selectedSessionId,
        })),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : fallbackStorage,
      ),
      version: 2,
    },
  ),
)

