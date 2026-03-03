'use client'

import {
   NavigationMenu,
   NavigationMenuContent,
   NavigationMenuItem,
   NavigationMenuLink,
   NavigationMenuList,
   NavigationMenuTrigger,
   navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import config from '@/config/site'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { forwardRef, useState, useEffect } from 'react'
import { PackageOpenIcon, SparklesIcon, CarIcon, MessageSquareQuoteIcon } from 'lucide-react'

// ── Category definitions matching EXACT DB titles ────────────────────────────
const categories = [
   {
      title: 'Figürler',
      href: '/products?category=Figürler',
      description: 'Oyun, anime ve fantezi karakterlerinin detaylı 3D baskı figürleri.',
      emoji: '🎮',
      image: '/bg-figurler.png',
   },
   {
      title: 'Heykeller',
      href: '/products?category=Heykeller',
      description: 'Antik ve modern sanat eserlerinin 3D baskı replikalları.',
      emoji: '🏛️',
      image: '/bg-heykeller.png',
   },
   {
      title: 'Dekoratif',
      href: '/products?category=Dekoratif',
      description: 'Ev ve ofis için şık 3D baskı dekoratif parçalar.',
      emoji: '🎨',
      image: '/bg-dekoratif.png',
   },
   {
      title: 'Aksesuarlar',
      href: '/products?category=Aksesuarlar',
      description: 'Telefon tutucular, organizerlar ve kişisel aksesuarlar.',
      emoji: '⚙️',
      image: '/bg-aksesuarlar.png',
   },
]

const collections = [
   {
      title: 'Oyun Koleksiyonu',
      href: '/products?category=Figürler',
      description: 'Elden Ring, Zelda, anime ve popüler oyun karakterleri.',
      badge: 'Yeni',
   },
   {
      title: 'Sanat & Heykel',
      href: '/products?category=Heykeller',
      description: 'Rodin, Yunan mitolojisi ve modern sanat eserleri.',
      badge: null,
   },
   {
      title: 'Ev Dekoru',
      href: '/products?category=Dekoratif',
      description: 'Geometrik duvar sanatı, süsler ve dekoratif parçalar.',
      badge: null,
   },
   {
      title: 'Kişisel Aksesuarlar',
      href: '/products?category=Aksesuarlar',
      description: 'Masaüstü organizerlar, telefon tutucular ve daha fazlası.',
      badge: null,
   },
]

// ── Types ────────────────────────────────────────────────────────────────────
interface CarModel {
   id: string
   name: string
   slug: string
   imageUrl: string | null
   yearRange: string | null
}

interface CarBrand {
   id: string
   name: string
   slug: string
   logoUrl: string | null
   models: CarModel[]
}

export function MainNav() {
   return (
      <div className="hidden md:flex gap-4 items-center">
         <Link href="/" className="flex items-center gap-2">
            <Image
               src="/logo.png"
               alt="xForgea3D"
               width={36}
               height={36}
               className="object-contain"
               priority
            />
            <span className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity hidden lg:block">
               {config.name}
            </span>
         </Link>
         <NavMenu />
      </div>
   )
}

export function NavMenu() {
   const [activeCatImg, setActiveCatImg] = useState('/nav-bg.png')
   const [activeCatTitle, setActiveCatTitle] = useState('Tüm Kategoriler')
   const [activeCatDesc, setActiveCatDesc] = useState('Tüm 3D baskı ürünlerimize kategoriye göre göz atın.')

   // ── Car brands (eager fetch on mount — small payload) ──
   const [carBrands, setCarBrands] = useState<CarBrand[]>([])
   const [activeBrand, setActiveBrand] = useState<CarBrand | null>(null)
   const [brandsLoaded, setBrandsLoaded] = useState(false)

   useEffect(() => {
      fetch('/api/car-brands')
         .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
         .then((data) => {
            if (!Array.isArray(data)) return
            setCarBrands(data)
            if (data.length > 0) setActiveBrand(data[0])
         })
         .catch(() => {})
         .finally(() => setBrandsLoaded(true))
   }, [])

   return (
      <NavigationMenu>
         <NavigationMenuList>
            {/* Ürünler */}
            <NavigationMenuItem>
               <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/products" prefetch={true}>
                     <span className="font-normal text-foreground/70">Ürünler</span>
                  </Link>
               </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Kategoriler — dropdown with image background */}
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <span className="font-normal text-foreground/70">Kategoriler</span>
               </NavigationMenuTrigger>
               <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[420px] lg:w-[520px] lg:grid-cols-[.72fr_1fr]">
                     {/* Left: visual hero card */}
                     <li className="row-span-4">
                        <NavigationMenuLink asChild>
                           <Link
                              className="group relative flex h-full w-full select-none flex-col justify-end rounded-xl overflow-hidden no-underline outline-none focus:shadow-md"
                              href="/products"
                              prefetch={true}
                           >
                              {/* AI-generated background */}
                              <div className="absolute inset-0">
                                 <Image
                                    key={activeCatImg}
                                    src={activeCatImg}
                                    alt={activeCatTitle}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="200px"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                              </div>
                              <div className="relative z-10 p-5 transition-all duration-300">
                                 <PackageOpenIcon className="h-5 w-5 mb-2 text-orange-400" />
                                 <div className="text-base font-bold text-white mb-1">{activeCatTitle}</div>
                                 <p className="text-xs leading-snug text-white/70">
                                    {activeCatDesc}
                                 </p>
                              </div>
                           </Link>
                        </NavigationMenuLink>
                     </li>
                     {/* Right: category list */}
                     {categories.map(c => (
                        <CategoryListItem
                           key={c.title}
                           href={c.href}
                           title={`${c.emoji} ${c.title}`}
                           onMouseEnter={() => {
                              setActiveCatImg(c.image)
                              setActiveCatTitle(c.title)
                              setActiveCatDesc(c.description)
                           }}
                        >
                           {c.description}
                        </CategoryListItem>
                     ))}
                  </ul>
               </NavigationMenuContent>
            </NavigationMenuItem>

            {/* ── Araç Parçaları — Mega Menu ─────────────────────────── */}
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <span className="font-normal text-foreground/70 flex items-center gap-1">
                     <CarIcon className="h-3.5 w-3.5" />
                     Araç Parçaları
                  </span>
               </NavigationMenuTrigger>
               <NavigationMenuContent>
                  <div className="p-4 w-[560px] lg:w-[680px]">
                     {!brandsLoaded ? (
                        <div className="flex items-center justify-center h-32 gap-2 text-sm text-muted-foreground">
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                           Araç markaları yükleniyor...
                        </div>
                     ) : carBrands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 gap-3 text-sm text-muted-foreground">
                           <CarIcon className="h-8 w-8 text-muted-foreground/40" />
                           <p>Henüz araç markası eklenmemiş</p>
                           <NavigationMenuLink asChild>
                              <Link
                                 href="/quote-request"
                                 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
                              >
                                 <MessageSquareQuoteIcon className="h-3.5 w-3.5" />
                                 Parça Talep Et / Fiyat Al
                              </Link>
                           </NavigationMenuLink>
                        </div>
                     ) : (
                        <div className="grid grid-cols-[200px_1fr] gap-4">
                           {/* Left panel: Brand logos grid */}
                           <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Markalar</p>
                              <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto pr-1">
                                 {carBrands.map(brand => (
                                    <button
                                       key={brand.id}
                                       onMouseEnter={() => setActiveBrand(brand)}
                                       className={cn(
                                          'flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-all cursor-pointer',
                                          activeBrand?.id === brand.id
                                             ? 'bg-orange-500/10 border border-orange-500/30 text-foreground'
                                             : 'hover:bg-accent border border-transparent text-muted-foreground hover:text-foreground'
                                       )}
                                    >
                                       {brand.logoUrl ? (
                                          <Image
                                             src={brand.logoUrl}
                                             alt={brand.name}
                                             width={28}
                                             height={28}
                                             className="object-contain"
                                          />
                                       ) : (
                                          <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold">
                                             {brand.name.charAt(0)}
                                          </div>
                                       )}
                                       <span className="text-[10px] font-medium leading-tight">{brand.name}</span>
                                    </button>
                                 ))}
                              </div>
                              {/* CTA under brands */}
                              <NavigationMenuLink asChild>
                                 <Link
                                    href="/quote-request"
                                    className="flex items-center gap-1.5 mt-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-500 text-[10px] font-bold hover:bg-orange-500/20 transition-colors"
                                 >
                                    <MessageSquareQuoteIcon className="h-3 w-3" />
                                    Parça Talep Et / Fiyat Al
                                 </Link>
                              </NavigationMenuLink>
                           </div>

                           {/* Right panel: Selected brand's models */}
                           <div className="border-l border-border pl-4">
                              {activeBrand && (
                                 <>
                                    <div className="flex items-center gap-2 mb-3">
                                       <p className="text-sm font-bold">{activeBrand.name}</p>
                                       <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-500 uppercase tracking-wider">
                                          {activeBrand.models.length} Model
                                       </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                                       {activeBrand.models.map(model => (
                                          <NavigationMenuLink asChild key={model.id}>
                                             <Link
                                                href={`/products?carModel=${model.slug}`}
                                                prefetch={true}
                                                className="group flex flex-col rounded-lg border border-transparent p-2.5 transition-all hover:border-border hover:bg-accent"
                                             >
                                                {model.imageUrl ? (
                                                   <div className="relative w-full h-20 rounded-md overflow-hidden mb-2 bg-muted">
                                                      <Image
                                                         src={model.imageUrl}
                                                         alt={model.name}
                                                         fill
                                                         className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                         sizes="150px"
                                                      />
                                                   </div>
                                                ) : (
                                                   <div className="w-full h-20 rounded-md bg-foreground/5 flex items-center justify-center mb-2">
                                                      <CarIcon className="h-6 w-6 text-muted-foreground/40" />
                                                   </div>
                                                )}
                                                <span className="text-xs font-semibold">{model.name}</span>
                                                {model.yearRange && (
                                                   <span className="text-[10px] text-muted-foreground">{model.yearRange}</span>
                                                )}
                                             </Link>
                                          </NavigationMenuLink>
                                       ))}
                                    </div>
                                 </>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Koleksiyonlar — dropdown with image background */}
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <span className="font-normal text-foreground/70">Koleksiyonlar</span>
               </NavigationMenuTrigger>
               <NavigationMenuContent>
                  <div className="p-4 w-[480px] md:w-[560px]">
                     {/* Hero banner */}
                     <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3">
                        <Image
                           src="/nav-bg.png"
                           alt="Koleksiyonlar"
                           fill
                           className="object-cover object-top"
                           sizes="560px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                        <div className="absolute inset-0 flex items-center px-5">
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">xForgea3D</p>
                              <p className="text-white font-bold text-lg leading-tight mt-0.5">Özel Koleksiyonlar</p>
                              <p className="text-white/65 text-xs mt-0.5">Kategorize edilmiş seçkin ürün grupları</p>
                           </div>
                        </div>
                     </div>
                     {/* Collection grid */}
                     <ul className="grid grid-cols-2 gap-2">
                        {collections.map(c => (
                           <CollectionItem key={c.title} href={c.href} title={c.title} badge={c.badge}>
                              {c.description}
                           </CollectionItem>
                        ))}
                     </ul>
                  </div>
               </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Atölye */}
            <NavigationMenuItem>
               <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/atolye" prefetch={true}>
                     <span className="font-semibold text-orange-500 flex items-center gap-1">
                        <SparklesIcon className="h-3 w-3" />
                        Atölye
                     </span>
                  </Link>
               </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Blog */}
            <NavigationMenuItem>
               <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/blog" prefetch={true}>
                     <span className="font-normal text-foreground/70">Blog</span>
                  </Link>
               </NavigationMenuLink>
            </NavigationMenuItem>
         </NavigationMenuList>
      </NavigationMenu>
   )
}

// ── Item Components ──────────────────────────────────────────────────────────

const CategoryListItem = forwardRef<
   React.ElementRef<'a'>,
   React.ComponentPropsWithoutRef<'a'> & { href: string; title: string }
>(({ className, title, children, href, ...props }, ref) => (
   <li>
      <NavigationMenuLink asChild>
         <Link
            href={href}
            ref={ref}
            prefetch={true}
            className={cn(
               'block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent',
               className
            )}
            {...props}
         >
            <div className="text-sm font-semibold leading-none mb-1">{title}</div>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{children}</p>
         </Link>
      </NavigationMenuLink>
   </li>
))
CategoryListItem.displayName = 'CategoryListItem'

function CollectionItem({
   href, title, children, badge,
}: { href: string; title: string; children: React.ReactNode; badge: string | null }) {
   return (
      <li>
         <NavigationMenuLink asChild>
            <Link
               href={href}
               prefetch={true}
               className="group block select-none rounded-lg border border-transparent p-3 leading-none no-underline outline-none transition-all hover:border-border hover:bg-accent"
            >
               <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-semibold">{title}</span>
                  {badge && (
                     <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-500 uppercase tracking-wider">
                        {badge}
                     </span>
                  )}
               </div>
               <p className="text-xs leading-snug text-muted-foreground line-clamp-2">{children}</p>
            </Link>
         </NavigationMenuLink>
      </li>
   )
}
