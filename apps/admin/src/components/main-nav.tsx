'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export function MainNav({
   className,
   ...props
}: React.HTMLAttributes<HTMLElement>) {
   const pathname = usePathname()

   const routes = [
      {
         href: `/banners`,
         label: 'Bannerlar',
         active: pathname.includes(`/banners`),
      },
      {
         href: `/categories`,
         label: 'Kategoriler',
         active: pathname.includes(`/categories`),
      },
      {
         href: `/products`,
         label: 'Ürünler',
         active: pathname.includes(`/products`),
      },
      {
         href: `/orders`,
         label: 'Siparişler',
         active: pathname.includes(`/orders`),
      },
      {
         href: `/quote-requests`,
         label: 'Parça Talepleri',
         active: pathname.includes(`/quote-requests`),
      },
      {
         href: `/payments`,
         label: 'Ödemeler',
         active: pathname.includes(`/payments`),
      },
      {
         href: `/users`,
         label: 'Kullanıcılar',
         active: pathname.includes(`/users`),
      },
      {
         href: `/brands`,
         label: 'Koleksiyonlar',
         active: pathname.includes(`/brands`) && !pathname.includes(`/car-brands`),
      },
      {
         href: `/car-brands`,
         label: 'Araç Markaları',
         active: pathname.includes(`/car-brands`),
      },
      {
         href: `/nav-items`,
         label: 'Navbar',
         active: pathname.includes(`/nav-items`),
      },
      {
         href: `/content/blog`,
         label: 'Blog',
         active: pathname.startsWith(`/content/blog`),
      },
   ]

   return (
      <nav
         className={cn('flex items-center space-x-4 lg:space-x-6', className)}
         {...props}
      >
         <Link href="/" className="flex items-center gap-2 mr-2 flex-shrink-0">
            <Image
               src="/logo.png"
               alt="xForgea3D"
               width={28}
               height={28}
               className="object-contain"
               priority
            />
            <span className="font-bold text-sm hidden lg:block">xForgea3D</span>
         </Link>
         {routes.map((route) => (
            <Link
               key={route.href}
               href={route.href}
               className={cn(
                  'text-sm transition-colors hover:text-primary',
                  route.active
                     ? 'font-semibold'
                     : 'font-light text-muted-foreground'
               )}
            >
               {route.label}
            </Link>
         ))}
      </nav>
   )
}
