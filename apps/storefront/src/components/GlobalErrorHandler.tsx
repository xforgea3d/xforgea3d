'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/error-reporter'

export function GlobalErrorHandler() {
   useEffect(() => {
      // Catch unhandled errors
      const onError = (event: ErrorEvent) => {
         reportError({
            message: event.message || 'Unhandled error',
            stack: event.error?.stack,
            severity: 'critical',
            source: 'frontend',
            metadata: {
               filename: event.filename,
               lineno: event.lineno,
               colno: event.colno,
            },
         })
      }

      // Catch unhandled promise rejections
      const onUnhandledRejection = (event: PromiseRejectionEvent) => {
         const error = event.reason
         reportError({
            message: error?.message || 'Unhandled promise rejection',
            stack: error?.stack,
            severity: 'high',
            source: 'frontend',
            metadata: {
               type: 'unhandledrejection',
               reason: String(error),
            },
         })
      }

      // Catch fetch errors (monkey-patch fetch)
      const originalFetch = window.fetch
      window.fetch = async function (...args) {
         try {
            const response = await originalFetch.apply(this, args)

            // Log 5xx errors automatically
            if (response.status >= 500) {
               const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0])
               // Don't log errors about the error-logs endpoint itself (prevent loops)
               if (!url.includes('/api/error-logs')) {
                  reportError({
                     message: `Server Error: ${response.status} ${url}`,
                     severity: 'critical',
                     source: 'frontend',
                     metadata: { apiUrl: url, statusCode: response.status },
                  })
               }
            }

            return response
         } catch (fetchError: any) {
            // Network errors
            const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0])
            if (!url.includes('/api/error-logs')) {
               reportError({
                  message: `Network Error: ${fetchError.message} ${url}`,
                  severity: 'high',
                  source: 'frontend',
                  metadata: { apiUrl: url, type: 'network_error' },
               })
            }
            throw fetchError
         }
      }

      window.addEventListener('error', onError)
      window.addEventListener('unhandledrejection', onUnhandledRejection)

      return () => {
         window.removeEventListener('error', onError)
         window.removeEventListener('unhandledrejection', onUnhandledRejection)
         window.fetch = originalFetch
      }
   }, [])

   return null
}
