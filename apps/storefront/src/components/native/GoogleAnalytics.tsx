'use client'

import { useEffect } from 'react'

declare global {
   interface Window {
      gtag?: (...args: unknown[]) => void
   }
}

export default function GoogleAnalyticsConsent() {
   useEffect(() => {
      const grant = () =>
         window.gtag?.('consent', 'update', { analytics_storage: 'granted' })

      const checkConsent = () => {
         try {
            const raw = localStorage.getItem('cookie-consent')
            if (!raw) return
            const parsed = JSON.parse(raw)
            if (parsed === 'accepted' || parsed === true || parsed?.analytics === true) grant()
         } catch {
            const raw = localStorage.getItem('cookie-consent')
            if (raw === 'accepted' || raw === 'true') grant()
         }
      }

      checkConsent()
      window.addEventListener('cookie-consent-updated', checkConsent)
      window.addEventListener('storage', checkConsent)
      return () => {
         window.removeEventListener('cookie-consent-updated', checkConsent)
         window.removeEventListener('storage', checkConsent)
      }
   }, [])

   return null
}
