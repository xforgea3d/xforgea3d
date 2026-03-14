'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, ChevronDown, ChevronUp, Settings, X } from 'lucide-react'

interface CookiePreferences {
   necessary: boolean
   analytics: boolean
   marketing: boolean
   timestamp: string
}

const STORAGE_KEY = 'cookie-consent'

function setCookie(name: string, value: string, maxAge: number) {
   document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export default function CookieConsent() {
   const [visible, setVisible] = useState(false)
   const [showSettings, setShowSettings] = useState(false)
   const [analytics, setAnalytics] = useState(false)
   const [marketing, setMarketing] = useState(false)
   const [animateOut, setAnimateOut] = useState(false)

   useEffect(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
         // Small delay for slide-up effect
         const timer = setTimeout(() => setVisible(true), 500)
         return () => clearTimeout(timer)
      }
   }, [])

   // Listen for custom event to re-open the banner
   useEffect(() => {
      const handler = () => {
         const stored = localStorage.getItem(STORAGE_KEY)
         if (stored) {
            try {
               const prefs: CookiePreferences = JSON.parse(stored)
               setAnalytics(prefs.analytics)
               setMarketing(prefs.marketing)
            } catch {}
         }
         setVisible(true)
         setAnimateOut(false)
      }
      window.addEventListener('open-cookie-settings', handler)
      return () => window.removeEventListener('open-cookie-settings', handler)
   }, [])

   const dismiss = () => {
      setAnimateOut(true)
      setTimeout(() => {
         setVisible(false)
         setAnimateOut(false)
      }, 300)
   }

   const savePreferences = (prefs: CookiePreferences) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
      setCookie('cookie-consent', 'accepted', 31536000)
      dismiss()
   }

   const acceptAll = () => {
      savePreferences({
         necessary: true,
         analytics: true,
         marketing: true,
         timestamp: new Date().toISOString(),
      })
   }

   const acceptNecessary = () => {
      savePreferences({
         necessary: true,
         analytics: false,
         marketing: false,
         timestamp: new Date().toISOString(),
      })
   }

   const saveCustom = () => {
      savePreferences({
         necessary: true,
         analytics,
         marketing,
         timestamp: new Date().toISOString(),
      })
   }

   if (!visible) return null

   return (
      <div
         className={`fixed bottom-0 left-0 right-0 z-50 p-2 md:p-6 transition-transform duration-300 ease-out ${
            animateOut ? 'translate-y-full' : 'animate-slide-up'
         }`}
      >
         <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white/95 p-3 md:p-5 shadow-2xl backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95 max-h-[40vh] md:max-h-none overflow-y-auto">
            {/* Mobile compact layout */}
            <div className="flex md:hidden items-center gap-2">
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <Cookie className="h-4 w-4 text-orange-500" />
               </div>
               <p className="text-[11px] leading-tight text-neutral-600 dark:text-neutral-400 flex-1 min-w-0">
                  Çerez kullanıyoruz.{' '}
                  <Link
                     href="/policies/gizlilik-ve-cerez-politikasi"
                     className="font-medium text-orange-500 underline underline-offset-2"
                  >
                     Detaylar
                  </Link>
               </p>
               <div className="flex items-center gap-1.5 shrink-0">
                  <button
                     onClick={() => setShowSettings(!showSettings)}
                     className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-2 py-1.5 text-[10px] font-medium text-neutral-700 dark:border-neutral-600 dark:text-neutral-300"
                  >
                     <Settings className="h-3 w-3" />
                  </button>
                  <button
                     onClick={acceptAll}
                     className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-1.5 text-[10px] font-semibold text-white"
                  >
                     Kabul Et
                  </button>
               </div>
            </div>

            {/* Desktop full layout */}
            <div className="hidden md:block">
               {/* Header */}
               <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                        <Cookie className="h-5 w-5 text-orange-500" />
                     </div>
                     <div>
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                           Çerez Kullanımı
                        </h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                           Bu web sitesi deneyiminizi iyileştirmek için çerezler kullanmaktadır.{' '}
                           <Link
                              href="/policies/gizlilik-ve-cerez-politikasi"
                              className="font-medium text-orange-500 underline underline-offset-2 hover:text-orange-600"
                           >
                              Çerez Politikası
                           </Link>
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={dismiss}
                     className="shrink-0 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                     aria-label="Kapat"
                  >
                     <X className="h-4 w-4" />
                  </button>
               </div>
            </div>

            {/* Settings Panel (shared mobile+desktop) */}
            {showSettings && (
               <div className="mt-3 md:mt-4 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 md:p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                  {/* Necessary */}
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                           Zorunlu Çerezler
                        </p>
                        <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                           Oturum, kimlik doğrulama, CSRF koruması
                        </p>
                     </div>
                     <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full bg-orange-500">
                        <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white shadow transition-transform" />
                     </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                           Analitik Çerezler
                        </p>
                        <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                           Google Analytics, site trafik analizi
                        </p>
                     </div>
                     <button
                        onClick={() => setAnalytics(!analytics)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                           analytics ? 'bg-orange-500' : 'bg-neutral-300 dark:bg-neutral-600'
                        }`}
                        role="switch"
                        aria-checked={analytics}
                     >
                        <span
                           className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              analytics ? 'translate-x-6' : 'translate-x-1'
                           }`}
                        />
                     </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                           Pazarlama Çerezleri
                        </p>
                        <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                           Reklam, yeniden pazarlama, hedefleme
                        </p>
                     </div>
                     <button
                        onClick={() => setMarketing(!marketing)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                           marketing ? 'bg-orange-500' : 'bg-neutral-300 dark:bg-neutral-600'
                        }`}
                        role="switch"
                        aria-checked={marketing}
                     >
                        <span
                           className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              marketing ? 'translate-x-6' : 'translate-x-1'
                           }`}
                        />
                     </button>
                  </div>

                  <button
                     onClick={saveCustom}
                     className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-2 text-xs md:text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                     Tercihleri Kaydet
                  </button>
               </div>
            )}

            {/* Buttons (desktop only -- mobile has inline buttons above) */}
            <div className="mt-4 hidden md:flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
               <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
               >
                  <Settings className="h-3.5 w-3.5" />
                  Ayarlar
                  {showSettings ? (
                     <ChevronUp className="h-3 w-3" />
                  ) : (
                     <ChevronDown className="h-3 w-3" />
                  )}
               </button>
               <button
                  onClick={acceptNecessary}
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
               >
                  Sadece Gerekli
               </button>
               <button
                  onClick={acceptAll}
                  className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
               >
                  Tümünü Kabul Et
               </button>
            </div>
         </div>
      </div>
   )
}
