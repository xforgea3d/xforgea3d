export const revalidate = 0

import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { QuoteResponseForm } from './components/quote-response-form'

const statusLabels: Record<string, string> = {
   Pending: 'Beklemede',
   Priced: 'Fiyatlandırıldı',
   Accepted: 'Kabul Edildi',
   Rejected: 'Reddedildi',
   Completed: 'Tamamlandı',
}

export default async function QuoteRequestDetailPage({
   params,
}: {
   params: { requestId: string }
}) {
   const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id: params.requestId },
      include: {
         user: { select: { name: true, email: true, phone: true } },
         carBrand: { select: { name: true } },
         carModel: { select: { name: true } },
         order: { select: { id: true, number: true, status: true, isPaid: true } },
      },
   })

   if (!quoteRequest) redirect('/quote-requests')

   return (
      <div className="block space-y-6 my-6">
         <Heading
            title={`Parça Talebi #${quoteRequest.number}`}
            description={`Oluşturulma: ${format(quoteRequest.createdAt, 'dd.MM.yyyy HH:mm')}`}
         />
         <Separator />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol: Talep Detayları */}
            <div className="space-y-4">
               <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="font-semibold text-sm">Talep Bilgileri</h3>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <span className="text-muted-foreground">Durum:</span>
                     <span className="font-medium">{statusLabels[quoteRequest.status]}</span>

                     <span className="text-muted-foreground">E-posta:</span>
                     <span>{quoteRequest.email}</span>

                     <span className="text-muted-foreground">Ad:</span>
                     <span>{quoteRequest.name || quoteRequest.user?.name || '-'}</span>

                     <span className="text-muted-foreground">Telefon:</span>
                     <span>{quoteRequest.phone || quoteRequest.user?.phone || '-'}</span>

                     <span className="text-muted-foreground">Araç Markası:</span>
                     <span>{quoteRequest.carBrand?.name || '-'}</span>

                     <span className="text-muted-foreground">Araç Modeli:</span>
                     <span>{quoteRequest.carModel?.name || '-'}</span>

                     {quoteRequest.quotedPrice && (
                        <>
                           <span className="text-muted-foreground">Fiyat:</span>
                           <span className="font-bold text-orange-600">
                              {quoteRequest.quotedPrice.toFixed(2)} TL
                           </span>
                        </>
                     )}

                     {quoteRequest.respondedAt && (
                        <>
                           <span className="text-muted-foreground">Yanıt Tarihi:</span>
                           <span>{format(quoteRequest.respondedAt, 'dd.MM.yyyy HH:mm')}</span>
                        </>
                     )}
                  </div>
               </div>

               <div className="rounded-lg border p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Parça Açıklaması</h3>
                  <p className="text-sm whitespace-pre-wrap">{quoteRequest.partDescription}</p>
               </div>

               {quoteRequest.adminNote && (
                  <div className="rounded-lg border p-4 space-y-2">
                     <h3 className="font-semibold text-sm">Admin Notu</h3>
                     <p className="text-sm whitespace-pre-wrap">{quoteRequest.adminNote}</p>
                  </div>
               )}

               {quoteRequest.imageUrl && (
                  <div className="rounded-lg border p-4 space-y-2">
                     <h3 className="font-semibold text-sm">Görsel</h3>
                     <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                           src={quoteRequest.imageUrl}
                           alt="Parça görseli"
                           className="w-full h-full object-contain"
                        />
                     </div>
                  </div>
               )}

               {quoteRequest.order && (
                  <div className="rounded-lg border p-4 space-y-2">
                     <h3 className="font-semibold text-sm">Bağlı Sipariş</h3>
                     <Link
                        href={`/orders/${quoteRequest.order.id}`}
                        className="text-sm text-blue-600 hover:underline"
                     >
                        Sipariş #{quoteRequest.order.number} — {quoteRequest.order.status}{' '}
                        {quoteRequest.order.isPaid ? '(Ödendi)' : '(Ödenmedi)'}
                     </Link>
                  </div>
               )}
            </div>

            {/* Sağ: Fiyat/Yanıt Formu */}
            <div>
               <QuoteResponseForm
                  quoteId={quoteRequest.id}
                  currentStatus={quoteRequest.status}
                  currentPrice={quoteRequest.quotedPrice}
                  currentNote={quoteRequest.adminNote}
               />
            </div>
         </div>
      </div>
   )
}
