'use client'

import { basePath } from '@/lib/base-path'
import { useEffect } from 'react'

export function BasePathProvider() {
   useEffect(() => {
      if (!basePath) return

      const originalFetch = window.fetch.bind(window)
      window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
         if (typeof input === 'string' && input.startsWith('/api/')) {
            return originalFetch(`${basePath}${input}`, init)
         }
         if (input instanceof Request && input.url.startsWith(`${window.location.origin}/api/`)) {
            return originalFetch(new Request(input.url.replace(window.location.origin, `${window.location.origin}${basePath}`), input), init)
         }
         return originalFetch(input, init)
      }) as typeof window.fetch

      return () => {
         window.fetch = originalFetch
      }
   }, [])

   return null
}
