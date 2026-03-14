'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { useCsrf } from '@/hooks/useCsrf'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const statusLabels: Record<string, { label: string; color: string }> = {
   Pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
   Priced: { label: 'Fiyatlandırıldı', color: 'bg-blue-100 text-blue-800' },
   Accepted: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-800' },
   Rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
   Completed: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
}

export default function QuoteRequestDetailPage({
   params,
}: {
   params: { requestId: string }
}) {
   const { authenticated } = useAuthenticated()
   const csrfToken = useCsrf()
   const router = useRouter()
   const [data, setData] = useState<any>(null)
   const [addresses, setAddresses] = useState<any[]>([])
   const [selectedAddress, setSelectedAddress] = useState('')
   const [accepting, setAccepting] = useState(false)
   const [error, setError] = useState('')

   useEffect(() => {
      if (!authenticated) return

      fetch(`/api/quote-requests/${params.requestId}`)
         .then((r) => r.json())
         .then(setData)
         .catch(console.error)

      fetch('/api/addresses')
         .then((r) => r.json())
         .then((addrs) => {
            if (Array.isArray(addrs)) {
               setAddresses(addrs)
               if (addrs.length > 0) setSelectedAddress(addrs[0].id)
            }
         })
         .catch(console.error)
   }, [authenticated, params.requestId])

   async function handleAccept() {
      if (!selectedAddress) {
         setError('Lütfen bir adres seçin')
         return
      }

      setAccepting(true)
      setError('')

      try {
         const res = await fetch(`/api/quote-requests/${params.requestId}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(csrfToken && { 'x-csrf-token': csrfToken }) },
            body: JSON.stringify({ addressId: selectedAddress, csrfToken }),
         })

         if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'İşlem başarısız')
         }

         const { orderId } = await res.json()
         router.push(`/payment/${orderId}`)
      } catch (err: any) {
         setError(err.message || 'Bir hata oluştu')
      } finally {
         setAccepting(false)
      }
   }

   if (!data) {
      return (
         <div className="flex items-center justify-center h-[40vh]">
            <Loader />
         </div>
      )
   }

   const statusInfo = statusLabels[data.status] || {
      label: data.status,
      color: 'bg-gray-100 text-gray-800',
   }

   return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
         <div className="flex items-center gap-3">
            <Link
               href="/profile/quote-requests"
               className="text-sm text-muted-foreground hover:text-foreground"
            >
               Taleplerim
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold">Talep #{data.number}</span>
         </div>

         <Card>
            <CardContent className="py-6 space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Talep #{data.number}</h2>
                  <span
                     className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                  >
                     {statusInfo.label}
                  </span>
               </div>

               <div className="space-y-3 text-sm">
                  <div>
                     <span className="text-muted-foreground">Parça Açıklaması:</span>
                     <p className="mt-1 whitespace-pre-wrap">{data.partDescription}</p>
                  </div>

                  {(data.carBrand || data.carModel) && (
                     <div>
                        <span className="text-muted-foreground">Araç:</span>
                        <p className="mt-1">
                           {data.carBrand?.name || '-'}
                           {data.carModel ? ` / ${data.carModel.name}` : ''}
                        </p>
                     </div>
                  )}

                  {data.imageUrl && (
                     <div>
                        <span className="text-muted-foreground">Görsel:</span>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden mt-1 bg-muted">
                           <img
                              src={data.imageUrl}
                              alt="Parça görseli"
                              className="absolute inset-0 h-full w-full object-contain"
                              loading="lazy"
                           />
                        </div>
                     </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                     Oluşturulma: {new Date(data.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                     })}
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Fiyat Bilgisi + Satın Al */}
         {data.status === 'Priced' && data.quotedPrice && (
            <Card className="border-orange-500/30">
               <CardContent className="py-6 space-y-4">
                  <div className="text-center">
                     <p className="text-sm text-muted-foreground mb-1">Belirlenen Fiyat</p>
                     <p className="text-3xl font-bold text-orange-500">
                        {data.quotedPrice.toFixed(2)} <span className="text-lg">TL</span>
                     </p>
                  </div>

                  {data.adminNote && (
                     <div className="rounded-lg bg-muted p-3 text-sm">
                        <span className="font-medium">Not:</span> {data.adminNote}
                     </div>
                  )}

                  {/* Adres Seçimi */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium">Teslimat Adresi</label>
                     {addresses.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                           <Link
                              href="/profile/addresses"
                              className="text-orange-500 hover:underline"
                           >
                              Adres ekleyin
                           </Link>{' '}
                           ve bu sayfaya geri dönün.
                        </div>
                     ) : (
                        <select
                           value={selectedAddress}
                           onChange={(e) => setSelectedAddress(e.target.value)}
                           className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background"
                        >
                           {addresses.map((a) => (
                              <option key={a.id} value={a.id}>
                                 {a.city} — {a.address.slice(0, 50)}
                              </option>
                           ))}
                        </select>
                     )}
                  </div>

                  {error && (
                     <p className="text-sm text-red-600">{error}</p>
                  )}

                  <button
                     onClick={handleAccept}
                     disabled={accepting || addresses.length === 0}
                     className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {accepting ? 'İşleniyor...' : 'Fiyatı Kabul Et ve Satın Al'}
                  </button>
               </CardContent>
            </Card>
         )}

         {/* Rejected state */}
         {data.status === 'Rejected' && (
            <Card className="border-red-200">
               <CardContent className="py-6 text-center space-y-2">
                  <p className="text-sm font-medium text-red-700">
                     Bu talep karşılanamamaktadır.
                  </p>
                  {data.adminNote && (
                     <p className="text-sm text-muted-foreground">{data.adminNote}</p>
                  )}
                  <Link
                     href="/quote-request"
                     className="text-sm text-orange-500 hover:underline inline-block mt-2"
                  >
                     Yeni talep oluştur
                  </Link>
               </CardContent>
            </Card>
         )}

         {/* Order link */}
         {data.order && (
            <Card>
               <CardContent className="py-4">
                  <Link
                     href={`/profile/orders/${data.order.id}`}
                     className="text-sm text-blue-600 hover:underline"
                  >
                     Sipariş #{data.order.number} — {data.order.isPaid ? 'Ödendi' : 'Ödenmedi'}
                  </Link>
               </CardContent>
            </Card>
         )}
      </div>
   )
}
