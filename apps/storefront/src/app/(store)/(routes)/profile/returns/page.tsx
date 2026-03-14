'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const returnStatusMap: Record<string, { label: string; color: string }> = {
   Pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
   Approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-800 border-green-200' },
   ReturnShipping: { label: 'Kargo Bekleniyor', color: 'bg-purple-100 text-purple-800 border-purple-200' },
   Received: { label: 'Teslim Alındı', color: 'bg-blue-100 text-blue-800 border-blue-200' },
   Refunded: { label: 'İade Tamamlandı', color: 'bg-gray-100 text-gray-800 border-gray-200' },
   Rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-800 border-red-200' },
}

export default function ReturnsPage() {
   const [returns, setReturns] = useState<any[] | null>(null)
   const [error, setError] = useState(false)

   const fetchReturns = useCallback(async () => {
      setError(false)
      try {
         const res = await fetch('/api/returns')
         if (!res.ok) throw new Error('Failed to fetch returns')
         const data = await res.json()
         setReturns(data)
      } catch (err) {
         console.error(err)
         setError(true)
         toast.error('İade talepleri yüklenirken bir hata oluştu.')
      }
   }, [])

   useEffect(() => {
      fetchReturns()
   }, [fetchReturns])

   if (error) {
      return (
         <Card className="bg-muted-foreground/5">
            <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
               <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
               <p className="text-muted-foreground">Bir hata oluştu</p>
               <Button variant="outline" onClick={fetchReturns}>
                  Tekrar Dene
               </Button>
            </CardContent>
         </Card>
      )
   }

   if (returns === null) {
      return (
         <Card className="my-4 bg-muted-foreground/5">
            <CardContent>
               <div className="h-[20vh] flex items-center justify-center">
                  <Loader />
               </div>
            </CardContent>
         </Card>
      )
   }

   if (returns.length === 0) {
      return (
         <Card className="my-4 bg-muted-foreground/5">
            <CardContent className="py-12 text-center">
               <RotateCcw className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
               <p className="text-muted-foreground text-sm">
                  Henüz iade talebiniz bulunmuyor.
               </p>
            </CardContent>
         </Card>
      )
   }

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-3 my-4">
            {returns.map((r) => {
               const statusInfo = returnStatusMap[r.status] || {
                  label: r.status,
                  color: 'bg-gray-100 text-gray-800 border-gray-200',
               }
               return (
                  <Link
                     key={r.id}
                     href={`/profile/orders/${r.orderId}`}
                     className="block"
                  >
                     <Card className="hover:border-orange-500/30 transition-colors">
                        <CardContent className="py-4">
                           <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                    <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm font-semibold">
                                       İade #{r.number}
                                    </span>
                                    <Badge className={`${statusInfo.color} text-[10px] font-medium border`}>
                                       {statusInfo.label}
                                    </Badge>
                                 </div>
                                 <p className="text-xs text-muted-foreground">
                                    Sipariş #{r.order?.number} - {r.reason}
                                 </p>
                                 <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                                    <span>
                                       {new Date(r.createdAt).toLocaleDateString('tr-TR', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                       })}
                                    </span>
                                    {r.returnTrackingNumber && (
                                       <span>Kargo: {r.returnTrackingNumber}</span>
                                    )}
                                 </div>
                              </div>
                              {r.refundAmount && (
                                 <div className="text-right flex-shrink-0">
                                    <span className="text-lg font-bold text-orange-500">
                                       {r.refundAmount.toFixed(2)}
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
      </div>
   )
}
