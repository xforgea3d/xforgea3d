'use client'

import { useEffect, useState } from 'react'
import { getRecentlyViewed } from '@/lib/recently-viewed'
import Link from 'next/link'
import SafeImage from '@/components/native/SafeImage'

interface RecentProduct {
   id: string
   title: string
   price: number
   discount: number
   images: string[]
}

export default function RecentlyViewed() {
   const [products, setProducts] = useState<RecentProduct[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      async function fetchProducts() {
         const ids = getRecentlyViewed()
         if (ids.length === 0) {
            setLoading(false)
            return
         }

         try {
            const res = await fetch('/api/products')
            if (!res.ok) {
               setLoading(false)
               return
            }
            const allProducts: RecentProduct[] = await res.json()
            // Preserve order from recently viewed list
            const productMap = new Map(allProducts.map((p) => [p.id, p]))
            const ordered = ids
               .map((id) => productMap.get(id))
               .filter((p): p is RecentProduct => !!p)
            setProducts(ordered)
         } catch {
            // silently fail
         } finally {
            setLoading(false)
         }
      }

      fetchProducts()
   }, [])

   if (loading || products.length === 0) return null

   return (
      <section className="space-y-4">
         <h2 className="text-2xl font-bold tracking-tight">Son Görüntülenen Ürünler</h2>
         <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {products.map((product) => {
               const hasDiscount = product.discount > 0
               const displayPrice = hasDiscount ? product.price - product.discount : product.price

               return (
                  <Link
                     key={product.id}
                     href={`/products/${product.id}`}
                     className="flex-shrink-0 w-48 group"
                  >
                     <div className="rounded-lg border overflow-hidden bg-background hover:shadow-md transition-shadow">
                        <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-900">
                           {product.images?.[0] ? (
                              <SafeImage
                                 src={product.images[0]}
                                 alt={product.title}
                                 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                 Görsel yok
                              </div>
                           )}
                        </div>
                        <div className="p-3 space-y-1">
                           <p className="text-sm font-medium truncate">{product.title}</p>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{displayPrice.toFixed(2)} TL</span>
                              {hasDiscount && (
                                 <span className="text-xs text-muted-foreground line-through">
                                    {product.price.toFixed(2)} TL
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                  </Link>
               )
            })}
         </div>
      </section>
   )
}
