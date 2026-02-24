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
import Link from 'next/link'
import { forwardRef } from 'react'
import { PackageOpenIcon } from 'lucide-react'

const brands: { title: string; href: string; description: string }[] = [
   {
      title: 'Apple',
      href: '/products?brand=apple',
      description: 'Find the latest Apple products including iPhones, iPads, and MacBooks.',
   },
   {
      title: 'Samsung',
      href: '/products?brand=samsung',
      description: 'Explore Samsung Galaxy phones, tablets, and smart home devices.',
   },
   {
      title: 'Sony',
      href: '/products?brand=sony',
      description: 'Discover Sony electronics, from PlayStation consoles to premium headphones.',
   },
   {
      title: 'Nike',
      href: '/products?brand=nike',
      description: 'Shop the latest Nike athletic shoes, apparel, and accessories.',
   },
]

export function MainNav() {
   return (
      <div className="hidden md:flex gap-4">
         <Link href="/" className="flex items-center">
            <span className="hidden font-medium sm:inline-block">
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
                        Products
                     </div>
                  </NavigationMenuLink>
               </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <div className="font-normal text-foreground/70">
                     Categories
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
                                 All Categories
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                 Browse our entire catalog of products sorted by category.
                              </p>
                           </Link>
                        </NavigationMenuLink>
                     </li>
                     <ListItem href="/products?category=electronics" title="Electronics">
                        Computers, smartphones, and gadgets.
                     </ListItem>
                     <ListItem href="/products?category=clothing" title="Clothing">
                        Men's and women's fashion and apparel.
                     </ListItem>
                     <ListItem
                        href="/products?category=home"
                        title="Home & Garden"
                     >
                        Furniture, decor, and outdoor living.
                     </ListItem>
                  </ul>
               </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
               <NavigationMenuTrigger>
                  <div className="font-normal text-foreground/70">Brands</div>
               </NavigationMenuTrigger>
               <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                     {brands.map((brand) => (
                        <ListItem
                           key={brand.title}
                           title={brand.title}
                           href={brand.href}
                        >
                           {brand.description}
                        </ListItem>
                     ))}
                  </ul>
               </NavigationMenuContent>
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
