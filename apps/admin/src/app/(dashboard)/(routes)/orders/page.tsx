export const revalidate = 0
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

import { SortBy } from './components/options'
import type { OrderColumn } from './components/table'
import { OrderTable } from './components/table'

export default async function OrdersPage({ searchParams }) {
   const {
      userId,
      sort,
      isPaid,
      brand,
      category,
      page = 1,
      minPayable,
      maxPayable,
   } = searchParams ?? null

   const orderBy = getOrderBy(sort)

   let orders: any[] = []
   try {
      orders = await prisma.order.findMany({
         where: {
            userId,
            isPaid,
            orderItems: {
               some: {
                  product: {
                     brand: {
                        title: {
                           contains: brand,
                        },
                     },
                     categories: {
                        some: {
                           title: {
                              contains: category,
                           },
                        },
                     },
                  },
               },
            },
            payable: {
               gte: minPayable,
               lte: maxPayable,
            },
         },
         include: {
            orderItems: {
               include: {
                  product: true,
               },
            },
         },
         skip: (page - 1) * 12,
         take: 12,
         orderBy,
      })
   } catch (error) {
      console.warn('[OrdersPage] Failed to fetch orders:', error)
   }

   const formattedOrders: OrderColumn[] = orders.map((order) => ({
      id: order.id,
      number: `Sipariş #${order.number}`,
      date: order.createdAt.toUTCString(),
      payable: '₺' + order.payable.toString(),
      isPaid: order.isPaid,
      createdAt: format(order.createdAt, 'd MMMM yyyy', { locale: tr }),
   }))

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Siparişler (${orders.length})`}
            description="Mağazanızdaki siparişleri yönetin."
         />
         <Separator />
         <div className="grid grid-cols-4 gap-2">
            <SortBy initialData={'highest_payable'} />
         </div>
         <OrderTable data={formattedOrders} />{' '}
      </div>
   )
}

function getOrderBy(sort) {
   let orderBy

   switch (sort) {
      case 'highest_payable':
         orderBy = {
            payable: 'desc',
         }
         break
      case 'lowest_payable':
         orderBy = {
            payable: 'asc',
         }
         break

      default:
         orderBy = {
            createdAt: 'desc',
         }
         break
   }

   return orderBy
}
