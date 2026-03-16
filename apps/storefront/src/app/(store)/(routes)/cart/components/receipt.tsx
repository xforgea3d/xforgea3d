'use client'

import { Separator } from '@/components/native/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { isFlashSaleActive } from '@/lib/flash-sale'
import { isVariableValid } from '@/lib/utils'
import { useCartContext } from '@/state/Cart'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export function Receipt() {
   const { authenticated } = useAuthenticated()
   const { loading, cart } = useCartContext()
   const [taxRate, setTaxRate] = useState(20)

   useEffect(() => {
      fetch('/api/maintenance-status')
         .then((r) => r.json())
         .then((data) => {
            if (data.tax_rate != null) setTaxRate(data.tax_rate)
         })
         .catch(() => {})
   }, [])

   const costs = useMemo(() => {
      let totalAmount = 0,
         discountAmount = 0
      const now = Date.now()

      if (isVariableValid(cart?.items)) {
         for (const item of cart?.items) {
            const p = item?.product
            const hasFlashSale = isFlashSaleActive(p)

            if (hasFlashSale) {
               totalAmount += item?.count * p.flashSalePrice
               // No per-product discount during flash sale
            } else {
               totalAmount += item?.count * (p?.price ?? 0)
               discountAmount += item?.count * (p?.discount ?? 0)
            }
         }
      }

      const afterDiscountAmount = totalAmount - discountAmount
      const taxAmount = afterDiscountAmount * (taxRate / 100)
      const payableAmount = afterDiscountAmount + taxAmount

      return {
         totalAmount: totalAmount.toFixed(2),
         discountAmount: discountAmount.toFixed(2),
         afterDiscountAmount: afterDiscountAmount.toFixed(2),
         taxAmount: taxAmount.toFixed(2),
         payableAmount: payableAmount.toFixed(2),
      }
   }, [cart?.items, taxRate])

   return (
      <Card className={loading ? 'animate-pulse' : undefined}>
         <CardHeader className="p-4 pb-0">
            <h2 className="font-bold tracking-tight">Sipariş Özeti</h2>
         </CardHeader>
         <CardContent className="p-4 text-sm">
            <div className="block space-y-[1vh]">
               <div className="flex justify-between">
                  <p>Toplam Tutar</p>
                  <h3>{costs.totalAmount} ₺</h3>
               </div>
               <div className="flex justify-between">
                  <p>İndirim</p>
                  <h3>{costs.discountAmount} ₺</h3>
               </div>
               <div className="flex justify-between">
                  <p>KDV (%{taxRate})</p>
                  <h3>{costs.taxAmount} ₺</h3>
               </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold">
               <p>Ödenecek Tutar</p>
               <h3>{costs.payableAmount} ₺</h3>
            </div>
         </CardContent>
         <Separator />
         <CardFooter>
            <Link
               href={authenticated ? '/checkout' : '/login?redirect=/checkout'}
               className="w-full"
            >
               <Button
                  disabled={
                     !isVariableValid(cart?.items) || (cart as any)?.items?.length === 0
                  }
                  className="w-full"
               >
                  Siparişi Tamamla
               </Button>
            </Link>
         </CardFooter>
      </Card>
   )
}
