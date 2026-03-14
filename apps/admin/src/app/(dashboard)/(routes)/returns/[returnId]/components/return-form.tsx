'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const statusOptions = [
   { value: 'Pending', label: 'Beklemede' },
   { value: 'Approved', label: 'Onaylandi' },
   { value: 'ReturnShipping', label: 'Kargo Bekleniyor' },
   { value: 'Received', label: 'Teslim Alindi' },
   { value: 'Refunded', label: 'Iade Tamamlandi' },
   { value: 'Rejected', label: 'Reddedildi' },
]

interface ReturnFormProps {
   returnId: string
   currentStatus: string
   currentAdminNote: string | null
   currentTrackingNumber: string | null
   currentRefundAmount: number | null
   orderPayable: number
}

export function ReturnForm({
   returnId,
   currentStatus,
   currentAdminNote,
   currentTrackingNumber,
   currentRefundAmount,
   orderPayable,
}: ReturnFormProps) {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [status, setStatus] = useState(currentStatus)
   const [adminNote, setAdminNote] = useState(currentAdminNote || '')
   const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '')
   const [refundAmount, setRefundAmount] = useState(currentRefundAmount?.toString() || '')

   const refundAmountNum = refundAmount ? parseFloat(refundAmount) : 0
   const refundExceedsOrder = refundAmountNum > orderPayable

   async function handleSubmit() {
      if (refundExceedsOrder) {
         toast.error(`Iade tutari siparis tutarini (${orderPayable.toFixed(2)} TL) asamaz`)
         return
      }
      setLoading(true)
      try {
         const res = await fetch(`/api/returns/${returnId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               status,
               adminNote: adminNote || null,
               returnTrackingNumber: trackingNumber || null,
               refundAmount: refundAmount ? parseFloat(refundAmount) : null,
            }),
         })

         if (!res.ok) throw new Error('Guncelleme basarisiz')

         toast.success('Iade talebi guncellendi')
         window.location.reload()
      } catch (error) {
         toast.error('Bir hata olustu')
         console.error(error)
      } finally {
         setLoading(false)
      }
   }

   async function quickAction(newStatus: string) {
      setStatus(newStatus)
      setLoading(true)
      try {
         const res = await fetch(`/api/returns/${returnId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               status: newStatus,
               adminNote: adminNote || null,
               returnTrackingNumber: trackingNumber || null,
               refundAmount: refundAmount ? parseFloat(refundAmount) : null,
            }),
         })

         if (!res.ok) throw new Error('Guncelleme basarisiz')

         toast.success('Durum guncellendi')
         router.refresh()
         window.location.href = '/returns'
      } catch (error) {
         toast.error('Bir hata olustu')
         console.error(error)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="space-y-4">
         <div className="rounded-lg border p-4 space-y-4">
            <h3 className="font-semibold text-sm">Iade Islemleri</h3>

            <div className="space-y-2">
               <label className="text-sm font-medium">Durum</label>
               <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
               >
                  {statusOptions.map((opt) => (
                     <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium">Admin Notu</label>
               <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Musteriye iletilecek not..."
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  disabled={loading}
               />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium">Iade Kargo Takip No</label>
               <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Musterinin gonderecegi kargo takip numarasi"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
               />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium">
                  Iade Tutari (TL)
                  <span className="text-muted-foreground font-normal ml-1">
                     (Siparis tutari: {orderPayable.toFixed(2)} TL)
                  </span>
               </label>
               <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={orderPayable}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Orn: 250.00"
                  className={`w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${refundExceedsOrder ? 'border-red-500' : ''}`}
                  disabled={loading}
               />
               {refundExceedsOrder && (
                  <p className="text-sm text-red-500">
                     Iade tutari siparis tutarini ({orderPayable.toFixed(2)} TL) asamaz
                  </p>
               )}
            </div>

            <Button
               onClick={handleSubmit}
               disabled={loading}
               className="w-full"
            >
               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
         </div>

         {/* Quick action buttons */}
         <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Hizli Islemler</h3>
            <div className="grid grid-cols-2 gap-2">
               {currentStatus === 'Pending' && (
                  <>
                     <Button
                        onClick={() => quickAction('Approved')}
                        disabled={loading}
                        variant="default"
                        size="sm"
                     >
                        Onayla
                     </Button>
                     <Button
                        onClick={() => quickAction('Rejected')}
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                     >
                        Reddet
                     </Button>
                  </>
               )}
               {currentStatus === 'Approved' && (
                  <Button
                     onClick={() => quickAction('ReturnShipping')}
                     disabled={loading}
                     variant="default"
                     size="sm"
                     className="col-span-2"
                  >
                     Kargo Bekliyor Olarak Isaretle
                  </Button>
               )}
               {currentStatus === 'ReturnShipping' && (
                  <Button
                     onClick={() => quickAction('Received')}
                     disabled={loading}
                     variant="default"
                     size="sm"
                     className="col-span-2"
                  >
                     Teslim Alindi Olarak Isaretle
                  </Button>
               )}
               {currentStatus === 'Received' && (
                  <Button
                     onClick={() => quickAction('Refunded')}
                     disabled={loading}
                     variant="default"
                     size="sm"
                     className="col-span-2"
                  >
                     Iade Tamamlandi Olarak Isaretle
                  </Button>
               )}
            </div>
         </div>
      </div>
   )
}
