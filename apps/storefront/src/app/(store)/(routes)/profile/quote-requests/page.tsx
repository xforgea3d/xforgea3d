'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const statusLabels: Record<string, { label: string; color: string }> = {
   Pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
   Priced: { label: 'Fiyatlandırıldı', color: 'bg-blue-100 text-blue-800' },
   Accepted: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-800' },
   Rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
   Completed: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-800' },
}

export default function QuoteRequestsPage() {
   const [requests, setRequests] = useState<any[] | null>(null)

   useEffect(() => {
      async function fetchRequests() {
         try {
            const res = await fetch('/api/quote-requests')
            const json = await res.json()
            setRequests(json)
         } catch (error) {
            console.error(error)
            toast.error('Talepler yüklenirken bir hata oluştu.')
            setRequests([])
         }
      }

      fetchRequests()
   }, [])

   return (
      <div className="flex-col">
         <div className="flex-1">
            {requests === null ? (
               <Card className="my-4 bg-muted-foreground/5">
                  <CardContent>
                     <div className="h-[20vh] flex items-center justify-center">
                        <Loader />
                     </div>
                  </CardContent>
               </Card>
            ) : requests.length === 0 ? (
               <Card className="my-4 bg-muted-foreground/5">
                  <CardContent className="py-12 text-center">
                     <p className="text-muted-foreground text-sm mb-3">
                        Henüz parça talebiniz bulunmuyor.
                     </p>
                     <Link
                        href="/quote-request"
                        className="text-sm text-orange-500 hover:underline"
                     >
                        Parça Talep Et
                     </Link>
                  </CardContent>
               </Card>
            ) : (
               <div className="space-y-3 my-4">
                  {requests.map((r) => {
                     const statusInfo = statusLabels[r.status] || {
                        label: r.status,
                        color: 'bg-gray-100 text-gray-800',
                     }
                     return (
                        <Link
                           key={r.id}
                           href={`/profile/quote-requests/${r.id}`}
                           className="block"
                        >
                           <Card className="hover:border-orange-500/30 transition-colors">
                              <CardContent className="py-4">
                                 <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-semibold">
                                             Talep #{r.number}
                                          </span>
                                          <span
                                             className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.color}`}
                                          >
                                             {statusInfo.label}
                                          </span>
                                       </div>
                                       <p className="text-xs text-muted-foreground truncate">
                                          {r.partDescription}
                                       </p>
                                       <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                                          {r.carBrand && (
                                             <span>
                                                {r.carBrand.name}
                                                {r.carModel ? ` / ${r.carModel.name}` : ''}
                                             </span>
                                          )}
                                          <span>
                                             {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                                          </span>
                                       </div>
                                    </div>
                                    {r.quotedPrice && (
                                       <div className="text-right flex-shrink-0">
                                          <span className="text-lg font-bold text-orange-500">
                                             {r.quotedPrice.toFixed(2)}
                                          </span>
                                          <span className="text-xs text-muted-foreground ml-1">
                                             TL
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              </CardContent>
                           </Card>
                        </Link>
                     )
                  })}
               </div>
            )}
         </div>
      </div>
   )
}
