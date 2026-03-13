'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import Config from '@/config/site'
import { cn } from '@/lib/utils'
import { ViewIcon, CarIcon, ChevronRight } from 'lucide-react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavItem {
   id: string
   label: string
   href: string
   section: string
   sortOrder: number
   isVisible: boolean
   badge: string | null
}

interface CarBrand {
   id: string
   name: string
   slug: string
   logoUrl: string | null
   models: { id: string; name: string; slug: string; yearRange: string | null }[]
}

// Fallback links when DB has no nav items
const fallbackLinks = [
   { label: 'Ürünler', href: '/products' },
   { label: 'Araç Parçaları', href: '/products?category=Araç Aksesuarları' },
   { label: 'Parça Talep Et', href: '/quote-request' },
   { label: 'Atölye', href: '/atolye' },
   { label: 'Blog', href: '/blog' },
]

export function MobileNav() {
   const [open, setOpen] = useState(false)
   const [navItems, setNavItems] = useState<NavItem[]>([])
   const [carBrands, setCarBrands] = useState<CarBrand[]>([])
   const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

   useEffect(() => {
      if (!open) return
      fetch('/api/nav-items')
         .then(r => r.json())
         .then(data => { if (Array.isArray(data)) setNavItems(data) })
         .catch(() => {})

      fetch('/api/car-brands')
         .then(r => r.json())
         .then(data => { if (Array.isArray(data)) setCarBrands(data) })
         .catch(() => {})
   }, [open])

   const mobileItems = navItems.filter(i => i.section === 'mobile')
   const mainItems = navItems.filter(i => i.section === 'main')
   const displayItems = mobileItems.length > 0 ? mobileItems : mainItems

   return (
      <Sheet open={open} onOpenChange={setOpen}>
         <SheetTrigger asChild>
            <Button
               variant="ghost"
               className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
               <ViewIcon className="h-5" />
               <span className="sr-only">Toggle Menu</span>
            </Button>
         </SheetTrigger>
         <SheetContent side="left" className="pr-0">
            <SheetTitle className="sr-only">Mobil Menü</SheetTitle>
            <MobileLink
               href="/"
               className="flex items-center"
               onOpenChange={setOpen}
            >
               <div className="relative z-20 flex items-center text-lg font-medium">
                  <img
                     src="/logo.png"
                     alt="xForgea3D"
                     width={24}
                     height={24}
                     className="mr-2 object-contain"
                  />
                  xForgea<span className="text-orange-500">3D</span>
               </div>
            </MobileLink>
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
               <div className="flex flex-col space-y-3">
                  {/* Nav links */}
                  {(displayItems.length > 0 ? displayItems : fallbackLinks.map((l, i) => ({
                     id: String(i), label: l.label, href: l.href, section: 'main',
                     sortOrder: i, isVisible: true, badge: null,
                  }))).map(item => {
                     // Araç parçaları dropdown for mobile
                     if (item.href === '#arac-parcalari') {
                        return (
                           <div key={item.id} className="space-y-2">
                              <span className="font-medium flex items-center gap-1.5">
                                 <CarIcon className="h-4 w-4" />
                                 {item.label}
                              </span>
                              <div className="ml-4 space-y-1">
                                 {carBrands.map(brand => (
                                    <div key={brand.id}>
                                       <button
                                          onClick={() => setExpandedBrand(
                                             expandedBrand === brand.id ? null : brand.id
                                          )}
                                          className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                                       >
                                          {brand.logoUrl ? (
                                             <div className="w-7 h-7 flex items-center justify-center bg-white rounded-md border border-border/40 shadow-sm">
                                                <img src={brand.logoUrl} alt={brand.name} width={18} height={18} className="object-contain" />
                                             </div>
                                          ) : (
                                             <div className="w-7 h-7 rounded-md bg-foreground/10 flex items-center justify-center text-[10px] font-bold">
                                                {brand.name.charAt(0)}
                                             </div>
                                          )}
                                          <span className="flex-1 text-left">{brand.name}</span>
                                          <ChevronRight className={cn(
                                             'h-3 w-3 transition-transform',
                                             expandedBrand === brand.id && 'rotate-90'
                                          )} />
                                       </button>
                                       {expandedBrand === brand.id && (
                                          <div className="ml-6 space-y-1 mb-2">
                                             {brand.models.map(model => (
                                                <MobileLink
                                                   key={model.id}
                                                   href={`/products?carModel=${model.slug}`}
                                                   onOpenChange={setOpen}
                                                   className="block text-xs text-muted-foreground hover:text-foreground py-1"
                                                >
                                                   {model.name}
                                                   {model.yearRange && (
                                                      <span className="ml-1 text-[10px] opacity-60">({model.yearRange})</span>
                                                   )}
                                                </MobileLink>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 ))}
                                 <MobileLink
                                    href="/quote-request"
                                    onOpenChange={setOpen}
                                    className="text-xs text-orange-500 font-semibold py-1"
                                 >
                                    Parça Talep Et / Fiyat Al
                                 </MobileLink>
                              </div>
                           </div>
                        )
                     }

                     // Skip other # links (they're dropdowns that don't make sense in mobile as-is)
                     if (item.href === '#kategoriler' || item.href === '#koleksiyonlar') {
                        return null
                     }

                     return (
                        <MobileLink
                           key={item.id}
                           href={item.href}
                           onOpenChange={setOpen}
                        >
                           {item.label}
                           {item.badge && (
                              <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-500">
                                 {item.badge}
                              </span>
                           )}
                        </MobileLink>
                     )
                  })}
               </div>

               {/* Car brands section when no DB nav items (fallback) */}
               {displayItems.length === 0 && carBrands.length > 0 && (
                  <div className="mt-6 space-y-2">
                     <h4 className="font-medium flex items-center gap-1.5">
                        <CarIcon className="h-4 w-4" /> Araç Markaları
                     </h4>
                     <div className="ml-4 space-y-1">
                        {carBrands.map(brand => (
                           <div key={brand.id}>
                              <button
                                 onClick={() => setExpandedBrand(
                                    expandedBrand === brand.id ? null : brand.id
                                 )}
                                 className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                              >
                                 <span className="flex-1 text-left">{brand.name}</span>
                                 <ChevronRight className={cn(
                                    'h-3 w-3 transition-transform',
                                    expandedBrand === brand.id && 'rotate-90'
                                 )} />
                              </button>
                              {expandedBrand === brand.id && (
                                 <div className="ml-4 space-y-1 mb-2">
                                    {brand.models.map(model => (
                                       <MobileLink
                                          key={model.id}
                                          href={`/products?carModel=${model.slug}`}
                                          onOpenChange={setOpen}
                                          className="block text-xs text-muted-foreground hover:text-foreground py-1"
                                       >
                                          {model.name}
                                       </MobileLink>
                                    ))}
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </ScrollArea>
         </SheetContent>
      </Sheet>
   )
}

interface MobileLinkProps extends LinkProps {
   onOpenChange?: (open: boolean) => void
   children: React.ReactNode
   className?: string
}

function MobileLink({
   href,
   onOpenChange,
   className,
   children,
   ...props
}: MobileLinkProps) {
   const router = useRouter()
   return (
      <Link
         href={href}
         prefetch={true}
         onClick={() => {
            router.push(href.toString())
            onOpenChange?.(false)
         }}
         className={cn(className)}
         {...props}
      >
         {children}
      </Link>
   )
}
