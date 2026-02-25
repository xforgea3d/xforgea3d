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
import { forwardRef, useState } from 'react'
import { PackageOpenIcon, SparklesIcon } from 'lucide-react'

// ── Category definitions matching EXACT DB titles ────────────────────────────
// Nav filter passes the exact category title — products page uses .contains insensitive
// so 'Figürler' will match DB title 'Figürler' correctly.
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

   return (
      <NavigationMenu>
         <NavigationMenuList>
            {/* Ürünler */}
            <NavigationMenuItem>
               <Link href="/products" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                     <span className="font-normal text-foreground/70">Ürünler</span>
                  </NavigationMenuLink>
               </Link>
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
                           >
                              {/* AI-generated background */}
                              <div className="absolute inset-0">
                                 <Image
                                    key={activeCatImg} // Force re-render on change to trigger fade if needed
                                    src={activeCatImg}
                                    alt={activeCatTitle}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="200px"
                                 />
                                 {/* Dark gradient overlay for text readability */}
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                              </div>
                              {/* Text */}
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
                     {/* Reset when hovering the wrapper (optional, but good UX to leave the last hovered) */}
                  </ul>
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
               <Link href="/atolye" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                     <span className="font-semibold text-orange-500 flex items-center gap-1">
                        <SparklesIcon className="h-3 w-3" />
                        Atölye
                     </span>
                  </NavigationMenuLink>
               </Link>
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
