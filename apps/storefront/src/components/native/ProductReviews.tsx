'use client'

import { useAuthenticated } from '@/hooks/useAuthentication'
import { useCsrf } from '@/hooks/useCsrf'
import { Camera, ImageIcon, Star, X, ZoomIn } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Review {
   id: string
   text: string
   rating: number
   images?: string[]
   createdAt: string
   user: { id: string; name: string | null }
}

// ─── Star Display ────────────────────────────────────────────────
function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
   return (
      <div className="flex items-center gap-0.5">
         {[1, 2, 3, 4, 5].map((i) => (
            <Star
               key={i}
               size={size}
               className={
                  i <= rating
                     ? 'fill-orange-500 text-orange-500'
                     : 'fill-neutral-300 text-neutral-300 dark:fill-neutral-600 dark:text-neutral-600'
               }
            />
         ))}
      </div>
   )
}

// ─── Relative Date ───────────────────────────────────────────────
function relativeDate(dateStr: string): string {
   const now = Date.now()
   const then = new Date(dateStr).getTime()
   const diff = now - then
   const mins = Math.floor(diff / 60_000)
   if (mins < 1) return 'Az önce'
   if (mins < 60) return `${mins} dakika önce`
   const hours = Math.floor(mins / 60)
   if (hours < 24) return `${hours} saat önce`
   const days = Math.floor(hours / 24)
   if (days < 30) return `${days} gün önce`
   const months = Math.floor(days / 30)
   if (months < 12) return `${months} ay önce`
   const years = Math.floor(months / 12)
   return `${years} yıl önce`
}

// ─── User Initials Avatar ────────────────────────────────────────
function UserAvatar({ name }: { name: string | null }) {
   const initials = name
      ? name
           .split(' ')
           .map((w) => w[0])
           .join('')
           .toUpperCase()
           .slice(0, 2)
      : '?'

   return (
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 font-semibold text-sm flex items-center justify-center">
         {initials}
      </div>
   )
}

// ─── Lightbox ────────────────────────────────────────────────────
function Lightbox({
   images,
   initialIndex,
   onClose,
}: {
   images: string[]
   initialIndex: number
   onClose: () => void
}) {
   const [currentIndex, setCurrentIndex] = useState(initialIndex)

   useEffect(() => {
      function handleKey(e: KeyboardEvent) {
         if (e.key === 'Escape') onClose()
         if (e.key === 'ArrowLeft') setCurrentIndex((p) => (p > 0 ? p - 1 : images.length - 1))
         if (e.key === 'ArrowRight') setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : 0))
      }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
   }, [images.length, onClose])

   return (
      <div
         className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
         onClick={onClose}
      >
         <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-neutral-300 transition-colors z-50"
         >
            <X size={28} />
         </button>
         <div
            className="relative max-w-3xl max-h-[80vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
         >
            {images.length > 1 && (
               <>
                  <button
                     onClick={() => setCurrentIndex((p) => (p > 0 ? p - 1 : images.length - 1))}
                     className="absolute left-2 z-10 bg-black/50 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                     &larr;
                  </button>
                  <button
                     onClick={() => setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : 0))}
                     className="absolute right-2 z-10 bg-black/50 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                     &rarr;
                  </button>
               </>
            )}
            <img
               src={images[currentIndex]}
               alt={`Değerlendirme görseli ${currentIndex + 1}`}
               className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
            {images.length > 1 && (
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
               </div>
            )}
         </div>
      </div>
   )
}

// ─── Review Images Display ───────────────────────────────────────
function ReviewImages({ images }: { images: string[] }) {
   const [lightboxOpen, setLightboxOpen] = useState(false)
   const [lightboxIndex, setLightboxIndex] = useState(0)

   if (!images || images.length === 0) return null

   return (
      <>
         <div className="flex items-center gap-2 flex-wrap">
            {images.map((img, idx) => (
               <button
                  key={idx}
                  onClick={() => {
                     setLightboxIndex(idx)
                     setLightboxOpen(true)
                  }}
                  className="relative h-16 w-16 rounded-lg overflow-hidden border hover:border-orange-500 transition-colors group"
               >
                  <img
                     src={img}
                     alt={`Değerlendirme görseli ${idx + 1}`}
                     className="absolute inset-0 h-full w-full object-cover"
                     loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                     <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
               </button>
            ))}
            {images.length > 1 && (
               <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon size={12} />
                  {images.length} foto
               </span>
            )}
         </div>
         {lightboxOpen && (
            <Lightbox
               images={images}
               initialIndex={lightboxIndex}
               onClose={() => setLightboxOpen(false)}
            />
         )}
      </>
   )
}

// ─── Review Form ─────────────────────────────────────────────────
function ReviewForm({
   productId,
   onSuccess,
}: {
   productId: string
   onSuccess: (review: Review) => void
}) {
   const { authenticated } = useAuthenticated()
   const csrfToken = useCsrf()
   const [rating, setRating] = useState(0)
   const [hoverRating, setHoverRating] = useState(0)
   const [text, setText] = useState('')
   const [submitting, setSubmitting] = useState(false)
   const [uploadedImages, setUploadedImages] = useState<string[]>([])
   const [uploading, setUploading] = useState(false)
   const [canReview, setCanReview] = useState<boolean | null>(null)
   const [canReviewReason, setCanReviewReason] = useState<string>('')
   const [checkingCanReview, setCheckingCanReview] = useState(true)

   useEffect(() => {
      if (!authenticated) {
         setCheckingCanReview(false)
         return
      }

      async function checkPurchase() {
         try {
            const res = await fetch(`/api/products/${productId}/reviews?canReview=true`)
            if (res.ok) {
               const data = await res.json()
               setCanReview(data.canReview)
               setCanReviewReason(data.reason || '')
            }
         } catch {
            // silently fail — show form anyway
            setCanReview(true)
         } finally {
            setCheckingCanReview(false)
         }
      }
      checkPurchase()
   }, [authenticated, productId])

   if (!authenticated) {
      return (
         <div className="rounded-xl border p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
               Değerlendirme yapmak için hesabınıza giriş yapın.
            </p>
            <Link
               href="/login"
               className="inline-block text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
               Giriş yapın
            </Link>
         </div>
      )
   }

   if (checkingCanReview) {
      return (
         <div className="rounded-xl border p-6 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
         </div>
      )
   }

   if (canReview === false) {
      if (canReviewReason === 'already_reviewed') {
         return (
            <div className="rounded-xl border p-6 text-center space-y-2">
               <p className="text-sm text-muted-foreground">
                  Bu ürünü zaten değerlendirdiniz.
               </p>
            </div>
         )
      }
      return (
         <div className="rounded-xl border p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
               Bu ürünü değerlendirebilmek için satın almış olmanız gerekiyor.
            </p>
         </div>
      )
   }

   async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const files = e.target.files
      if (!files || files.length === 0) return

      const remaining = 5 - uploadedImages.length
      if (remaining <= 0) {
         toast.error('En fazla 5 görsel eklenebilir')
         return
      }

      const filesToUpload = Array.from(files).slice(0, remaining)
      setUploading(true)

      try {
         for (const file of filesToUpload) {
            if (file.size > 5 * 1024 * 1024) {
               toast.error(`${file.name} 5MB limitini aşıyor`)
               continue
            }

            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/files', {
               method: 'POST',
               headers: {
                  ...(csrfToken && { 'x-csrf-token': csrfToken }),
               },
               body: formData,
            })

            if (!res.ok) {
               const err = await res.json().catch(() => ({ error: 'Yükleme başarısız' }))
               toast.error(err.error || 'Görsel yüklenemedi')
               continue
            }

            const data = await res.json()
            if (data.url) {
               setUploadedImages((prev) => [...prev, data.url])
            }
         }
      } catch {
         toast.error('Görsel yüklenirken bir hata oluştu')
      } finally {
         setUploading(false)
         // Reset file input
         e.target.value = ''
      }
   }

   function removeImage(index: number) {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index))
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (rating === 0) {
         toast.error('Lütfen bir puan seçin')
         return
      }
      if (!text.trim()) {
         toast.error('Lütfen bir değerlendirme yazın')
         return
      }

      setSubmitting(true)
      try {
         const res = await fetch(`/api/products/${productId}/reviews`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(csrfToken && { 'x-csrf-token': csrfToken }),
            },
            body: JSON.stringify({
               rating,
               text: text.trim(),
               images: uploadedImages,
               csrfToken,
            }),
         })

         if (!res.ok) {
            const errorText = await res.text()
            throw new Error(errorText || 'Bir hata oluştu')
         }

         const review: Review = await res.json()
         onSuccess(review)
         setRating(0)
         setText('')
         setUploadedImages([])
         toast.success('Değerlendirmeniz eklendi!')
      } catch (err: any) {
         toast.error(err?.message || 'Değerlendirme gönderilemedi')
      } finally {
         setSubmitting(false)
      }
   }

   return (
      <form onSubmit={handleSubmit} className="rounded-xl border p-6 space-y-4">
         <h3 className="text-base font-semibold">Değerlendirmenizi Yazın</h3>

         {/* Star Selector */}
         <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
               <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
               >
                  <Star
                     size={28}
                     className={
                        i <= (hoverRating || rating)
                           ? 'fill-orange-500 text-orange-500'
                           : 'fill-neutral-300 text-neutral-300 dark:fill-neutral-600 dark:text-neutral-600'
                     }
                  />
               </button>
            ))}
            {rating > 0 && (
               <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
               </span>
            )}
         </div>

         {/* Text Area */}
         <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
            rows={4}
            maxLength={1000}
            className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none transition-colors"
         />

         {/* Image Upload */}
         <div className="space-y-3">
            {/* Preview thumbnails */}
            {uploadedImages.length > 0 && (
               <div className="flex items-center gap-2 flex-wrap">
                  {uploadedImages.map((url, idx) => (
                     <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border group">
                        <img
                           src={url}
                           alt={`Yüklenen görsel ${idx + 1}`}
                           className="absolute inset-0 h-full w-full object-cover"
                        />
                        <button
                           type="button"
                           onClick={() => removeImage(idx)}
                           className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <X size={12} />
                        </button>
                     </div>
                  ))}
               </div>
            )}

            {/* Upload button */}
            {uploadedImages.length < 5 && (
               <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-dashed px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-orange-500 transition-colors">
                  {uploading ? (
                     <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                     <Camera size={16} />
                  )}
                  {uploading ? 'Yükleniyor...' : `Fotoğraf Ekle (${uploadedImages.length}/5)`}
                  <input
                     type="file"
                     accept="image/jpeg,image/png,image/webp,image/gif"
                     multiple
                     onChange={handleImageUpload}
                     disabled={uploading}
                     className="hidden"
                  />
               </label>
            )}
         </div>

         {/* Submit */}
         <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
            {submitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
         </button>
      </form>
   )
}

// ─── Main Component ──────────────────────────────────────────────
export default function ProductReviews({ productId }: { productId: string }) {
   const [reviews, setReviews] = useState<Review[]>([])
   const [loading, setLoading] = useState(true)

   const fetchReviews = useCallback(async () => {
      try {
         const res = await fetch(`/api/products/${productId}`)
         if (!res.ok) return
         const data = await res.json()
         setReviews(data.productReviews ?? [])
      } catch {
         // silently fail
      } finally {
         setLoading(false)
      }
   }, [productId])

   useEffect(() => {
      fetchReviews()
   }, [fetchReviews])

   const handleNewReview = (review: Review) => {
      setReviews((prev) => [review, ...prev])
   }

   const avgRating =
      reviews.length > 0
         ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
         : 0

   return (
      <section className="space-y-6">
         {/* Section Header */}
         <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
               Değerlendirmeler
            </h2>
            <p className="text-sm text-muted-foreground">
               Müşterilerimizin bu ürün hakkındaki görüşleri.
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column — Summary & Form */}
            <div className="space-y-6">
               {/* Summary Card */}
               {!loading && reviews.length > 0 && (
                  <div className="rounded-xl border p-6 space-y-3 text-center">
                     <div className="text-4xl font-bold">
                        {avgRating.toFixed(1)}
                     </div>
                     <Stars rating={Math.round(avgRating)} size={22} />
                     <p className="text-sm text-muted-foreground">
                        {reviews.length} değerlendirme
                     </p>
                  </div>
               )}

               {/* Review Form */}
               <ReviewForm productId={productId} onSuccess={handleNewReview} />
            </div>

            {/* Right Column — Review List */}
            <div className="lg:col-span-2 space-y-4">
               {loading ? (
                  <div className="rounded-xl border p-8 flex items-center justify-center">
                     <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  </div>
               ) : reviews.length === 0 ? (
                  <div className="rounded-xl border p-8 text-center space-y-2">
                     <div className="flex justify-center">
                        <Star
                           size={40}
                           className="text-neutral-300 dark:text-neutral-600"
                        />
                     </div>
                     <p className="text-base font-medium">
                        Henüz değerlendirme yapılmamış
                     </p>
                     <p className="text-sm text-muted-foreground">
                        Bu ürünü değerlendiren ilk kişi siz olun!
                     </p>
                  </div>
               ) : (
                  reviews.map((review) => (
                     <div
                        key={review.id}
                        className="rounded-xl border p-5 space-y-3 transition-colors hover:bg-muted/30"
                     >
                        <div className="flex items-start gap-3">
                           <UserAvatar name={review.user?.name} />
                           <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                 <span className="text-sm font-semibold truncate">
                                    {review.user?.name || 'Anonim'}
                                 </span>
                                 <span className="text-xs text-muted-foreground">
                                    {relativeDate(review.createdAt)}
                                 </span>
                              </div>
                              <Stars rating={review.rating} size={14} />
                           </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                           {review.text}
                        </p>
                        {/* Review Images */}
                        <ReviewImages images={review.images || []} />
                     </div>
                  ))
               )}
            </div>
         </div>
      </section>
   )
}
