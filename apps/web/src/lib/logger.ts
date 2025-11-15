type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export type TelemetryEvent = {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

declare global {
  interface Window {
    __classboardTelemetry?: TelemetryEvent[]
  }
}

const emit = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const event: TelemetryEvent = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  }

  if (typeof window !== 'undefined') {
    window.__classboardTelemetry = window.__classboardTelemetry ?? []
    window.__classboardTelemetry.push(event)
  }

  if (import.meta.env.DEV) {
    const payload = context ? { message, context } : { message }
    switch (level) {
      case 'error':
        console.error('[ClassBoard]', payload)
        break
      case 'warn':
        console.warn('[ClassBoard]', payload)
        break
      case 'debug':
        console.debug('[ClassBoard]', payload)
        break
      default:
        console.info('[ClassBoard]', payload)
    }
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => emit('error', message, context),
  debug: (message: string, context?: Record<string, unknown>) => emit('debug', message, context),
}



