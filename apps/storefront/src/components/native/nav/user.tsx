'use client'

import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
   BellIcon,
   CreditCardIcon,
   HeartIcon,
   ListOrderedIcon,
   LogOutIcon,
   MapPinIcon,
   MessageSquareQuoteIcon,
   RotateCcwIcon,
   UserIcon,
} from 'lucide-react'
import { ShoppingBasketIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUserContext } from '@/state/User'

export function UserNav() {
   const { user } = useUserContext() as { user: any }
   async function onLogout() {
      try {
         // Sign out client-side first so onAuthStateChange fires immediately
         const supabase = createClient()
         await supabase.auth.signOut()

         // Clear the cookie
         document.cookie = 'logged-in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

         // Also call server-side logout to clear server cookies
         // If this fails, still proceed with client-side redirect
         try {
            await fetch('/api/auth/logout', { cache: 'no-store' })
         } catch {
            // Server logout failed, but client-side logout already done above
         }

         // Redirect to home
         window.location.assign('/')
      } catch (error) {
         console.error({ error })
         // Fallback: force reload
         window.location.reload()
      }
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="h-9" aria-label="Kullanici menusu">
               <UserIcon className="h-4" />
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent className="w-56" align="end" forceMount>
            {user && (
               <>
                  <DropdownMenuLabel className="font-normal">
                     <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'Kullanıcı'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
               </>
            )}
            <DropdownMenuGroup>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/edit">
                     <UserIcon className="h-4" />
                     Profilim
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/orders">
                     <ListOrderedIcon className="h-4" />
                     Siparişlerim
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/addresses">
                     <MapPinIcon className="h-4" />
                     Adreslerim
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/quote-requests">
                     <MessageSquareQuoteIcon className="h-4" />
                     Taleplerim
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/returns">
                     <RotateCcwIcon className="h-4" />
                     İade Taleplerim
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/profile/notifications">
                     <BellIcon className="h-4" />
                     Bildirimler
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/cart">
                     <ShoppingBasketIcon className="h-4" /> Sepet
                  </Link>
               </DropdownMenuItem>
               <DropdownMenuItem className="flex gap-2" asChild>
                  <Link href="/wishlist">
                     <HeartIcon className="h-4" /> Favoriler
                  </Link>
               </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex gap-2" onClick={onLogout}>
               <LogOutIcon className="h-4" /> Çıkış Yap
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
