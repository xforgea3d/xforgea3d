import prisma from '@/lib/prisma'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { PaymentButton } from './payment-button'

interface Props {
   params: { orderId: string }
   searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
   title: 'Ödeme',
   robots: { index: false, follow: false },
}

export default async function PaymentPage({ params, searchParams }: Props) {
   const headersList = headers()
   const userId = headersList.get('X-USER-ID')

   if (!userId) {
      redirect('/auth/login')
   }

   const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
         orderItems: { include: { product: true } },
         address: true,
         payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
   })

   if (!order || order.userId !== userId) {
      notFound()
   }

   // Check if order is already paid
   if (order.isPaid) {
      return (
         <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
               <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h1 className="text-2xl font-bold">Ödeme Tamamlandı</h1>
            <p className="text-muted-foreground">
               Sipariş #{order.number} için ödemeniz başarıyla alındı.
            </p>
            <Link
               href="/profile"
               className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
               Siparişlerime Git
            </Link>
         </div>
      )
   }

   // Check if payment keys are configured
   const hasPaymentKeys = !!(
      process.env.PAYMENT_API_KEY &&
      process.env.PAYMENT_SECRET_KEY &&
      process.env.PAYMENT_MERCHANT_ID
   )

   const hasError = searchParams?.error === 'payment_failed'

   return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
         {/* Header */}
         <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Ödeme</h1>
            <p className="text-muted-foreground">
               Sipariş #{order.number}
            </p>
         </div>

         {/* Error banner */}
         {hasError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
               <p className="text-sm text-red-800 dark:text-red-200">
                  Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin veya farklı bir kart kullanın.
               </p>
            </div>
         )}

         {/* Order Summary */}
         <div className="rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-lg">Sipariş Özeti</h2>

            <div className="divide-y">
               {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                     <div className="flex items-center gap-3">
                        {item.product.images?.[0] && (
                           <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                 src={item.product.images[0]}
                                 alt={item.product.title}
                                 className="w-full h-full object-cover"
                              />
                           </div>
                        )}
                        <div>
                           <p className="font-medium text-sm">{item.product.title}</p>
                           <p className="text-xs text-muted-foreground">Adet: {item.count}</p>
                        </div>
                     </div>
                     <p className="font-medium text-sm">
                        {((item.price - item.discount) * item.count).toFixed(2)} TL
                     </p>
                  </div>
               ))}
            </div>

            <div className="border-t pt-4 space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>{order.total.toFixed(2)} TL</span>
               </div>
               {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">İndirim</span>
                     <span className="text-green-600">-{order.discount.toFixed(2)} TL</span>
                  </div>
               )}
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KDV</span>
                  <span>{order.tax.toFixed(2)} TL</span>
               </div>
               {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Kargo</span>
                     <span>{order.shipping.toFixed(2)} TL</span>
                  </div>
               )}
               <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Toplam</span>
                  <span>{order.payable.toFixed(2)} TL</span>
               </div>
            </div>
         </div>

         {/* Delivery Address */}
         {order.address && (
            <div className="rounded-xl border p-6 space-y-2">
               <h2 className="font-semibold text-lg">Teslimat Adresi</h2>
               <p className="text-sm text-muted-foreground">
                  {order.address.address}, {order.address.city} {order.address.postalCode}
               </p>
               <p className="text-sm text-muted-foreground">Tel: {order.address.phone}</p>
            </div>
         )}

         {/* Payment Action */}
         <div className="rounded-xl border p-6 space-y-4">
            {hasPaymentKeys ? (
               <>
                  <h2 className="font-semibold text-lg">Kredi/Banka Kartı ile Öde</h2>
                  <p className="text-sm text-muted-foreground">
                     Güvenli ödeme sayfasına yönlendirileceksiniz. Kart bilgileriniz sitemizde saklanmaz.
                  </p>
                  <PaymentButton orderId={order.id} amount={order.payable} />
               </>
            ) : (
               <>
                  <div className="text-center space-y-3 py-4">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900">
                        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                     </div>
                     <h2 className="font-semibold text-lg">Ödeme Altyapısı Yakında Aktif Olacak</h2>
                     <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Online ödeme altyapımız şu anda hazırlanmaktadır. Siparişlerinizi oluşturabilir,
                        ödeme aktif olduğunda kolayca tamamlayabilirsiniz.
                     </p>
                     <p className="text-sm text-muted-foreground">
                        Sorularınız için bize WhatsApp veya e-posta ile ulaşabilirsiniz.
                     </p>
                  </div>

                  {/* Test mode button */}
                  {process.env.NODE_ENV === 'development' && (
                     <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-2 text-center">
                           Geliştirici Modu: Test ödemesi yapabilirsiniz
                        </p>
                        <PaymentButton orderId={order.id} amount={order.payable} isTest />
                     </div>
                  )}
               </>
            )}
         </div>

         {/* Back link */}
         <div className="text-center">
            <Link
               href="/profile"
               className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
               ← Siparişlerime Dön
            </Link>
         </div>
      </div>
   )
}

