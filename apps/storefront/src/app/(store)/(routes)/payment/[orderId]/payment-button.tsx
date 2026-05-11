'use client'

import { useState } from 'react'

export function PaymentButton({
   orderId,
   amount,
   isTest = false,
}: {
   orderId: string
   amount: number
   isTest?: boolean
}) {
   const [loading, setLoading] = useState(false)

   async function handlePayment() {
      setLoading(true)
      try {
         const csrfRes = await fetch('/api/csrf')
         const { token: csrfToken } = await csrfRes.json()

         const res = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(csrfToken && { 'x-csrf-token': csrfToken }) },
            body: JSON.stringify({ orderId, csrfToken }),
         })

         if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            alert(data.error || 'Ödeme başlatılamadı')
            setLoading(false)
            return
         }

         const data = await res.json()
         if (data.paymentUrl) {
            window.location.href = data.paymentUrl
         }
      } catch {
         alert('Bir hata oluştu')
         setLoading(false)
      }
   }

   return (
      <button
         onClick={handlePayment}
         disabled={loading}
         className={`w-full py-3 px-6 rounded-lg font-medium text-center transition-opacity hover:opacity-90 disabled:opacity-50 ${
            isTest
               ? 'bg-amber-500 text-white'
               : 'bg-foreground text-background'
         }`}
      >
         {loading
            ? 'İşleniyor...'
            : isTest
               ? `Test Ödemesi Yap (${amount.toFixed(2)} TL)`
               : `${amount.toFixed(2)} TL Öde`}
      </button>
   )
}
