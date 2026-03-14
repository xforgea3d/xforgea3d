export const revalidate = 0
import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

import { OrderForm } from './components/order-form'

// Turkish labels for order statuses
const STATUS_LABELS: Record<string, string> = {
   OnayBekleniyor: 'Onay Bekleniyor',
   Uretimde: 'Uretimde',
   Processing: 'Islemde',
   Shipped: 'Kargoya Verildi',
   Delivered: 'Teslim Edildi',
   ReturnProcessing: 'Iade Islemde',
   ReturnCompleted: 'Iade Tamamlandi',
   Cancelled: 'Iptal Edildi',
   RefundProcessing: 'Para Iadesi Islemde',
   RefundCompleted: 'Para Iadesi Tamamlandi',
   Denied: 'Reddedildi',
}

const ProductPage = async ({ params }: { params: { orderId: string } }) => {
   const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
         address: true,
         discountCode: true,
         user: true,
         payments: { include: { provider: true } },
         orderItems: { include: { product: true } },
         refund: true,
      },
   })

   if (!order) {
      return (
         <div className="flex-col">
            <div className="flex-1 pt-6 pb-12 space-y-4">
               <Heading title="Siparis bulunamadi" description="" />
            </div>
         </div>
      )
   }

   const customItems = order.orderItems?.filter((item) => (item as any).isCustom) ?? []

   return (
      <div className="flex-col">
         <div className="flex-1 pt-6 pb-12 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
               <Heading
                  title={order.orderCode || `Siparis #${order.number}`}
                  description={`Olusturulma: ${format(order.createdAt, 'd MMMM yyyy HH:mm', { locale: tr })}`}
               />
               <div className="flex items-center gap-2">
                  <Badge variant={order.isPaid ? 'default' : 'destructive'} className="text-xs">
                     {order.isPaid ? 'Odendi' : 'Odenmedi'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                     {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
               </div>
            </div>

            <Separator />

            {/* Order Info + Customer Info side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Order Info Card */}
               <Card>
                  <CardHeader className="pb-3">
                     <CardTitle className="text-base">Siparis Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                           <p className="text-muted-foreground text-xs">Siparis Kodu</p>
                           <p className="font-mono font-semibold">{order.orderCode || `#${order.number}`}</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Durum</p>
                           <p className="font-medium">{STATUS_LABELS[order.status] ?? order.status}</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Toplam</p>
                           <p className="font-medium">{order.total.toFixed(2)} TL</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Vergi</p>
                           <p className="font-medium">{order.tax.toFixed(2)} TL</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Indirim</p>
                           <p className="font-medium">{order.discount.toFixed(2)} TL</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Odenecek</p>
                           <p className="font-bold text-base">{order.payable.toFixed(2)} TL</p>
                        </div>
                        {order.discountCode && (
                           <div className="col-span-2">
                              <p className="text-muted-foreground text-xs">Kupon Kodu</p>
                              <p className="font-mono font-medium">{order.discountCode.code} (%{order.discountCode.percent})</p>
                           </div>
                        )}
                     </div>
                  </CardContent>
               </Card>

               {/* Customer Info Card */}
               <Card>
                  <CardHeader className="pb-3">
                     <CardTitle className="text-base">Musteri Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                           <p className="text-muted-foreground text-xs">Ad Soyad</p>
                           <p className="font-medium">{order.user?.name ?? '-'}</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">E-posta</p>
                           <p className="font-medium">{order.user?.email ?? '-'}</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Telefon</p>
                           <p className="font-medium">{order.user?.phone ?? order.address?.phone ?? '-'}</p>
                        </div>
                        <div>
                           <p className="text-muted-foreground text-xs">Sehir</p>
                           <p className="font-medium">{order.address?.city ?? '-'}</p>
                        </div>
                        {order.address && (
                           <div className="col-span-2">
                              <p className="text-muted-foreground text-xs">Adres</p>
                              <p className="font-medium">{order.address.address}, {order.address.city} {order.address.postalCode}</p>
                           </div>
                        )}
                     </div>
                     <div className="mt-3">
                        <Link
                           href={`/users/${order.user?.id}`}
                           className="text-sm underline text-muted-foreground transition-colors hover:text-primary"
                        >
                           Kullanici profilini goruntule
                        </Link>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Order Items Card */}
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-base">Siparis Kalemleri ({order.orderItems.length})</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b text-left">
                              <th className="pb-2 font-medium text-muted-foreground">Urun</th>
                              <th className="pb-2 font-medium text-muted-foreground text-center">Adet</th>
                              <th className="pb-2 font-medium text-muted-foreground text-right">Birim Fiyat</th>
                              <th className="pb-2 font-medium text-muted-foreground text-right">Indirim</th>
                              <th className="pb-2 font-medium text-muted-foreground text-right">Toplam</th>
                           </tr>
                        </thead>
                        <tbody>
                           {order.orderItems.map((item) => {
                              const snapshot = (item as any).customSnapshot as Record<string, any> | null
                              return (
                                 <tr key={item.id} className="border-b last:border-0">
                                    <td className="py-3">
                                       <p className="font-medium">{item.product?.title ?? 'Silinmis urun'}</p>
                                       {(item as any).isCustom && (
                                          <Badge variant="outline" className="text-[10px] mt-1">Kisiye Ozel</Badge>
                                       )}
                                       {snapshot?.text && (
                                          <p className="text-xs text-muted-foreground mt-1">Metin: {snapshot.text}</p>
                                       )}
                                       {snapshot?.color && (
                                          <div className="flex items-center gap-1 mt-1">
                                             <span className="h-3 w-3 rounded-full border inline-block" style={{ backgroundColor: snapshot.color.hex }} />
                                             <span className="text-xs text-muted-foreground">{snapshot.color.label}</span>
                                          </div>
                                       )}
                                       {snapshot?.size && (
                                          <p className="text-xs text-muted-foreground">Boyut: {snapshot.size.label}</p>
                                       )}
                                       {snapshot?.fileUrl && (
                                          <a href={snapshot.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1 mt-1">
                                             Dosya <ExternalLinkIcon className="h-3 w-3" />
                                          </a>
                                       )}
                                       {snapshot?.partDescription && (
                                          <p className="text-xs text-muted-foreground mt-1">Parca: {snapshot.partDescription}</p>
                                       )}
                                    </td>
                                    <td className="py-3 text-center">{item.count}</td>
                                    <td className="py-3 text-right">{item.price.toFixed(2)} TL</td>
                                    <td className="py-3 text-right">{item.discount.toFixed(2)} TL</td>
                                    <td className="py-3 text-right font-medium">{((item.price - item.discount) * item.count).toFixed(2)} TL</td>
                                 </tr>
                              )
                           })}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>

            {/* Status & Tracking Form */}
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="text-base">Durum ve Kargo</CardTitle>
               </CardHeader>
               <CardContent>
                  <OrderForm initialData={order as any} />
               </CardContent>
            </Card>
         </div>
      </div>
   )
}

export default ProductPage
