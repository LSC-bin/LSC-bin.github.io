import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'

import { firestore } from './firebase'

export type WidgetSize = 'small' | 'medium' | 'large'

export type DashboardWidgetPreference = {
  widgetId: string
  order: number
  isVisible: boolean
  size: WidgetSize
  settings?: Record<string, unknown>
}

type DashboardWidgetPreferenceDoc = {
  widgets: DashboardWidgetPreference[]
}

const DEFAULT_DOC: DashboardWidgetPreferenceDoc = {
  widgets: [],
}

const getPreferencesDocRef = (classId: string) =>
  doc(firestore.getDb(), `classrooms/${classId}/preferences`, 'dashboardWidgets')

const mapDoc = (docSnap: DocumentData | undefined): DashboardWidgetPreferenceDoc => {
  if (!docSnap) return DEFAULT_DOC
  if (!Array.isArray(docSnap.widgets)) {
    return DEFAULT_DOC
  }
  return {
    widgets: docSnap.widgets
      .filter((item) => typeof item?.widgetId === 'string')
      .map((item, index) => ({
        widgetId: item.widgetId,
        order: Number.isFinite(item.order) ? item.order : index + 1,
        isVisible:
          typeof item.isVisible === 'boolean'
            ? item.isVisible
            : item.isVisible === 'false'
              ? false
              : true,
        size:
          item.size === 'small' || item.size === 'large'
            ? item.size
            : ('medium' as WidgetSize),
        settings: item.settings ?? undefined,
      })),
  }
}

export const dashboardWidgetsService = {
  async getPreferences(classId: string): Promise<DashboardWidgetPreference[]> {
    if (!classId) return []
    const docRef = getPreferencesDocRef(classId)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) {
      return []
    }
    const data = mapDoc(snapshot.data())
    return data.widgets
  },

  async savePreferences(classId: string, preferences: DashboardWidgetPreference[]) {
    if (!classId) {
      throw new Error('classId is required to save dashboard widgets')
    }
    const docRef = getPreferencesDocRef(classId)
    const payload: DashboardWidgetPreferenceDoc = {
      widgets: preferences.map((item, index) => ({
        widgetId: item.widgetId,
        order: Number.isFinite(item.order) ? item.order : index + 1,
        isVisible: item.isVisible,
        size: item.size ?? 'medium',
        settings: item.settings ?? undefined,
      })),
    }

    await setDoc(docRef, payload, { merge: true })
  },

  subscribePreferences(
    classId: string,
    callback: (preferences: DashboardWidgetPreference[]) => void,
  ): Unsubscribe | null {
    if (!classId) {
      callback([])
      return null
    }

    const docRef = getPreferencesDocRef(classId)
    return onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([])
        return
      }
      const data = mapDoc(snapshot.data())
      callback(data.widgets)
    })
  },
}




