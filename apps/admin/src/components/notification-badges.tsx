'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, MessageSquare, AlertTriangle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Counts {
   orders: number
   quotes: number
   returns: number
   errors: number
}

export function NotificationBadges() {
   const [counts, setCounts] = useState<Counts>({ orders: 0, quotes: 0, returns: 0, errors: 0 })

   useEffect(() => {
      const fetchCounts = () => {
         fetch('/api/notifications/counts?t=' + Date.now(), { cache: 'no-store' })
            .then(r => {
               if (!r.ok) throw new Error('Failed to fetch')
               return r.json()
            })
            .then(setCounts)
            .catch(() => {})
      }
      fetchCounts()
      const interval = setInterval(fetchCounts, 30000)
      return () => clearInterval(interval)
   }, [])

   const badges = [
      { href: '/orders', icon: ShoppingCart, count: counts.orders, label: 'Yeni Sipariş', color: 'bg-blue-500' },
      { href: '/returns', icon: RotateCcw, count: counts.returns, label: 'İade Talebi', color: 'bg-purple-500' },
      { href: '/quote-requests', icon: MessageSquare, count: counts.quotes, label: 'Parça Talebi', color: 'bg-orange-500' },
      { href: '/error-logs', icon: AlertTriangle, count: counts.errors, label: 'Kritik Hata', color: 'bg-red-500' },
   ]

   const activeBadges = badges.filter(b => b.count > 0)
   if (activeBadges.length === 0) return null

   return (
      <div className="flex items-center gap-1">
         {activeBadges.map(({ href, icon: Icon, count, label, color }) => (
            <Link
               key={href}
               href={href}
               title={`${count} ${label}`}
               className="relative p-2 rounded-md hover:bg-accent transition-colors"
            >
               <Icon className="h-4 w-4 text-muted-foreground" />
               <span className={cn(
                  'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center',
                  'rounded-full text-[10px] font-bold text-white px-1',
                  color
               )}>
                  {count > 99 ? '99+' : count}
               </span>
            </Link>
         ))}
      </div>
   )
}
