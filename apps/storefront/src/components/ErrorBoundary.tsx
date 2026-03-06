'use client'

import { Component, type ReactNode } from 'react'
import { reportError } from '@/lib/error-reporter'

interface Props {
   children: ReactNode
   fallback?: ReactNode
}

interface State {
   hasError: boolean
   error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
   constructor(props: Props) {
      super(props)
      this.state = { hasError: false, error: null }
   }

   static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error }
   }

   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      reportError({
         message: error.message,
         stack: error.stack,
         severity: 'high',
         source: 'frontend',
         metadata: {
            componentStack: errorInfo.componentStack,
         },
      })
   }

   render() {
      if (this.state.hasError) {
         if (this.props.fallback) return this.props.fallback
         return (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-4 text-center">
               <p className="text-sm text-muted-foreground">Bu bolum yuklenirken bir hata olustu.</p>
               <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="text-sm underline text-primary hover:opacity-80"
               >
                  Tekrar Dene
               </button>
            </div>
         )
      }
      return this.props.children
   }
}
