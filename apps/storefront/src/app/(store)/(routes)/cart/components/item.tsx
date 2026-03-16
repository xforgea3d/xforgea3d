'use client'

import { Spinner } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { useCsrf } from '@/hooks/useCsrf'
import { getCountInCart, getLocalCart, writeLocalCart } from '@/lib/cart'
import { isFlashSaleActive } from '@/lib/flash-sale'
import { useCartContext } from '@/state/Cart'
import { MinusIcon, PlusIcon, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export const Item = ({ cartItem }) => {
   const { authenticated } = useAuthenticated()
   const csrfToken = useCsrf()
   const { loading, cart, refreshCart, dispatchCart } = useCartContext()
   const [fetchingCart, setFetchingCart] = useState(false)

   const { product, productId, count } = cartItem

   function findLocalCartIndexById(cart, productId) {
      const items = cart?.items || []
      for (let i = 0; i < items.length; i++) {
         if (items[i]?.productId === productId) {
            return i
         }
      }
      return -1
   }

   async function getProduct() {
      try {
         const response = await fetch(`/api/products/${productId}`, {
            cache: 'no-store',
         })

         if (!response.ok) return null
         return await response.json()
      } catch (error) {
         console.error({ error })
      }
   }

   async function onAddToCart() {
      try {
         setFetchingCart(true)

         if (authenticated) {
            const response = await fetch(`/api/cart`, {
               method: 'POST',
               body: JSON.stringify({
                  productId,
                  count:
                     getCountInCart({ cartItems: cart?.items, productId }) + 1,
                  csrfToken,
               }),
               cache: 'no-store',
               headers: {
                  'Content-Type': 'application/json',
                  ...(csrfToken && { 'x-csrf-token': csrfToken }),
               },
            })

            if (!response.ok) throw new Error('Sepet güncellenemedi')
            const json = await response.json()

            dispatchCart(json)
         }

         const localCart = getLocalCart() as any

         if (
            !authenticated &&
            getCountInCart({ cartItems: cart?.items, productId }) > 0
         ) {
            for (let i = 0; i < localCart.items.length; i++) {
               if (localCart.items[i].productId === productId) {
                  localCart.items[i].count = localCart.items[i].count + 1
               }
            }

            dispatchCart(localCart)
         }

         if (
            !authenticated &&
            getCountInCart({ cartItems: cart?.items, productId }) < 1
         ) {
            localCart.items.push({
               productId,
               product: await getProduct(),
               count: 1,
            })

            dispatchCart(localCart)
         }

         setFetchingCart(false)
      } catch (error) {
         console.error({ error })
      }
   }

   async function onRemoveFromCart() {
      try {
         setFetchingCart(true)

         if (authenticated) {
            const response = await fetch(`/api/cart`, {
               method: 'POST',
               body: JSON.stringify({
                  productId,
                  count:
                     getCountInCart({ cartItems: cart?.items, productId }) - 1,
                  csrfToken,
               }),
               cache: 'no-store',
               headers: {
                  'Content-Type': 'application/json',
                  ...(csrfToken && { 'x-csrf-token': csrfToken }),
               },
            })

            if (!response.ok) throw new Error('Sepet güncellenemedi')
            const json = await response.json()
            dispatchCart(json)
         }

         const localCart = getLocalCart() as any
         const index = findLocalCartIndexById(localCart, productId)

         if (
            !authenticated &&
            getCountInCart({ cartItems: cart?.items, productId }) > 1
         ) {
            for (let i = 0; i < localCart.items.length; i++) {
               if (localCart.items[i].productId === productId) {
                  localCart.items[i].count = localCart.items[i].count - 1
               }
            }

            dispatchCart(localCart)
         }

         if (
            !authenticated &&
            getCountInCart({ cartItems: cart?.items, productId }) === 1
         ) {
            localCart.items.splice(index, 1)

            dispatchCart(localCart)
         }

         setFetchingCart(false)
      } catch (error) {
         console.error({ error })
      }
   }

   function CartButton() {
      const count = getCountInCart({
         cartItems: cart?.items,
         productId,
      })

      if (fetchingCart)
         return (
            <Button disabled>
               <Spinner />
            </Button>
         )

      if (count === 0) {
         return <Button onClick={onAddToCart}>Sepete Ekle</Button>
      }

      if (count > 0) {
         return (
            <>
               <Button variant="outline" size="icon" onClick={onRemoveFromCart}>
                  {count === 1 ? (
                     <X className="h-4" />
                  ) : (
                     <MinusIcon className="h-4" />
                  )}
               </Button>
               <Button disabled variant="ghost" size="icon">
                  {count}
               </Button>
               <Button
                  disabled={productId == ''}
                  variant="outline"
                  size="icon"
                  onClick={onAddToCart}
               >
                  <PlusIcon className="h-4" />
               </Button>
            </>
         )
      }
   }

   function Price() {
      // Flash sale check
      const hasFlashSale = isFlashSaleActive(product)

      if (hasFlashSale) {
         const salePct = ((product.price - product.flashSalePrice) / product.price * 100).toFixed(0)
         return (
            <div className="flex gap-2 items-center">
               <Badge className="flex gap-2 bg-red-600" variant="destructive">
                  <span>⚡ Ozel Firsat</span>
                  <span>%{salePct}</span>
               </Badge>
               <h2 className="text-red-600 dark:text-red-400 font-bold">{product.flashSalePrice.toFixed(2)} &#8378;</h2>
               <span className="text-sm text-muted-foreground line-through">{product.price.toFixed(2)} &#8378;</span>
            </div>
         )
      }

      if ((product?.discount ?? 0) > 0) {
         const price = (product?.price ?? 0) - (product?.discount ?? 0)
         const percentage = (product?.price ?? 0) > 0 ? ((product?.discount ?? 0) / (product?.price ?? 0)) * 100 : 0
         return (
            <div className="flex gap-2 items-center">
               <Badge className="flex gap-4" variant="destructive">
                  <div className="line-through">{product?.price} &#8378;</div>
                  <div>%{percentage.toFixed(2)}</div>
               </Badge>
               <h2 className="">{price.toFixed(2)} &#8378;</h2>
            </div>
         )
      }

      return <h2>{product?.price ?? 0} &#8378;</h2>
   }
   return (
      <Card>
         <CardHeader className="p-0 md:hidden">
            <div className="relative h-32 w-full">
               <Link href={`/products/${product?.id}`}>
                  <img
                     className="absolute inset-0 h-full w-full rounded-t-lg object-cover"
                     src={product?.images?.[0] ?? ''}
                     alt="product image"
                     loading="lazy"
                  />
               </Link>
            </div>
         </CardHeader>
         <CardContent className="grid grid-cols-6 gap-4 p-3">
            <div className="relative w-full col-span-2 hidden md:inline-flex">
               <Link href={`/products/${product?.id}`}>
                  <img
                     className="absolute inset-0 h-full w-full rounded-lg object-cover"
                     src={product?.images?.[0] ?? ''}
                     alt="item image"
                     loading="lazy"
                  />
               </Link>
            </div>
            <div className="col-span-4 block space-y-2">
               <Link href={`/products/${product?.id}`}>
                  <h2>{product?.title}</h2>
               </Link>
               <p className="text-xs text-muted-foreground text-justify">
                  {product?.description}
               </p>
               <Price />
               <CartButton />
            </div>
         </CardContent>
      </Card>
   )
}
