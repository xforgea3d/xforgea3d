'use client'

import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { AlertCircle, Loader2, MapPin, Package, CreditCard } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const statusMap: Record<string, { label: string; color: string }> = {
   OnayBekleniyor: { label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
   Uretimde: { label: 'Üretimde', color: 'bg-blue-100 text-blue-800' },
   Processing: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-800' },
   Shipped: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800' },
   Delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
   Cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
   Denied: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
   const { authenticated } = useAuthenticated()
   const [order, setOrder] = useState<any>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(false)

   const fetchOrder = useCallback(async () => {
      setLoading(true)
      setError(false)
      try {
         const res = await fetch(`/api/orders/${params.orderId}`)
         if (!res.ok) throw new Error('Failed to fetch order')
         setOrder(await res.json())
      } catch (err) {
         console.error(err)
         setError(true)
      } finally {
         setLoading(false)
      }
   }, [params.orderId])

   useEffect(() => {
      if (authenticated) fetchOrder()
   }, [authenticated, fetchOrder])

   if (loading) {
      return (
         <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      )
   }

   if (error) {
      return (
         <div className="py-8">
            <Card>
               <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
                  <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
                  <p className="text-muted-foreground">Bir hata oluştu</p>
                  <Button variant="outline" onClick={fetchOrder}>
                     Tekrar Dene
                  </Button>
               </CardContent>
            </Card>
         </div>
      )
   }

   if (!order) {
      return (
         <div className="py-8">
            <Heading title="Sipariş Bulunamadı" description="Bu sipariş mevcut değil veya size ait değil." />
         </div>
      )
   }

   const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' }

   return (
      <div className="py-8 space-y-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Sipariş #${order.number}`}
               description={`${new Date(order.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            />
            <Badge className={`${status.color} px-3 py-1 text-sm font-medium`}>
               {status.label}
            </Badge>
         </div>

         <div className="grid lg:grid-cols-3 gap-6">
            {/* Ürünler */}
            <div className="lg:col-span-2 space-y-4">
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5" /> Sipariş Kalemleri
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {order.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 py-2">
                           {item.product?.images?.[0] && (
                              <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border">
                                 <img src={item.product.images[0]} alt={item.product.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                              </div>
                           )}
                           <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.product?.title || 'Ürün'}</p>
                              <p className="text-sm text-muted-foreground">{item.count} adet</p>
                           </div>
                           <div className="text-right">
                              <p className="font-semibold">{(item.price * item.count).toFixed(2)} ₺</p>
                              {item.discount > 0 && (
                                 <p className="text-sm text-muted-foreground line-through">{(item.price * item.count + item.discount * item.count).toFixed(2)} ₺</p>
                              )}
                           </div>
                        </div>
                     ))}
                  </CardContent>
               </Card>
            </div>

            {/* Özet + Adres */}
            <div className="space-y-4">
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="h-5 w-5" /> Ödeme Özeti
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span>Toplam</span>
                        <span>{order.total?.toFixed(2)} ₺</span>
                     </div>
                     <div className="flex justify-between">
                        <span>İndirim</span>
                        <span>-{order.discount?.toFixed(2)} ₺</span>
                     </div>
                     <div className="flex justify-between">
                        <span>KDV</span>
                        <span>{order.tax?.toFixed(2)} ₺</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Kargo</span>
                        <span>{order.shipping > 0 ? `${order.shipping?.toFixed(2)} ₺` : 'Ücretsiz'}</span>
                     </div>
                     <Separator />
                     <div className="flex justify-between font-bold text-base">
                        <span>Toplam</span>
                        <span>{order.payable?.toFixed(2)} ₺</span>
                     </div>
                     <div className="flex justify-between pt-2">
                        <span>Ödeme Durumu</span>
                        <Badge variant={order.isPaid ? 'default' : 'outline'}>
                           {order.isPaid ? 'Ödendi' : 'Ödeme Bekleniyor'}
                        </Badge>
                     </div>
                  </CardContent>
               </Card>

               {order.address && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <MapPin className="h-5 w-5" /> Teslimat Adresi
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="text-sm space-y-1">
                        <p>{order.address.address}</p>
                        <p>{order.address.city} - {order.address.postalCode}</p>
                        <p>{order.address.phone}</p>
                     </CardContent>
                  </Card>
               )}
            </div>
         </div>
      </div>
   )
}
