'use client'

import { MobileNav } from '@/components/native/nav/mobile'
import { UserNav } from '@/components/native/nav/user'
import { MainNav } from '@/components/native/nav/desktop'
import { CartNav } from '@/components/native/nav/cart-nav'
import { Button } from '@/components/ui/button'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { LogInIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const CommandMenu = dynamic(
   () => import('@/components/composites/command').then(m => ({ default: m.CommandMenu })),
   { ssr: false, loading: () => (
      <Button variant="outline" className="relative w-full justify-start text-sm font-light text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
         <span className="inline-flex">Uygulamada ara...</span>
      </Button>
   )}
)

export default function Header() {
   const { authenticated } = useAuthenticated()

   return (
      <header className="supports-backdrop-blur:bg-background/90 sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur mb-4 px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
         <div className="flex h-14 items-center">
            <MainNav />
            <MobileNav />
            <div className="flex flex-1 items-center space-x-2 justify-end">
               <div className="flex-none">
                  <CommandMenu />
               </div>
               <CartNav />
               <ThemeToggle />
               {authenticated ? <UserNav /> : <LoginDialog />}
            </div>
         </div>
      </header>
   )
}



function LoginDialog() {
   return (
      <Button className="font-medium flex gap-2" asChild>
         <Link href="/login">
            <LogInIcon className="h-4" />
            <p>Giriş Yap</p>
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
