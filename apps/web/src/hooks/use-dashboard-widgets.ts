import { useEffect, useMemo, useState } from 'react'

import {
  dashboardWidgetsService,
  type DashboardWidgetPreference,
  type WidgetSize,
} from '../services'
import { logger } from '../lib/logger'

export type WidgetDefinition<TSettings = Record<string, unknown>> = {
  widgetId: string
  defaultOrder: number
  defaultVisible: boolean
  defaultSize: WidgetSize
  defaultSettings?: TSettings
}

export type ResolvedWidgetPreference<TSettings = Record<string, unknown>> = {
  widgetId: string
  order: number
  isVisible: boolean
  size: WidgetSize
  settings: TSettings
}

type Options<TSettings> = {
  classId: string | null
  definitions: WidgetDefinition<TSettings>[]
}

const mergePreferences = <TSettings,>(
  definitions: WidgetDefinition<TSettings>[],
  stored: DashboardWidgetPreference[],
): ResolvedWidgetPreference<TSettings>[] => {
  const storedMap = new Map(stored.map((item) => [item.widgetId, item]))

  return definitions
    .map((definition) => {
      const storedPref = storedMap.get(definition.widgetId)
      return {
        widgetId: definition.widgetId,
        order:
          storedPref && Number.isFinite(storedPref.order)
            ? storedPref.order
            : definition.defaultOrder,
        isVisible: storedPref ? Boolean(storedPref.isVisible) : definition.defaultVisible,
        size: storedPref?.size ?? definition.defaultSize,
        settings: (storedPref?.settings ?? definition.defaultSettings ?? {}) as TSettings,
      }
    })
    .sort((a, b) => a.order - b.order)
}

export const useDashboardWidgetsPreferences = <TSettings = Record<string, unknown>>({
  classId,
  definitions,
}: Options<TSettings>) => {
  const [state, setState] = useState<{
    preferences: ResolvedWidgetPreference<TSettings>[]
    isLoading: boolean
    error: Error | null
  }>({
    preferences: [],
    isLoading: Boolean(classId),
    error: null,
  })

  useEffect(() => {
    if (!classId) {
      setState({
        preferences: mergePreferences(definitions, []),
        isLoading: false,
        error: null,
      })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    const unsubscribe = dashboardWidgetsService.subscribePreferences(classId, (prefs) => {
      setState({
        preferences: mergePreferences(definitions, prefs),
        isLoading: false,
        error: null,
      })
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [classId, definitions])

  const savePreferences = async (preferences: ResolvedWidgetPreference<TSettings>[]) => {
    if (!classId) {
      setState((prev) => ({
        ...prev,
        preferences,
      }))
      return
    }

    try {
      await dashboardWidgetsService.savePreferences(classId, preferences)
      setState((prev) => ({
        ...prev,
        preferences,
      }))
    } catch (error) {
      logger.error('Failed to save widget preferences', {
        error: error instanceof Error ? error.message : String(error),
      })
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to save preferences'),
      }))
      throw error
    }
  }

  const orderedVisibleWidgets = useMemo(
    () => state.preferences.filter((widget) => widget.isVisible).sort((a, b) => a.order - b.order),
    [state.preferences],
  )

  return {
    preferences: state.preferences,
    orderedVisibleWidgets,
    isLoading: state.isLoading,
    error: state.error,
    savePreferences,
  }
}




