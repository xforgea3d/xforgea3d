export const revalidate = 0
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

import type { OrderColumn } from './components/table'
import { OrdersClient } from './components/table'

// Turkish labels for statuses used in the table
const STATUS_LABELS: Record<string, string> = {
   OnayBekleniyor: 'Onay Bekleniyor',
   Hazirlaniyor: 'Hazırlanıyor',
   Uretimde: 'Üretimde',
   Processing: 'İşlemde',
   KargoyaVerildi: 'Kargoya Verildi',
   Shipped: 'Kargoya Verildi',
   TeslimEdildi: 'Teslim Edildi',
   Delivered: 'Teslim Edildi',
   IptalEdildi: 'İptal Edildi',
   Cancelled: 'İptal Edildi',
   IadeEdildi: 'İade Edildi',
   ReturnProcessing: 'İade İşlemde',
   ReturnCompleted: 'İade Tamamlandı',
   RefundProcessing: 'Para İadesi İşlemde',
   RefundCompleted: 'Para İadesi Tamamlandı',
   Denied: 'Reddedildi',
}

export default async function OrdersPage() {
   let orders: any[] = []
   try {
      orders = await prisma.order.findMany({
         include: {
            orderItems: {
               include: {
                  product: true,
               },
            },
         },
         orderBy: { createdAt: 'desc' },
      })
   } catch (error) {
      console.warn('[OrdersPage] Failed to fetch orders:', error)
   }

   const formattedOrders: OrderColumn[] = orders.map((order) => ({
      id: order.id,
      number: `Sipariş #${order.number}`,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      date: order.createdAt.toUTCString(),
      payable: '₺' + order.payable.toString(),
      isPaid: order.isPaid,
      trackingNumber: order.trackingNumber ?? null,
      shippingCompany: order.shippingCompany ?? null,
      createdAt: format(order.createdAt, 'd MMMM yyyy', { locale: tr }),
      itemCount: order.orderItems?.length ?? 0,
   }))

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Siparişler (${orders.length})`}
            description="Mağazanızdaki siparişleri yönetin."
         />
         <Separator />
         <OrdersClient data={formattedOrders} />
      </div>
   )
}
