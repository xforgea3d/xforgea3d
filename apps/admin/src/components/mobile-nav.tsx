'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
   Menu,
   ShoppingBag,
   Layers,
   Image as ImageIcon,
   Tag,
   Car,
   Navigation,
   FileText,
   Settings,
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
      label: 'Magaza',
      items: [
         { href: '/products', label: 'Urunler', icon: ShoppingBag },
         { href: '/categories', label: 'Kategoriler', icon: Layers },
         { href: '/collections', label: 'Koleksiyonlar', icon: Tag },
         { href: '/banners', label: 'Bannerlar', icon: ImageIcon },
      ],
   },
   {
      label: 'Araclar',
      items: [
         { href: '/car-brands', label: 'Arac Markalari', icon: Car },
         { href: '/quote-requests', label: 'Parca Talepleri', icon: MessageSquare },
      ],
   },
   {
      label: 'Satislar',
      items: [
         { href: '/orders', label: 'Siparisler', icon: ShoppingCart },
         { href: '/returns', label: 'Iade Talepleri', icon: RotateCcw },
         { href: '/payments', label: 'Odemeler', icon: CreditCard },
         { href: '/discount-codes', label: 'Kuponlar', icon: Ticket },
         { href: '/campaigns', label: 'Kampanyalar', icon: CalendarDays },
         { href: '/users', label: 'Kullanicilar', icon: Users },
      ],
   },
   {
      label: 'Icerik',
      items: [
         { href: '/nav-items', label: 'Navbar', icon: Navigation },
         { href: '/content/blog', label: 'Blog', icon: FileText },
         { href: '/content/pages', label: 'Sayfalar', icon: FileText },
      ],
   },
   {
      label: 'Sistem',
      items: [
         { href: '/notifications', label: 'Bildirim Gonder', icon: Bell },
         { href: '/error-logs', label: 'Hata Loglari', icon: Bug },
         { href: '/settings/site', label: 'Ayarlar', icon: Settings },
      ],
   },
]

export function MobileNav() {
   const pathname = usePathname()
   const [open, setOpen] = useState(false)

   return (
      <Sheet open={open} onOpenChange={setOpen}>
         <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
               <Menu className="h-5 w-5" />
               <span className="sr-only">Menu</span>
            </Button>
         </SheetTrigger>
         <SheetContent>
            <div className="flex items-center gap-2 mb-6">
               <img
                  src="/logo.png"
                  alt="xForgea3D"
                  width={28}
                  height={28}
                  className="object-contain"
               />
               <span className="font-bold">xForgea3D</span>
            </div>
            <nav className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
               {navGroups.map((group) => (
                  <div key={group.label}>
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {group.label}
                     </p>
                     <div className="flex flex-col gap-0.5">
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
                                 onClick={() => setOpen(false)}
                                 className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                                    isActive
                                       ? 'bg-accent font-medium text-foreground'
                                       : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                 )}
                              >
                                 <Icon className="h-4 w-4" />
                                 {item.label}
                              </Link>
                           )
                        })}
                     </div>
                  </div>
               ))}
            </nav>
         </SheetContent>
      </Sheet>
   )
}
