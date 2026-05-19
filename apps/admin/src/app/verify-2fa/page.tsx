'use client'

import { adminPath } from '@/lib/base-path'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function Verify2FAPage() {
   const router = useRouter()
   const searchParams = useSearchParams()
   const [code, setCode] = useState('')
   const [error, setError] = useState('')
   const [loading, setLoading] = useState(false)

   async function onSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      setError('')
      setLoading(true)

      try {
         const response = await fetch(adminPath('/api/admin/verify-2fa'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
         })

         if (!response.ok) {
            setError('Kod doğrulanamadı.')
            return
         }

         const next = searchParams.get('next')
         router.replace(next && next.startsWith('/') && !next.startsWith('//') ? adminPath(next) : adminPath('/'))
         router.refresh()
      } catch {
         setError('Doğrulama sırasında hata oluştu.')
      } finally {
         setLoading(false)
      }
   }

   return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
         <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div>
               <h1 className="text-xl font-semibold">2FA Doğrulama</h1>
               <p className="mt-1 text-sm text-white/50">Hassas admin işlemi için 6 haneli kodu girin.</p>
            </div>
            <input
               value={code}
               onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
               inputMode="numeric"
               autoComplete="one-time-code"
               className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-orange-500/60"
               placeholder="000000"
               required
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
               type="submit"
               disabled={loading || code.length !== 6}
               className="h-11 w-full rounded-xl bg-orange-500 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
               {loading ? 'Kontrol ediliyor...' : 'Doğrula'}
            </button>
         </form>
      </main>
   )
}
