'use client'

import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Clock, Copy, CreditCard, Loader2, MapPin, Package, Printer, RotateCcw, Truck, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCallback, useEffect, useState } from 'react'

const statusMap: Record<string, { label: string; color: string }> = {
   OnayBekleniyor: { label: 'Onay Bekleniyor', color: 'bg-yellow-100 text-yellow-800' },
   Hazirlaniyor: { label: 'Hazırlanıyor', color: 'bg-orange-100 text-orange-800' },
   Uretimde: { label: 'Üretimde', color: 'bg-blue-100 text-blue-800' },
   Processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800' },
   KargoyaVerildi: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800' },
   Shipped: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800' },
   TeslimEdildi: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
   Delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
   IptalEdildi: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
   Cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
   IadeEdildi: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800' },
   ReturnProcessing: { label: 'İade İşleniyor', color: 'bg-orange-100 text-orange-800' },
   ReturnCompleted: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800' },
   RefundProcessing: { label: 'İade İşleniyor', color: 'bg-orange-100 text-orange-800' },
   RefundCompleted: { label: 'İade Tamamlandı', color: 'bg-gray-100 text-gray-800' },
   Denied: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
}

// Timeline steps in order
const timelineSteps = [
   { key: 'OnayBekleniyor', label: 'Onay Bekleniyor', icon: Clock, aliases: ['OnayBekleniyor'] },
   { key: 'Hazirlaniyor', label: 'Hazırlanıyor', icon: Package, aliases: ['Hazirlaniyor', 'Processing'] },
   { key: 'Uretimde', label: 'Üretimde', icon: Printer, aliases: ['Uretimde'] },
   { key: 'KargoyaVerildi', label: 'Kargoya Verildi', icon: Truck, aliases: ['KargoyaVerildi', 'Shipped'] },
   { key: 'TeslimEdildi', label: 'Teslim Edildi', icon: CheckCircle, aliases: ['TeslimEdildi', 'Delivered'] },
]

const cancelledStatuses = ['IptalEdildi', 'Cancelled', 'Denied']
const returnStatuses = ['IadeEdildi', 'ReturnProcessing', 'ReturnCompleted', 'RefundProcessing', 'RefundCompleted']

function getStepIndex(status: string): number {
   return timelineSteps.findIndex((step) => step.aliases.includes(status))
}

function OrderTimeline({ status }: { status: string }) {
   const isCancelled = cancelledStatuses.includes(status)
   const isReturned = returnStatuses.includes(status)
   const currentIndex = getStepIndex(status)

   if (isCancelled) {
      return (
         <div className="w-full flex flex-col items-center gap-2 py-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500 text-white">
               <XCircle className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-red-600">
               {statusMap[status]?.label || status}
            </span>
         </div>
      )
   }

   if (isReturned) {
      return (
         <div className="w-full flex flex-col items-center gap-2 py-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-500 text-white">
               <RotateCcw className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-600">
               {statusMap[status]?.label || status}
            </span>
         </div>
      )
   }

   return (
      <div className="w-full">
         {/* Desktop: Horizontal */}
         <div className="hidden md:flex items-start justify-between w-full py-4">
            {timelineSteps.map((step, index) => {
               const StepIcon = step.icon
               const isCompleted = currentIndex > index
               const isActive = currentIndex === index
               const isFuture = currentIndex < index

               return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                     {index < timelineSteps.length - 1 && (
                        <div
                           className={cn(
                              'absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5',
                              isCompleted ? 'bg-green-500' : 'bg-muted'
                           )}
                        />
                     )}
                     <div
                        className={cn(
                           'relative z-10 flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors',
                           isCompleted && 'bg-green-500 border-green-500 text-white',
                           isActive && 'bg-orange-500 border-orange-500 text-white',
                           isFuture && 'bg-background border-muted text-muted-foreground'
                        )}
                     >
                        {isCompleted ? (
                           <CheckCircle className="h-5 w-5" />
                        ) : (
                           <StepIcon className="h-5 w-5" />
                        )}
                     </div>
                     <span
                        className={cn(
                           'mt-2 text-xs text-center font-medium',
                           isCompleted && 'text-green-600',
                           isActive && 'text-orange-600',
                           isFuture && 'text-muted-foreground'
                        )}
                     >
                        {step.label}
                     </span>
                  </div>
               )
            })}
         </div>

         {/* Mobile: Vertical */}
         <div className="flex md:hidden flex-col gap-0 py-4 pl-2">
            {timelineSteps.map((step, index) => {
               const StepIcon = step.icon
               const isCompleted = currentIndex > index
               const isActive = currentIndex === index
               const isFuture = currentIndex < index

               return (
                  <div key={step.key} className="flex items-start gap-3">
                     <div className="flex flex-col items-center">
                        <div
                           className={cn(
                              'flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors',
                              isCompleted && 'bg-green-500 border-green-500 text-white',
                              isActive && 'bg-orange-500 border-orange-500 text-white',
                              isFuture && 'bg-background border-muted text-muted-foreground'
                           )}
                        >
                           {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                           ) : (
                              <StepIcon className="h-4 w-4" />
                           )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                           <div
                              className={cn(
                                 'w-0.5 h-6',
                                 isCompleted ? 'bg-green-500' : 'bg-muted'
                              )}
                           />
                        )}
                     </div>
                     <span
                        className={cn(
                           'text-sm font-medium pt-1',
                           isCompleted && 'text-green-600',
                           isActive && 'text-orange-600',
                           isFuture && 'text-muted-foreground'
                        )}
                     >
                        {step.label}
                     </span>
                  </div>
               )
            })}
         </div>
      </div>
   )
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
            <div className="flex items-center gap-2">
               <Heading
                  title={`Sipariş #${order.number}`}
                  description={`${new Date(order.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}`}
               />
               <button
                  onClick={() => {
                     navigator.clipboard.writeText(order.number)
                     toast.success('Sipariş numarası kopyalandı!')
                  }}
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="Sipariş numarasını kopyala"
               >
                  <Copy className="h-4 w-4" />
               </button>
            </div>
            <Badge className={`${status.color} px-3 py-1 text-sm font-medium`}>
               {status.label}
            </Badge>
         </div>

         {/* Order Status Timeline */}
         <Card>
            <CardContent className="pt-6">
               <OrderTimeline status={order.status} />
            </CardContent>
         </Card>

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
