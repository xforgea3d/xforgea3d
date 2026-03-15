'use client'

import { MobileNav } from '@/components/native/nav/mobile'
import { UserNav } from '@/components/native/nav/user'
import { MainNav } from '@/components/native/nav/desktop'
import { CartNav } from '@/components/native/nav/cart-nav'
import { Button } from '@/components/ui/button'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { LogInIcon, MoonIcon, SunIcon, SearchIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const CommandMenu = dynamic(
   () => import('@/components/composites/command').then(m => ({ default: m.CommandMenu })),
   { ssr: false }
)

const NotificationBell = dynamic(
   () => import('@/components/native/nav/notification-bell').then(m => ({ default: m.NotificationBell })),
   { ssr: false }
)

export default function Header() {
   const { authenticated } = useAuthenticated()
   const [searchOpen, setSearchOpen] = useState(false)

   return (
      <header className="supports-backdrop-blur:bg-background/90 sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur mb-4 px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
         <div className="flex h-14 items-center">
            <MainNav />
            <MobileNav />
            <div className="flex flex-1 items-center gap-1 md:gap-2 justify-end">
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-foreground"
               >
                  <SearchIcon className="h-4 w-4" />
                  <span className="sr-only">Ara</span>
               </Button>
               <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
               <CartNav />
               {authenticated === true && <NotificationBell />}
               <div className="hidden md:flex">
                  <ThemeToggle />
               </div>
               <div className="flex-shrink-0">
                  {authenticated === null ? (
                     <div className="h-9 w-9" />
                  ) : authenticated ? (
                     <UserNav />
                  ) : (
                     <LoginButton />
                  )}
               </div>
            </div>
         </div>
      </header>
   )
}

function LoginButton() {
   return (
      <Button className="font-medium flex gap-2 whitespace-nowrap" asChild>
         <Link href="/login">
            <LogInIcon className="h-4" />
            <span>Giriş Yap</span>
         </Link>
      </Button>
   )
}

function ThemeToggle() {
   const { resolvedTheme, setTheme } = useTheme()
   const [mounted, setMounted] = useState(false)
   useEffect(() => setMounted(true), [])

   return (
      <Button
         variant="outline"
         size="icon"
         aria-label="Tema degistir"
         onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
         suppressHydrationWarning
      >
         {mounted ? (
            resolvedTheme === 'dark'
               ? <SunIcon className="h-4 w-4" />
               : <MoonIcon className="h-4 w-4" />
         ) : (
            <span className="h-4 w-4" />
         )}
      </Button>
   )
}
