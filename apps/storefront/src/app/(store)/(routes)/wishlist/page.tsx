'use client'

import { Heading } from '@/components/native/heading'
import { ProductGrid } from '@/components/native/Product'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { isVariableValid } from '@/lib/utils'
import { useUserContext } from '@/state/User'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WishlistPage() {
   const { authenticated } = useAuthenticated()
   const { user, loading: userLoading } = useUserContext()
   const router = useRouter()

   const [wishlist, setWishlist] = useState<any[] | null>(null)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      if (!userLoading && !isVariableValid(user)) router.push('/login?redirect=/wishlist')
   }, [user, userLoading, router])

   useEffect(() => {
      async function getWishlist() {
         try {
            const response = await fetch('/api/wishlist')
            const json = await response.json()
            setWishlist(json)
         } catch (error) {
            console.error({ error })
         } finally {
            setLoading(false)
         }
      }

      if (authenticated) getWishlist()
   }, [authenticated])

   return (
      <div className="py-8">
         <Heading
            title="Favorilerim"
            description="Beğendiğiniz ürünleri burada bulabilirsiniz."
         />
         {loading ? (
            <div className="flex items-center justify-center py-20">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
         ) : wishlist && wishlist.length > 0 ? (
            <div className="mt-6">
               <ProductGrid products={wishlist} />
            </div>
         ) : (
            <Card className="mt-6">
               <CardContent className="p-8 text-center text-muted-foreground">
                  Henüz favorilere ürün eklemediniz.
               </CardContent>
            </Card>
         )}
      </div>
   )
}
