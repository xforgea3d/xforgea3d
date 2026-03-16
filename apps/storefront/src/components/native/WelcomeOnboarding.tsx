'use client'

import { useAuthenticated } from '@/hooks/useAuthentication'
import { useUserContext } from '@/state/User'
import { useCsrf } from '@/hooks/useCsrf'
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'onboarding-completed'

const features = [
   {
      icon: (
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
         </svg>
      ),
      title: 'Kişiye Özel 3D Baskı',
      desc: 'Hayalinizdeki ürünü birlikte tasarlayalım',
   },
   {
      icon: (
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
         </svg>
      ),
      title: 'Türkiye Geneli Kargo',
      desc: 'Hızlı ve güvenli teslimat',
   },
   {
      icon: (
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
         </svg>
      ),
      title: '14 Gün İade Garantisi',
      desc: 'Koşulsuz iade hakkı',
   },
]

const INSTAGRAM_URL = 'https://www.instagram.com/xforgea3d'

export default function WelcomeOnboarding() {
   const { authenticated } = useAuthenticated()
   const { user } = useUserContext()
   const csrfToken = useCsrf()
   const [visible, setVisible] = useState(false)
   const [marketingChecked, setMarketingChecked] = useState(false)
   const [saving, setSaving] = useState(false)

   useEffect(() => {
      // Only show when auth has resolved to true (not null/loading)
      if (authenticated === true && typeof window !== 'undefined') {
         const completed = localStorage.getItem(STORAGE_KEY)
         if (!completed) {
            setVisible(true)
         }
      }
   }, [authenticated])

   const handleComplete = useCallback(async () => {
      setSaving(true)
      try {
         await fetch('/api/profile', {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               ...(csrfToken && { 'x-csrf-token': csrfToken }),
            },
            body: JSON.stringify({
               marketingConsent: marketingChecked,
               csrfToken,
            }),
         })
      } catch (err) {
         console.error('[WelcomeOnboarding] Failed to save preferences', err)
      }
      localStorage.setItem(STORAGE_KEY, 'true')
      setVisible(false)
      setSaving(false)
   }, [csrfToken, marketingChecked])

   if (!visible) return null

   const userName = user?.name

   return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
         <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
            <div className="p-6 sm:p-8">
               <div className="flex flex-col items-center text-center space-y-5">
                  {/* Logo / Gradient Icon */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                     <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-10 w-10"
                     >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                     </svg>
                  </div>

                  <div>
                     <h2 className="text-2xl font-bold text-foreground">
                        Ho&#x15F; Geldiniz! <span aria-hidden="true">&#127881;</span>
                     </h2>
                     {userName && (
                        <p className="mt-1 text-base font-medium text-foreground">
                           Merhaba, {userName}!
                        </p>
                     )}
                     <p className="mt-2 text-sm text-muted-foreground">
                        xForgea3D ailesine kat&#x131;ld&#x131;&#x11F;&#x131;n&#x131;z i&ccedil;in te&#x15F;ekk&uuml;rler.
                     </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="w-full space-y-3">
                     {features.map((feature) => (
                        <div
                           key={feature.title}
                           className="flex items-center gap-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 text-left"
                        >
                           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex-shrink-0">
                              {feature.icon}
                           </div>
                           <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                              <p className="text-xs text-muted-foreground">{feature.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Marketing Consent */}
                  <label className="flex items-start gap-3 cursor-pointer w-full text-left">
                     <input
                        type="checkbox"
                        checked={marketingChecked}
                        onChange={(e) => setMarketingChecked(e.target.checked)}
                        className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 accent-orange-500 flex-shrink-0"
                     />
                     <span className="text-sm text-muted-foreground leading-relaxed">
                        Kampanya ve indirimlerden haberdar olmak istiyorum
                     </span>
                  </label>

                  {/* Instagram Follow CTA */}
                  <div className="w-full rounded-xl border border-orange-200 dark:border-orange-800/40 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-3">
                     <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white flex-shrink-0">
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                           </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-semibold text-foreground">Bizi Instagram&apos;da Takip Edin</p>
                           <a
                              href={INSTAGRAM_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors"
                           >
                              @xforgea3d
                           </a>
                        </div>
                        <a
                           href={INSTAGRAM_URL}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-shrink-0 inline-flex items-center rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all"
                        >
                           Takip Et
                        </a>
                     </div>
                  </div>

                  {/* CTA Button */}
                  <button
                     onClick={handleComplete}
                     disabled={saving}
                     className="mt-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  >
                     {saving ? 'Kaydediliyor...' : 'Alışverişe Başla'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
