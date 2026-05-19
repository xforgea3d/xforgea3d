'use client'

import { useEffect } from 'react'
import { reportError } from '@/lib/error-reporter'

function getFetchUrl(input: RequestInfo | URL) {
   return typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
}

function isAbortError(error: unknown) {
   return error instanceof DOMException && error.name === 'AbortError'
}

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
               const url = getFetchUrl(args[0])
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
            if (!isAbortError(fetchError)) {
               console.warn('[fetch]', fetchError?.message || fetchError)
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
