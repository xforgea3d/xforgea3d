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
import { forwardRef } from 'react'
import { PackageOpenIcon } from 'lucide-react'

const collections: { title: string; href: string; description: string }[] = [
   {
      title: 'Figürler',
      href: '/products?category=figurler',
      description: 'Özel tasarım 3D baskı figürler — oyun, anime, fantezi ve daha fazlası.',
   },
   {
      title: 'Heykeller',
      href: '/products?category=heykeller',
      description: 'Dekoratif ve sanatsal 3D baskı heykeller, her mekâna değer katar.',
   },
   {
      title: 'Dekoratif',
      href: '/products?category=dekoratif',
      description: 'Ev ve ofis için şık 3D baskı dekoratif objeler.',
   },
   {
      title: 'Aksesuarlar',
      href: '/products?category=aksesuarlar',
      description: 'Kişiselleştirilmiş 3D baskı aksesuarlar ve tamamlayıcı parçalar.',
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
   return (
      <NavigationMenu>
         <NavigationMenuList>
            <NavigationMenuItem>
               <Link href="/products" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                     <div className="font-normal text-foreground/70">
                        Ürünler
                     </div>
                  </NavigationMenuLink>
               </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <div className="font-normal text-foreground/70">
                     Kategoriler
                  </div>
               </NavigationMenuTrigger>
               <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                     <li className="row-span-3">
                        <NavigationMenuLink asChild>
                           <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                              href="/products"
                           >
                              <PackageOpenIcon className="h-6 w-6 mb-2" />
                              <div className="mb-2 mt-4 text-lg font-medium">
                                 Tüm Kategoriler
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                 Kategoriye göre sıralanmış tüm 3D baskı ürünlerimize göz atın.
                              </p>
                           </Link>
                        </NavigationMenuLink>
                     </li>
                     <ListItem href="/products?category=figurler" title="Figürler">
                        Oyun, anime ve fantezi figürleri.
                     </ListItem>
                     <ListItem href="/products?category=heykeller" title="Heykeller">
                        Sanatsal ve dekoratif heykeller.
                     </ListItem>
                     <ListItem
                        href="/products?category=dekoratif"
                        title="Dekoratif & Aksesuarlar"
                     >
                        Ev, ofis ve kişisel aksesuarlar.
                     </ListItem>
                  </ul>
               </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <div className="font-normal text-foreground/70">Koleksiyonlar</div>
               </NavigationMenuTrigger>
               <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                     {collections.map((col) => (
                        <ListItem
                           key={col.title}
                           title={col.title}
                           href={col.href}
                        >
                           {col.description}
                        </ListItem>
                     ))}
                  </ul>
               </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <Link href="/atolye" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                     <div className="font-normal text-orange-500 font-medium">✦ Atölye</div>
                  </NavigationMenuLink>
               </Link>
            </NavigationMenuItem>
         </NavigationMenuList>
      </NavigationMenu>
   )
}

const ListItem = forwardRef<
   React.ElementRef<'a'>,
   React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, href, ...props }, ref) => {
   return (
      <li>
         <NavigationMenuLink asChild>
            <Link
               href={href}
               ref={ref}
               className={cn(
                  'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                  className
               )}
               {...props}
            >
               <div className="text-sm font-medium leading-none">{title}</div>
               <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  {children}
               </p>
            </Link>
         </NavigationMenuLink>
      </li>
   )
})

ListItem.displayName = 'ListItem'
