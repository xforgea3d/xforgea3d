'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
   LayoutDashboard,
   ShoppingBag,
   Layers,
   Image as ImageIcon,
   Tag,
   Car,
   Navigation,
   FileText,
   Settings,
   ChevronDown,
   ShoppingCart,
   MessageSquare,
   CreditCard,
   Users,
   Bug,
   Ticket,
   RotateCcw,
   Bell,
   CalendarDays,
} from 'lucide-react'

const navGroups = [
   {
      label: 'Mağaza',
      items: [
         { href: '/products', label: 'Ürünler', icon: ShoppingBag },
         { href: '/categories', label: 'Kategoriler', icon: Layers },
         { href: '/brands', label: 'Koleksiyonlar', icon: Tag },
         { href: '/banners', label: 'Bannerlar', icon: ImageIcon },
      ],
   },
   {
      label: 'Araçlar',
      items: [
         { href: '/car-brands', label: 'Araç Markaları', icon: Car },
         { href: '/quote-requests', label: 'Parça Talepleri', icon: MessageSquare },
      ],
   },
   {
      label: 'Satışlar',
      items: [
         { href: '/orders', label: 'Siparişler', icon: ShoppingCart },
         { href: '/returns', label: 'İade Talepleri', icon: RotateCcw },
         { href: '/payments', label: 'Ödemeler', icon: CreditCard },
         { href: '/discount-codes', label: 'Kuponlar', icon: Ticket },
         { href: '/campaigns', label: 'Kampanyalar', icon: CalendarDays },
         { href: '/users', label: 'Kullanıcılar', icon: Users },
      ],
   },
   {
      label: 'İçerik',
      items: [
         { href: '/nav-items', label: 'Navbar', icon: Navigation },
         { href: '/content/blog', label: 'Blog', icon: FileText },
         { href: '/content/pages', label: 'Sayfalar', icon: FileText },
      ],
   },
   {
      label: 'Sistem',
      items: [
         { href: '/notifications', label: 'Bildirim Gönder', icon: Bell },
         { href: '/error-logs', label: 'Hata Loglari', icon: Bug },
         { href: '/settings/site', label: 'Ayarlar', icon: Settings },
      ],
   },
]

export function MainNav({
   className,
   ...props
}: React.HTMLAttributes<HTMLElement>) {
   const pathname = usePathname()

   return (
      <nav
         className={cn('flex items-center gap-1', className)}
         {...props}
      >
         <Link href="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
               src="/logo.png"
               alt="xForgea3D"
               width={28}
               height={28}
               className="object-contain"
            />
            <span className="font-bold text-sm hidden xl:block">xForgea3D</span>
         </Link>

         {navGroups.map((group) => (
            <div key={group.label} className="relative group">
               <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">
                  {group.label}
                  <ChevronDown className="h-3 w-3 opacity-50" />
               </button>
               <div className="absolute left-0 top-full pt-1 z-50 hidden group-hover:block">
                  <div className="bg-popover border rounded-lg shadow-lg py-1 min-w-[180px]">
                     {group.items.map((item) => {
                        const isActive =
                           item.href === '/'
                              ? pathname === '/'
                              : pathname.startsWith(item.href)
                        const Icon = item.icon
                        return (
                           <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                 'flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent',
                                 isActive
                                    ? 'font-medium text-foreground bg-accent/50'
                                    : 'text-muted-foreground'
                              )}
                           >
                              <Icon className="h-4 w-4" />
                              {item.label}
                           </Link>
                        )
                     })}
                  </div>
               </div>
            </div>
         ))}
      </nav>
   )
}
