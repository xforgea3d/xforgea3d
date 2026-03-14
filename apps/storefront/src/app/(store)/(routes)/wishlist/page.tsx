'use client'

import { Heading } from '@/components/native/heading'
import { ProductGrid } from '@/components/native/Product'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { isVariableValid } from '@/lib/utils'
import { useUserContext } from '@/state/User'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function WishlistPage() {
   const { authenticated } = useAuthenticated()
   const { user, loading: userLoading } = useUserContext()
   const router = useRouter()

   const [wishlist, setWishlist] = useState<any[] | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)

   useEffect(() => {
      if (!userLoading && !isVariableValid(user)) router.push('/login?redirect=/wishlist')
   }, [user, userLoading, router])

   const fetchWishlist = useCallback(async () => {
      setLoading(true)
      setError(false)
      try {
         const response = await fetch('/api/wishlist')
         if (!response.ok) throw new Error('Failed to fetch wishlist')
         const json = await response.json()
         setWishlist(json)
      } catch (err) {
         console.error({ err })
         setError(true)
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      if (authenticated) fetchWishlist()
   }, [authenticated, fetchWishlist])

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
         ) : error ? (
            <Card className="mt-6">
               <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
                  <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
                  <p className="text-muted-foreground">Bir hata oluştu</p>
                  <Button variant="outline" onClick={fetchWishlist}>
                     Tekrar Dene
                  </Button>
               </CardContent>
            </Card>
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
