'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function ClarityAnalytics() {
   const [consentGiven, setConsentGiven] = useState(false)
   const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

   useEffect(() => {
      const checkConsent = () => {
         try {
            const consent = localStorage.getItem('cookie-consent')
            if (consent) {
               const parsed = JSON.parse(consent)
               // Support both { analytics: true } object format and simple "accepted" string
               if (
                  parsed === 'accepted' ||
                  parsed === true ||
                  parsed?.analytics === true
               ) {
                  setConsentGiven(true)
               }
            }
         } catch {
            // If parsing fails, check as plain string
            const consent = localStorage.getItem('cookie-consent')
            if (consent === 'accepted' || consent === 'true') {
               setConsentGiven(true)
            }
         }
      }

      checkConsent()

      // Re-check when cookie consent changes (custom event from cookie banner)
      const handleConsentChange = () => checkConsent()
      window.addEventListener('cookie-consent-updated', handleConsentChange)
      window.addEventListener('storage', handleConsentChange)

      return () => {
         window.removeEventListener('cookie-consent-updated', handleConsentChange)
         window.removeEventListener('storage', handleConsentChange)
      }
   }, [])

   if (!clarityId || !consentGiven) return null

   const clarityScript = {
      __html: `
         (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
         })(window, document, "clarity", "script", "${clarityId}");
      `,
   }

   return (
      <Script
         id="microsoft-clarity"
         strategy="afterInteractive"
         dangerouslySetInnerHTML={clarityScript}
      />
   )
}
