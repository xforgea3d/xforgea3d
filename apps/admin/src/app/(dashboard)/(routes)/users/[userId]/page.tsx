export const revalidate = 0
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import type { Prisma } from '@prisma/client'

import type { OrderColumn } from '../../orders/components/table'
import { OrderTable } from '../../orders/components/table'
import { UserForm } from './components/user-form'

type UserWithAdminRelations = Prisma.ProfileGetPayload<{
   include: {
      addresses: true
      payments: true
      orders: {
         include: {
            orderItems: {
               include: {
                  product: true
               }
            }
         }
      }
   }
}>

function OrdersCard({ user }: { user: UserWithAdminRelations }) {
   const formattedOrders: OrderColumn[] = user.orders.map((order) => ({
      id: order.id,
      number: `Sipariş #${order.number}`,
      orderCode: (order as any).orderCode || `XF-${order.number}`,
      date: order.createdAt.toUTCString(),
      rawDate: order.createdAt.toISOString().split('T')[0],
      payable: order.payable.toFixed(2) + ' ₺',
      isPaid: order.isPaid,
      status: (order as any).status || 'OnayBekleniyor',
      statusLabel: '',
      trackingNumber: (order as any).trackingNumber || null,
      shippingCompany: (order as any).shippingCompany || null,
      itemCount: (order as any).items?.length || 0,
      customerName: user.name || '-',
      customerEmail: user.email || '-',
      customerPhone: '-',
      city: '-',
      fullAddress: '-',
      postalCode: '-',
      products: '',
      subtotal: order.payable.toFixed(2) + ' ₺',
      discountAmount: '0.00 ₺',
      taxAmount: '0.00 ₺',
      shippingAmount: '0.00 ₺',
      createdAt: format(order.createdAt, 'MMMM do, yyyy'),
   }))

   return (
      <Card className="my-4 p-2">
         <CardContent>
            <Accordion type="single" collapsible className="w-full">
               <AccordionItem value="item-2">
                  <AccordionTrigger>
                     <div className="block">
                        <h2 className="text-lg font-bold tracking-wider text-left">
                           SİPARİŞ GEÇMİŞİ
                        </h2>
                        <p className="text-sm font-light text-foreground/70 text-left">
                           Bu siparişte kullanıcı.
                        </p>
                     </div>
                  </AccordionTrigger>
                  <AccordionContent>
                     <OrderTable data={formattedOrders} />
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </CardContent>
      </Card>
   )
}

function UserCard({ user }: { user: UserWithAdminRelations }) {
   return (
      <Card className="my-4 p-2 pb-0">
         <CardContent>
            <Accordion type="single" collapsible className="w-full">
               <AccordionItem value="item-2">
                  <AccordionTrigger>
                     <div className="block">
                        <h2 className="text-lg font-bold tracking-wider text-left">
                           KULLANICI
                        </h2>
                        <p className="text-sm font-light text-foreground/70">
                           Bu siparişte kullanıcı.
                        </p>
                     </div>
                  </AccordionTrigger>
                  <AccordionContent>
                     <UserForm initialData={user} />
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </CardContent>
      </Card>
   )
}

const UserPage = async ({ params }: { params: { userId: string } }) => {
   try {
      const user = await prisma.profile.findUnique({
         where: {
            id: params.userId,
         },
         include: {
            addresses: true,
            payments: true,
            orders: {
               include: {
                  orderItems: {
                     include: {
                        product: true,
                     },
                  },
               },
            },
         },
      })

      if (!user) {
         notFound()
      }

      return (
         <div className="flex-col">
            <div className="flex-1 pt-6 pb-12">
               <div className="flex items-center justify-between">
                  <Heading
                     title="Kullanıcı Verileri"
                     description="Bu siparişteki ürünler ve kullanıcı hakkındaki veriler."
                  />
               </div>
               <UserCard user={user} />
               <OrdersCard user={user} />
            </div>
         </div>
      )
   } catch {
      notFound()
   }
}

export default UserPage
