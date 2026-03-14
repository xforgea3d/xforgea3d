export const revalidate = 0
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; color: string }> = {
   Paid: { label: 'Basarili', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
   Failed: { label: 'Basarisiz', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
   Processing: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
   Denied: { label: 'Reddedildi', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
   return (
      <div className="flex justify-between py-2 border-b last:border-b-0">
         <span className="text-sm text-muted-foreground">{label}</span>
         <span className="text-sm font-medium text-right">{value}</span>
      </div>
   )
}

export default async function PaymentPage({
   params,
}: {
   params: { paymentId: string }
}) {
   const payment = await prisma.payment.findUnique({
      where: {
         id: params.paymentId,
      },
      include: {
         provider: true,
         user: true,
         order: {
            include: {
               orderItems: {
                  include: {
                     product: {
                        select: { id: true, title: true },
                     },
                  },
               },
            },
         },
      },
   })

   if (!payment) {
      return (
         <div className="block space-y-4 my-6 p-8">
            <Heading title="Odeme Bulunamadi" description="Bu ID ile eslesen bir odeme yok." />
         </div>
      )
   }

   const config = statusConfig[payment.status] || { label: payment.status, color: 'bg-gray-100 text-gray-800' }

   return (
      <div className="block space-y-6 my-6 p-8">
         <div className="flex items-center justify-between">
            <Heading
               title={`Odeme #${payment.number}`}
               description={`Ref: ${payment.refId}`}
            />
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
               {config.label}
            </span>
         </div>
         <Separator />

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Payment Details */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Odeme Bilgileri</CardTitle>
               </CardHeader>
               <CardContent className="space-y-0">
                  <InfoRow label="Odeme No" value={`#${payment.number}`} />
                  <InfoRow label="Ref ID" value={<span className="font-mono text-xs">{payment.refId}</span>} />
                  <InfoRow
                     label="Durum"
                     value={
                        <Badge variant={payment.isSuccessful ? 'default' : 'destructive'}>
                           {payment.isSuccessful ? 'Basarili' : 'Basarisiz'}
                        </Badge>
                     }
                  />
                  <InfoRow
                     label="Tutar"
                     value={payment.payable.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  />
                  {payment.fee !== null && (
                     <InfoRow
                        label="Komisyon"
                        value={payment.fee.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                     />
                  )}
                  <InfoRow label="Kart" value={<span className="font-mono">{payment.cardPan || '-'}</span>} />
                  {payment.cardHash && (
                     <InfoRow label="Kart Hash" value={<span className="font-mono text-xs truncate max-w-[200px] inline-block">{payment.cardHash}</span>} />
                  )}
                  <InfoRow label="Odeme Saglayici" value={payment.provider.title} />
                  <InfoRow label="Olusturulma" value={format(payment.createdAt, 'dd.MM.yyyy HH:mm:ss')} />
                  <InfoRow label="Guncelleme" value={format(payment.updatedAt, 'dd.MM.yyyy HH:mm:ss')} />
               </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Siparis Bilgileri</CardTitle>
               </CardHeader>
               <CardContent className="space-y-0">
                  <InfoRow
                     label="Siparis No"
                     value={
                        <Link href={`/orders/${payment.order.id}`} className="text-blue-600 hover:underline">
                           #{payment.order.number}
                        </Link>
                     }
                  />
                  <InfoRow label="Siparis Durumu" value={payment.order.status} />
                  <InfoRow
                     label="Toplam"
                     value={payment.order.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  />
                  <InfoRow
                     label="Kargo"
                     value={payment.order.shipping.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  />
                  <InfoRow
                     label="Vergi"
                     value={payment.order.tax.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  />
                  <InfoRow
                     label="Indirim"
                     value={payment.order.discount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  />
                  <InfoRow
                     label="Odenecek"
                     value={payment.order.payable.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  />
                  <InfoRow label="Odendi" value={payment.order.isPaid ? 'Evet' : 'Hayir'} />
                  <InfoRow label="Siparis Tarihi" value={format(payment.order.createdAt, 'dd.MM.yyyy HH:mm')} />
               </CardContent>
            </Card>

            {/* User Details */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Kullanici Bilgileri</CardTitle>
               </CardHeader>
               <CardContent className="space-y-0">
                  <InfoRow
                     label="Kullanici"
                     value={
                        <Link href={`/users/${payment.user.id}`} className="text-blue-600 hover:underline">
                           {payment.user.name || payment.user.email}
                        </Link>
                     }
                  />
                  <InfoRow label="E-posta" value={payment.user.email} />
                  <InfoRow label="Telefon" value={payment.user.phone || '-'} />
                  <InfoRow label="Rol" value={payment.user.role} />
               </CardContent>
            </Card>
         </div>

         {/* Order Items */}
         {payment.order.orderItems.length > 0 && (
            <>
               <Separator />
               <div>
                  <h3 className="text-lg font-semibold mb-4">Siparis Urunleri</h3>
                  <div className="rounded-md border">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 text-sm font-medium">Urun</th>
                              <th className="text-right p-3 text-sm font-medium">Adet</th>
                              <th className="text-right p-3 text-sm font-medium">Fiyat</th>
                              <th className="text-right p-3 text-sm font-medium">Indirim</th>
                           </tr>
                        </thead>
                        <tbody>
                           {payment.order.orderItems.map((item) => (
                              <tr key={item.id} className="border-b last:border-b-0">
                                 <td className="p-3 text-sm">
                                    <Link href={`/products/${item.product.id}`} className="text-blue-600 hover:underline">
                                       {item.product.title}
                                    </Link>
                                    {item.isCustom && (
                                       <Badge variant="outline" className="ml-2 text-xs">Ozel</Badge>
                                    )}
                                 </td>
                                 <td className="p-3 text-sm text-right">{item.count}</td>
                                 <td className="p-3 text-sm text-right">
                                    {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                 </td>
                                 <td className="p-3 text-sm text-right">
                                    {item.discount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </>
         )}
      </div>
   )
}
