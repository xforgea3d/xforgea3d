'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface QuoteResponseFormProps {
   quoteId: string
   currentStatus: string
   currentPrice: number | null
   currentNote: string | null
}

export function QuoteResponseForm({
   quoteId,
   currentStatus,
   currentPrice,
   currentNote,
}: QuoteResponseFormProps) {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [price, setPrice] = useState(currentPrice?.toString() || '')
   const [note, setNote] = useState(currentNote || '')

   const isEditable = currentStatus === 'Pending' || currentStatus === 'Priced'

   async function handleSubmit(newStatus: 'Priced' | 'Rejected') {
      if (newStatus === 'Priced' && (!price || parseFloat(price) <= 0)) {
         toast.error('Geçerli bir fiyat girin')
         return
      }

      setLoading(true)
      try {
         const res = await fetch(`/api/quote-requests/${quoteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               status: newStatus,
               quotedPrice: newStatus === 'Priced' ? parseFloat(price) : null,
               adminNote: note || null,
            }),
         })

         if (!res.ok) throw new Error('Güncelleme başarısız')

         toast.success(
            newStatus === 'Priced'
               ? 'Fiyat bildirildi, e-posta gönderildi'
               : 'Talep reddedildi, e-posta gönderildi'
         )
         router.refresh()
      } catch (error) {
         toast.error('Bir hata oluştu')
         console.error(error)
      } finally {
         setLoading(false)
      }
   }

   if (!isEditable) {
      return (
         <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-sm">Yanıt</h3>
            <p className="text-sm text-muted-foreground">
               Bu talep zaten yanıtlanmış ({currentStatus}).
            </p>
            {currentPrice && (
               <p className="text-sm">
                  Fiyat: <span className="font-bold">{currentPrice.toFixed(2)} TL</span>
               </p>
            )}
            {currentNote && (
               <p className="text-sm">Not: {currentNote}</p>
            )}
         </div>
      )
   }

   return (
      <div className="rounded-lg border p-4 space-y-4">
         <h3 className="font-semibold text-sm">Fiyat Belirle / Yanıtla</h3>

         <div className="space-y-2">
            <label className="text-sm font-medium">Fiyat (TL)</label>
            <input
               type="number"
               step="0.01"
               min="0"
               value={price}
               onChange={(e) => setPrice(e.target.value)}
               placeholder="Örn: 250.00"
               className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
               disabled={loading}
            />
         </div>

         <div className="space-y-2">
            <label className="text-sm font-medium">Not (opsiyonel)</label>
            <textarea
               value={note}
               onChange={(e) => setNote(e.target.value)}
               placeholder="Müşteriye iletilecek ek bilgi..."
               rows={3}
               className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
               disabled={loading}
            />
         </div>

         <div className="flex gap-2">
            <Button
               onClick={() => handleSubmit('Priced')}
               disabled={loading}
               className="flex-1"
            >
               {loading ? 'Gönderiliyor...' : 'Fiyat Bildir'}
            </Button>
            <Button
               onClick={() => handleSubmit('Rejected')}
               disabled={loading}
               variant="destructive"
               className="flex-1"
            >
               {loading ? 'Gönderiliyor...' : 'Reddet'}
            </Button>
         </div>
      </div>
   )
}
