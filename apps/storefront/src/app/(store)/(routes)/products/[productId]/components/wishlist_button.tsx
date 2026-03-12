'use client'

import { Spinner } from '@/components/native/icons'
import { Button } from '@/components/ui/button'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { useCsrf } from '@/hooks/useCsrf'
import { HeartIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function WishlistButton({ product }) {
   const { authenticated } = useAuthenticated()
   const csrfToken = useCsrf()

   const [wishlist, setWishlist] = useState<any[] | null>(null)
   const [fetchingWishlist, setFetchingWishlist] = useState(true)

   useEffect(() => {
      async function getWishlist() {
         try {
            const response = await fetch('/api/wishlist')
            const json = await response.json()
            setWishlist(json)
         } catch (error) {
            console.error({ error })
         } finally {
            setFetchingWishlist(false)
         }
      }

      if (authenticated) getWishlist()
      else setFetchingWishlist(false)
   }, [authenticated])

   function isProductInWishlist() {
      if (!wishlist) return false
      for (let i = 0; i < wishlist.length; i++) {
         if (wishlist[i]?.id === product?.id) return true
      }
      return false
   }

   async function onAddToWishlist() {
      try {
         setFetchingWishlist(true)
         const response = await fetch('/api/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId: product?.id, connect: true, csrfToken }),
            headers: { 'Content-Type': 'application/json', ...(csrfToken && { 'x-csrf-token': csrfToken }) },
         })
         const json = await response.json()
         setWishlist(json)
      } catch (error) {
         console.error({ error })
      } finally {
         setFetchingWishlist(false)
      }
   }

   async function onRemoveFromWishlist() {
      try {
         setFetchingWishlist(true)
         const response = await fetch('/api/wishlist', {
            method: 'DELETE',
            body: JSON.stringify({ productId: product.id, connect: false, csrfToken }),
            headers: { 'Content-Type': 'application/json', ...(csrfToken && { 'x-csrf-token': csrfToken }) },
         })
         const json = await response.json()
         setWishlist(json)
      } catch (error) {
         console.error({ error })
      } finally {
         setFetchingWishlist(false)
      }
   }

   if (!authenticated) {
      return (
         <Button asChild variant="outline" size="icon" className="flex-shrink-0" title="Favorilere Ekle">
            <Link href="/login">
               <HeartIcon className="h-4 w-4" />
            </Link>
         </Button>
      )
   }

   if (fetchingWishlist)
      return (
         <Button disabled variant="outline" size="icon" className="flex-shrink-0">
            <Spinner />
         </Button>
      )

   if (!isProductInWishlist()) {
      return (
         <Button variant="outline" size="icon" className="flex-shrink-0" onClick={onAddToWishlist} title="Favorilere Ekle">
            <HeartIcon className="h-4 w-4" />
         </Button>
      )
   }

   return (
      <Button
         variant="outline"
         size="icon"
         className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
         onClick={onRemoveFromWishlist}
         title="Favorilerden Çıkar"
      >
         <HeartIcon className="h-4 w-4 fill-current" />
      </Button>
   )
}
