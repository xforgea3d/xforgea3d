'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { AlertCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { toast } from 'react-hot-toast'
import type { OrderColumn } from './components/table'
import { OrdersTable } from './components/table'

export default function UserPage() {
   const [orders, setOrders] = useState(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)

   const fetchOrders = useCallback(async () => {
      setLoading(true)
      setError(false)
      try {
         const response = await fetch(`/api/orders`)
         if (!response.ok) throw new Error('Failed to fetch orders')
         const json = await response.json()
         setOrders(json)
      } catch (err) {
         console.error({ err })
         setError(true)
         toast.error('Siparişler yüklenirken bir hata oluştu.')
      } finally {
         setLoading(false)
      }
   }, [])

   useEffect(() => {
      fetchOrders()
   }, [fetchOrders])

   return (
      <div className="flex-col">
         <div className="flex-1">
            {loading ? (
               <Card className="bg-muted-foreground/5">
                  <CardContent>
                     <div className="h-[20vh]">
                        <div className="h-full my-4 flex items-center justify-center">
                           <Loader />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ) : error ? (
               <Card className="bg-muted-foreground/5">
                  <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
                     <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
                     <p className="text-muted-foreground">Bir hata oluştu</p>
                     <Button variant="outline" onClick={fetchOrders}>
                        Tekrar Dene
                     </Button>
                  </CardContent>
               </Card>
            ) : orders ? (
               <OrderSection orders={orders} />
            ) : null}
         </div>
      </div>
   )
}

function OrderSection({ orders }) {
   const formattedOrders: OrderColumn[] = orders.map((order) => ({
      id: order.id,
      number: `Order #${order.number}`,
      date: order.createdAt.toString(),
      payable: '$' + order.payable.toString(),
      isPaid: order.isPaid,
   }))

   return <OrdersTable data={formattedOrders} />
}
