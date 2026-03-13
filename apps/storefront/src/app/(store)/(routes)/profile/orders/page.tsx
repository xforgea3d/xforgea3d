'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { useEffect, useState } from 'react'

import { toast } from 'react-hot-toast'
import type { OrderColumn } from './components/table'
import { OrdersTable } from './components/table'

export default function UserPage() {
   const [orders, setOrders] = useState(null)

   useEffect(() => {
      async function getOrders() {
         try {
            const response = await fetch(`/api/orders`)
            const json = await response.json()
            setOrders(json)
         } catch (error) {
            console.error({ error })
            toast.error('Siparişler yüklenirken bir hata oluştu.')
         }
      }

      getOrders()
   }, [])

   return (
      <div className="flex-col">
         <div className="flex-1">
            {orders ? (
               <OrderSection orders={orders} />
            ) : (
               <Card className="bg-muted-foreground/5">
                  <CardContent>
                     <div className="h-[20vh]">
                        <div className="h-full my-4 flex items-center justify-center">
                           <Loader />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            )}
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
