'use client'

import { Component, type ReactNode } from 'react'
import { Button } from './button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Algo salio mal
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              {this.state.error?.message || 'Error inesperado'}
            </p>
          </div>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reintentar
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
