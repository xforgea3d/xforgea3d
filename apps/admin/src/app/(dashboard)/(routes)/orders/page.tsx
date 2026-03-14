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
         where: {
            // Hide unpaid orders that are still waiting for payment redirect
            // (OnayBekleniyor + isPaid=false means user hasn't completed payment yet)
            NOT: {
               status: 'OnayBekleniyor',
               isPaid: false,
            },
         },
         include: {
            orderItems: {
               include: {
                  product: { select: { title: true } },
               },
            },
            user: { select: { name: true, email: true } },
            address: { select: { city: true, address: true, phone: true, postalCode: true } },
         },
         orderBy: { createdAt: 'desc' },
      })
   } catch (error) {
      console.warn('[OrdersPage] Failed to fetch orders:', error)
   }

   const formattedOrders: OrderColumn[] = orders.map((order) => ({
      id: order.id,
      number: order.orderCode || `Sipariş #${order.number}`,
      orderCode: order.orderCode || `#${order.number}`,
      status: order.status,
      statusLabel: STATUS_LABELS[order.status] ?? order.status,
      date: order.createdAt.toUTCString(),
      rawDate: order.createdAt.toISOString().slice(0, 10),
      payable: '₺' + order.payable.toString(),
      subtotal: '₺' + order.total.toString(),
      discountAmount: '₺' + order.discount.toString(),
      taxAmount: '₺' + order.tax.toString(),
      shippingAmount: '₺' + order.shipping.toString(),
      isPaid: order.isPaid,
      trackingNumber: order.trackingNumber ?? null,
      shippingCompany: order.shippingCompany ?? null,
      createdAt: format(order.createdAt, 'd MMMM yyyy', { locale: tr }),
      itemCount: order.orderItems?.length ?? 0,
      customerName: order.user?.name || '-',
      customerEmail: order.user?.email || '-',
      customerPhone: order.address?.phone || '-',
      city: order.address?.city || '-',
      fullAddress: order.address?.address || '-',
      postalCode: order.address?.postalCode || '-',
      products: order.orderItems?.map((item: any) => `${item.product?.title || '-'} x${item.count}`).join('; ') || '-',
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
