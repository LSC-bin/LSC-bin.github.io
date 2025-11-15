import { Component, type ErrorInfo, type ReactNode } from 'react'

import { handleError } from '../../lib/error-handler'
import { EmptyState } from './EmptyState'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    handleError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md space-y-4 rounded-2xl border border-red-500/20 bg-surface-900/95 p-6">
            <EmptyState
              title="오류가 발생했습니다"
              description={
                this.state.error?.message ||
                '예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'
              }
            >
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
                >
                  다시 시도
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-400 hover:text-white"
                >
                  페이지 새로고침
                </button>
              </div>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 rounded-lg bg-surface-800/60 p-3 text-xs text-slate-400">
                  <summary className="cursor-pointer font-semibold text-red-400">
                    개발자 정보 (개발 모드에서만 표시)
                  </summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </EmptyState>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

