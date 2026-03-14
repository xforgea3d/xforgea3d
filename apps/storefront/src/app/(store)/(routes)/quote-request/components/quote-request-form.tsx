'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BrandOption {
   id: string
   name: string
   models: { id: string; name: string }[]
}

export function QuoteRequestForm({ brands }: { brands: BrandOption[] }) {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [success, setSuccess] = useState(false)
   const [error, setError] = useState('')

   const [selectedBrandId, setSelectedBrandId] = useState('')
   const [selectedModelId, setSelectedModelId] = useState('')
   const [email, setEmail] = useState('')
   const [name, setName] = useState('')
   const [phone, setPhone] = useState('')
   const [partDescription, setPartDescription] = useState('')
   const [image, setImage] = useState<File | null>(null)

   const selectedBrand = brands.find((b) => b.id === selectedBrandId)
   const models = selectedBrand?.models || []

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setError('')

      if (!email || !partDescription) {
         setError('E-posta ve parça açıklaması zorunludur.')
         return
      }

      setLoading(true)

      try {
         const formData = new FormData()

         const data = {
            email,
            name: name || null,
            phone: phone || null,
            carBrandId: selectedBrandId || null,
            carModelId: selectedModelId || null,
            partDescription,
         }

         formData.append('data', JSON.stringify(data))

         if (image) {
            formData.append('image', image)
         }

         const res = await fetch('/api/quote-requests', {
            method: 'POST',
            body: formData,
         })

         if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Talep gönderilemedi')
         }

         setSuccess(true)
      } catch (err: any) {
         setError(err.message || 'Bir hata oluştu')
      } finally {
         setLoading(false)
      }
   }

   if (success) {
      return (
         <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
               <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h2 className="text-xl font-bold">Talebiniz Alındı!</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
               Parça talebiniz başarıyla gönderildi. En kısa sürede e-posta
               adresinize fiyat bilgisi ile dönüş yapacağız.
            </p>
            <div className="flex items-center justify-center gap-4">
               <button
                  onClick={() => {
                     setSuccess(false)
                     setPartDescription('')
                     setImage(null)
                  }}
                  className="text-sm text-orange-500 hover:underline"
               >
                  Yeni talep oluştur
               </button>
               <Link href="/profile/quote-requests">
                  <Button
                     variant="outline"
                     className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                  >
                     Taleplerime Git
                  </Button>
               </Link>
            </div>
         </div>
      )
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-5">
         {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
               {error}
            </div>
         )}

         {/* E-posta */}
         <div className="space-y-1.5">
            <label className="text-sm font-medium">
               E-posta <span className="text-red-500">*</span>
            </label>
            <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
               placeholder="ornek@email.com"
               className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            />
         </div>

         {/* Ad & Telefon */}
         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
               <label className="text-sm font-medium">Ad Soyad</label>
               <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-sm font-medium">Telefon</label>
               <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
               />
            </div>
         </div>

         {/* Araç Markası & Model */}
         <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
               <label className="text-sm font-medium">Araç Markası</label>
               <select
                  value={selectedBrandId}
                  onChange={(e) => {
                     setSelectedBrandId(e.target.value)
                     setSelectedModelId('')
                  }}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-background"
               >
                  <option value="">Marka seçin</option>
                  {brands.map((b) => (
                     <option key={b.id} value={b.id}>
                        {b.name}
                     </option>
                  ))}
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-sm font-medium">Araç Modeli</label>
               <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  disabled={!selectedBrandId}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-background disabled:opacity-50"
               >
                  <option value="">Model seçin</option>
                  {models.map((m) => (
                     <option key={m.id} value={m.id}>
                        {m.name}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Parça Açıklaması */}
         <div className="space-y-1.5">
            <label className="text-sm font-medium">
               Parça Açıklaması <span className="text-red-500">*</span>
            </label>
            <textarea
               value={partDescription}
               onChange={(e) => setPartDescription(e.target.value)}
               required
               rows={4}
               placeholder="Hangi parçaya ihtiyacınız var? Mümkün olduğunca detaylı açıklayın... (OEM numarası, konum, hasar durumu vb.)"
               className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none"
            />
         </div>

         {/* Görsel Yükleme */}
         <div className="space-y-1.5">
            <label className="text-sm font-medium">Parça Görseli (opsiyonel)</label>
            <input
               type="file"
               accept="image/*"
               onChange={(e) => setImage(e.target.files?.[0] || null)}
               className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
            />
            {image && (
               <p className="text-xs text-muted-foreground">
                  Seçilen dosya: {image.name}
               </p>
            )}
         </div>

         {/* Gönder */}
         <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {loading ? 'Gönderiliyor...' : 'Talep Gönder'}
         </button>

         <p className="text-xs text-muted-foreground text-center">
            Talebinizi gönderdikten sonra e-posta adresinize fiyat bilgisi ile dönüş yapacağız.
         </p>
      </form>
   )
}
