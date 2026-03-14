'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BellIcon, CheckCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Notification {
   id: string
   content: string
   isRead: boolean
   createdAt: string
}

function relativeTime(dateStr: string): string {
   const now = Date.now()
   const date = new Date(dateStr).getTime()
   const diff = now - date
   const seconds = Math.floor(diff / 1000)
   const minutes = Math.floor(seconds / 60)
   const hours = Math.floor(minutes / 60)
   const days = Math.floor(hours / 24)

   if (seconds < 60) return 'az once'
   if (minutes < 60) return `${minutes} dk once`
   if (hours < 24) return `${hours} saat once`
   if (days === 1) return 'dun'
   if (days < 7) return `${days} gun once`
   if (days < 30) return `${Math.floor(days / 7)} hafta once`
   return `${Math.floor(days / 30)} ay once`
}

export function NotificationBell() {
   const [notifications, setNotifications] = useState<Notification[]>([])
   const [unreadCount, setUnreadCount] = useState(0)
   const [open, setOpen] = useState(false)
   const dropdownRef = useRef<HTMLDivElement>(null)

   const fetchNotifications = useCallback(async () => {
      try {
         const res = await fetch('/api/notifications', { cache: 'no-store' })
         if (!res.ok) return
         const data = await res.json()
         setNotifications(data.notifications?.slice(0, 10) ?? [])
         setUnreadCount(data.unreadCount ?? 0)
      } catch {
         // silently fail
      }
   }, [])

   useEffect(() => {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
   }, [fetchNotifications])

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setOpen(false)
         }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   async function markAsRead(ids: string[]) {
      try {
         await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
         })
         setNotifications(prev =>
            prev.map(n => (ids.includes(n.id) ? { ...n, isRead: true } : n))
         )
         setUnreadCount(prev => Math.max(0, prev - ids.filter(id => notifications.find(n => n.id === id && !n.isRead)).length))
      } catch {
         // silently fail
      }
   }

   async function markAllAsRead() {
      try {
         await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ all: true }),
         })
         setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
         setUnreadCount(0)
      } catch {
         // silently fail
      }
   }

   return (
      <div className="relative" ref={dropdownRef}>
         <Button
            variant="outline"
            size="icon"
            className="relative h-9"
            aria-label="Bildirimler"
            onClick={() => setOpen(prev => !prev)}
         >
            <BellIcon className="h-4 w-4" />
            {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
               </span>
            )}
         </Button>

         {open && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-md border bg-popover shadow-lg z-50">
               <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-sm font-semibold">Bildirimler</span>
                  {unreadCount > 0 && (
                     <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                     >
                        <CheckCheckIcon className="h-3 w-3" />
                        Tumunu Okundu Isaretle
                     </button>
                  )}
               </div>

               <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                     <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Bildiriminiz yok
                     </div>
                  ) : (
                     notifications.map(notification => (
                        <button
                           key={notification.id}
                           className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors ${
                              !notification.isRead ? 'bg-accent/20' : ''
                           }`}
                           onClick={() => {
                              if (!notification.isRead) {
                                 markAsRead([notification.id])
                              }
                           }}
                        >
                           <div className="flex items-start gap-2">
                              {!notification.isRead && (
                                 <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm leading-snug">{notification.content}</p>
                                 <p className="text-xs text-muted-foreground mt-1">
                                    {relativeTime(notification.createdAt)}
                                 </p>
                              </div>
                           </div>
                        </button>
                     ))
                  )}
               </div>

               <div className="border-t px-4 py-2">
                  <Link
                     href="/profile/notifications"
                     className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                     onClick={() => setOpen(false)}
                  >
                     Tum Bildirimleri Gor
                  </Link>
               </div>
            </div>
         )}
      </div>
   )
}
