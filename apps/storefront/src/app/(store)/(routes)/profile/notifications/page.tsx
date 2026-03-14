'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCheckIcon, BellIcon, InboxIcon } from 'lucide-react'

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

export default function NotificationsPage() {
   const [notifications, setNotifications] = useState<Notification[]>([])
   const [unreadCount, setUnreadCount] = useState(0)
   const [loading, setLoading] = useState(true)

   const fetchNotifications = useCallback(async () => {
      try {
         const res = await fetch('/api/notifications', { cache: 'no-store' })
         if (!res.ok) return
         const data = await res.json()
         setNotifications(data.notifications ?? [])
         setUnreadCount(data.unreadCount ?? 0)
      } catch {
         // silently fail
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      fetchNotifications()
   }, [fetchNotifications])

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

   async function markAsRead(id: string) {
      try {
         await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [id] }),
         })
         setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
         )
         setUnreadCount(prev => Math.max(0, prev - 1))
      } catch {
         // silently fail
      }
   }

   if (loading) {
      return (
         <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
         </div>
      )
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg font-medium">Bildirimler</h3>
               <p className="text-sm text-muted-foreground">
                  {unreadCount > 0
                     ? `${unreadCount} okunmamis bildirim`
                     : 'Tum bildirimler okundu'}
               </p>
            </div>
            {unreadCount > 0 && (
               <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCheckIcon className="mr-2 h-4 w-4" />
                  Tumunu Okundu Isaretle
               </Button>
            )}
         </div>

         {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
               <InboxIcon className="h-12 w-12 mb-4" />
               <p className="text-lg font-medium">Bildiriminiz yok</p>
               <p className="text-sm">Yeni bildirimler burada gorunecek.</p>
            </div>
         ) : (
            <div className="space-y-2">
               {notifications.map(notification => (
                  <div
                     key={notification.id}
                     className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                        !notification.isRead
                           ? 'bg-accent/20 border-accent'
                           : 'bg-background'
                     }`}
                  >
                     <div className="mt-0.5 shrink-0">
                        {!notification.isRead ? (
                           <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                        ) : (
                           <BellIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm">{notification.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                           {relativeTime(notification.createdAt)}
                        </p>
                     </div>
                     {!notification.isRead && (
                        <Button
                           variant="ghost"
                           size="sm"
                           className="shrink-0 text-xs"
                           onClick={() => markAsRead(notification.id)}
                        >
                           Okundu
                        </Button>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>
   )
}
