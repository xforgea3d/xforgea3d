import { MainNav } from '@/components/main-nav'
import { MobileNav } from '@/components/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBadges } from '@/components/notification-badges'

import { LogoutButton } from './logout-button'

export default async function Navbar() {
   return (
      <div className="border-b flex justify-between h-16 items-center px-4 md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
         <div className="flex items-center gap-4">
            <MobileNav />
            <div className="hidden md:flex gap-6 items-center">
               <MainNav />
            </div>
         </div>
         <div className="flex items-center gap-2">
            <NotificationBadges />
            <ThemeToggle />
            <LogoutButton />
         </div>
      </div>
   )
}
