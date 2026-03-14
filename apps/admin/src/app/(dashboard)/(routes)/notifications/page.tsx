'use client'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Bell, Loader2, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface User {
   id: string
   email: string
   name: string | null
}

interface DiscountCode {
   id: string
   code: string
   percent: number
}

const templates = [
   'Hoş geldiniz! xForgea3D\'ye katıldığınız için teşekkürler.',
   'Siparişiniz hazırlanıyor, yakında kargoya verilecek!',
   'Yeni ürünlerimizi keşfetmeyi unutmayın!',
   'Size özel indirim fırsatı! Kaçırmayın.',
]

export default function NotificationsPage() {
   const [users, setUsers] = useState<User[]>([])
   const [coupons, setCoupons] = useState<DiscountCode[]>([])
   const [loading, setLoading] = useState(false)

   const [target, setTarget] = useState<'all' | string>('all')
   const [message, setMessage] = useState('')
   const [notifType, setNotifType] = useState<'popup' | 'notification' | 'modal'>('notification')
   const [selectedCoupon, setSelectedCoupon] = useState('')

   useEffect(() => {
      fetch('/api/users')
         .then(r => {
            if (!r.ok) throw new Error()
            return r.json()
         })
         .then(setUsers)
         .catch(() => {})

      fetch('/api/discount-codes')
         .then(r => {
            if (!r.ok) throw new Error()
            return r.json()
         })
         .then((data: any[]) => {
            setCoupons(data.map(d => ({ id: d.id, code: d.code, percent: d.percent })))
         })
         .catch(() => {})
   }, [])

   const finalMessage = selectedCoupon
      ? (() => {
           const coupon = coupons.find(c => c.id === selectedCoupon)
           if (!coupon) return message
           return `${message}\n\nKupon kodunuz: ${coupon.code} - %${coupon.percent} indirim!`
        })()
      : message

   const handleSubmit = async () => {
      if (!message.trim()) {
         toast.error('Mesaj boş olamaz.')
         return
      }

      setLoading(true)
      try {
         const body: any = {
            content: finalMessage,
            type: notifType,
         }

         if (target === 'all') {
            body.userIds = users.map(u => u.id)
         } else {
            body.userId = target
         }

         if (body.userIds?.length === 0 && !body.userId) {
            toast.error('Hedef kullanıcı bulunamadı.')
            setLoading(false)
            return
         }

         const res = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         })

         if (!res.ok) throw new Error(await res.text())

         const result = await res.json()
         toast.success(`Bildirim ${result.count} kullanıcıya gönderildi!`)
         setMessage('')
         setSelectedCoupon('')
      } catch (error: any) {
         toast.error('Bildirim gönderilemedi: ' + (error?.message || ''))
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="my-6 block space-y-6">
         <div className="flex items-center gap-3">
            <Heading
               title="Bildirim Gönder"
               description="Kullanıcılara bildirim, popup veya modal mesajı gönderin."
            />
         </div>
         <Separator />

         <div className="max-w-2xl space-y-6">
            {/* Target */}
            <div className="space-y-2">
               <label className="text-sm font-medium">Hedef</label>
               <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
               >
                  <option value="all">Tüm Kullanıcılar ({users.length})</option>
                  {users.map(u => (
                     <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.email})
                     </option>
                  ))}
               </select>
            </div>

            {/* Notification Type */}
            <div className="space-y-2">
               <label className="text-sm font-medium">Bildirim Türü</label>
               <div className="grid grid-cols-3 gap-3">
                  <button
                     type="button"
                     onClick={() => setNotifType('notification')}
                     className={`rounded-lg border-2 p-4 text-left transition-all ${
                        notifType === 'notification'
                           ? 'border-primary bg-primary/5'
                           : 'border-muted hover:border-muted-foreground/30'
                     }`}
                     disabled={loading}
                  >
                     <div className="flex items-center gap-2 mb-1">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium text-sm">Bildirim</span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Kullanıcının bildirim kutusuna gider
                     </p>
                  </button>
                  <button
                     type="button"
                     onClick={() => setNotifType('popup')}
                     className={`rounded-lg border-2 p-4 text-left transition-all ${
                        notifType === 'popup'
                           ? 'border-primary bg-primary/5'
                           : 'border-muted hover:border-muted-foreground/30'
                     }`}
                     disabled={loading}
                  >
                     <div className="flex items-center gap-2 mb-1">
                        <Send className="h-4 w-4" />
                        <span className="font-medium text-sm">Popup</span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Kullanıcının ekranında toast olarak görünür
                     </p>
                  </button>
                  <button
                     type="button"
                     onClick={() => setNotifType('modal')}
                     className={`rounded-lg border-2 p-4 text-left transition-all ${
                        notifType === 'modal'
                           ? 'border-primary bg-primary/5'
                           : 'border-muted hover:border-muted-foreground/30'
                     }`}
                     disabled={loading}
                  >
                     <div className="flex items-center gap-2 mb-1">
                        <Bell className="h-4 w-4" />
                        <span className="font-medium text-sm">Modal</span>
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Ekran ortasında, kullanıcı kapatana kadar kalır
                     </p>
                  </button>
               </div>
            </div>

            {/* Templates */}
            <div className="space-y-2">
               <label className="text-sm font-medium">Hazır Şablonlar</label>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map((tpl, i) => (
                     <button
                        key={i}
                        type="button"
                        onClick={() => setMessage(tpl)}
                        className="text-left rounded-md border px-3 py-2 text-xs hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        disabled={loading}
                     >
                        {tpl}
                     </button>
                  ))}
               </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
               <label className="text-sm font-medium">Mesaj</label>
               <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bildirim mesajınızı yazın..."
                  rows={4}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  disabled={loading}
               />
            </div>

            {/* Coupon attachment */}
            <div className="space-y-2">
               <label className="text-sm font-medium">Kupon Kodu Ekle (Opsiyonel)</label>
               <select
                  value={selectedCoupon}
                  onChange={(e) => setSelectedCoupon(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
               >
                  <option value="">Kupon ekleme</option>
                  {coupons.map(c => (
                     <option key={c.id} value={c.id}>
                        {c.code} - %{c.percent} indirim
                     </option>
                  ))}
               </select>
            </div>

            {/* Preview */}
            {message.trim() && (
               <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Önizleme</label>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                     {finalMessage}
                  </div>
               </div>
            )}

            {/* Submit */}
            <Button
               onClick={handleSubmit}
               disabled={loading || !message.trim()}
               className="w-full"
               size="lg"
            >
               {loading ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Gönderiliyor...
                  </>
               ) : (
                  <>
                     <Send className="mr-2 h-4 w-4" />
                     Bildirim Gönder
                  </>
               )}
            </Button>
         </div>
      </div>
   )
}
