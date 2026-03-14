'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { BellIcon, XIcon } from 'lucide-react'
import { useCsrf } from '@/hooks/useCsrf'

interface Notification {
   id: string
   content: string
   type: string
   isRead: boolean
   createdAt: string
}

interface PopupItem {
   id: string
   content: string
   type: 'popup' | 'modal'
}

function highlightCoupon(text: string) {
   // Match patterns like "Kupon kodunuz: XXXX" or standalone uppercase codes
   const parts = text.split(/(\b[A-Z0-9]{4,20}\b)/g)
   return parts.map((part, i) => {
      if (/^[A-Z0-9]{4,20}$/.test(part) && text.toLowerCase().includes('kupon')) {
         return (
            <span
               key={i}
               className="inline-block bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-bold px-2 py-0.5 rounded-md mx-0.5 tracking-wider"
            >
               {part}
            </span>
         )
      }
      return part
   })
}

export default function PopupNotification() {
   const [popups, setPopups] = useState<PopupItem[]>([])
   const [modals, setModals] = useState<PopupItem[]>([])
   const shownIdsRef = useRef<Set<string>>(new Set())
   const csrfToken = useCsrf()

   const fetchAndShowPopups = useCallback(async () => {
      try {
         const res = await fetch('/api/notifications', { cache: 'no-store' })
         if (!res.ok) return
         const data = await res.json()
         const notifications: Notification[] = data.notifications ?? []

         const newItems = notifications.filter(
            (n) =>
               (n.type === 'popup' || n.type === 'modal') &&
               !n.isRead &&
               !shownIdsRef.current.has(n.id)
         )

         if (newItems.length > 0) {
            const newPopups: PopupItem[] = []
            const newModals: PopupItem[] = []

            for (const p of newItems) {
               shownIdsRef.current.add(p.id)
               const item = { id: p.id, content: p.content, type: p.type as 'popup' | 'modal' }
               if (p.type === 'modal') {
                  newModals.push(item)
               } else {
                  newPopups.push(item)
               }
            }

            if (newPopups.length > 0) {
               setPopups((prev) => [...prev, ...newPopups])
            }
            if (newModals.length > 0) {
               setModals((prev) => [...prev, ...newModals])
            }

            // Mark as read
            const ids = newItems.map((n) => n.id)
            try {
               await fetch('/api/notifications', {
                  method: 'PATCH',
                  headers: {
                     'Content-Type': 'application/json',
                     ...(csrfToken && { 'x-csrf-token': csrfToken }),
                  },
                  body: JSON.stringify({ ids, csrfToken }),
               })
            } catch {
               // non-critical
            }
         }
      } catch {
         // silently fail
      }
   }, [csrfToken])

   useEffect(() => {
      fetchAndShowPopups()
      const interval = setInterval(fetchAndShowPopups, 30000)
      return () => clearInterval(interval)
   }, [fetchAndShowPopups])

   // Auto-dismiss popups (toasts) after 8 seconds
   useEffect(() => {
      if (popups.length === 0) return
      const timer = setTimeout(() => {
         setPopups((prev) => prev.slice(1))
      }, 8000)
      return () => clearTimeout(timer)
   }, [popups])

   function dismissPopup(id: string) {
      setPopups((prev) => prev.filter((p) => p.id !== id))
   }

   function dismissModal(id: string) {
      setModals((prev) => prev.filter((m) => m.id !== id))
   }

   return (
      <>
         {/* Toast popups - top right */}
         {popups.length > 0 && (
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
               {popups.map((popup) => (
                  <div
                     key={popup.id}
                     className="pointer-events-auto animate-in slide-in-from-right-full fade-in duration-300 rounded-lg border border-orange-300 dark:border-orange-600 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden"
                  >
                     <div className="border-l-4 border-l-orange-500 p-4">
                        <div className="flex items-start gap-3">
                           <div className="shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                              <BellIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">
                                 Bildirim
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">
                                 {popup.content}
                              </p>
                           </div>
                           <button
                              onClick={() => dismissPopup(popup.id)}
                              className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              aria-label="Kapat"
                           >
                              <XIcon className="h-4 w-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Modal notifications - center screen */}
         {modals.length > 0 && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center">
               {/* Backdrop */}
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

               {/* Modal card - show only the first, dismiss to see next */}
               <div className="relative z-10 w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-300">
                  <div className="rounded-2xl border border-orange-400/30 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">
                     {/* Orange accent top bar */}
                     <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-600" />

                     <div className="p-6 space-y-5">
                        {/* Branding + Icon */}
                        <div className="flex flex-col items-center gap-3">
                           <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 ring-4 ring-orange-500/20">
                              <BellIcon className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                           </div>
                           <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                              xForgea3D
                           </p>
                        </div>

                        {/* Message */}
                        <div className="text-center">
                           <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {highlightCoupon(modals[0].content)}
                           </p>
                        </div>

                        {/* Close button */}
                        <button
                           onClick={() => dismissModal(modals[0].id)}
                           className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                           Tamam
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   )
}
