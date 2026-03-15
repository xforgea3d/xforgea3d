'use client'

import { useAuthenticated } from '@/hooks/useAuthentication'
import { SidebarNav } from '@/components/native/nav/sidebar'
import { Loader } from '@/components/ui/loader'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const sidebarNavItems = [
   { title: 'Profilim', href: '/profile/edit' },
   { title: 'Siparislerim', href: '/profile/orders' },
   { title: 'Adreslerim', href: '/profile/addresses' },
   { title: 'Taleplerim', href: '/profile/quote-requests' },
   { title: 'İade Taleplerim', href: '/profile/returns' },
   { title: 'Bildirimler', href: '/profile/notifications' },
]

export default function ProfileLayout({
   children,
}: {
   children: React.ReactNode
}) {
   const { authenticated } = useAuthenticated()
   const router = useRouter()

   useEffect(() => {
      // Only redirect when auth check has COMPLETED and result is false
      // null = still checking, don't redirect yet
      if (authenticated === false) {
         router.push('/login?redirect=/profile/edit')
      }
   }, [authenticated, router])

   // null (loading) or false (not authenticated) — show loader
   if (authenticated !== true) {
      return (
         <div className="flex items-center justify-center min-h-[50vh]">
            <Loader />
         </div>
      )
   }

   return (
      <div className="space-y-6 pb-16">
         <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Hesabim</h2>
            <p className="text-muted-foreground">
               Profilinizi, siparislerinizi ve adreslerinizi yonetin.
            </p>
         </div>
         <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
               <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1">{children}</div>
         </div>
      </div>
   )
}
