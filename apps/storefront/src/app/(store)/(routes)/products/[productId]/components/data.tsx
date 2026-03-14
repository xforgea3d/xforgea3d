'use client'

import { useCsrf } from '@/hooks/useCsrf'
import { Separator } from '@/components/native/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
   calculateCustomPrice,
   parseCustomOptions,
   type ColorOption,
   type CustomSnapshot,
   type SizeOption,
} from '@/lib/customization'
import type { ProductWithIncludes } from '@/types/prisma'
import {
   AlertTriangleIcon,
   BoxIcon,
   CheckCircle2Icon,
   ChevronDownIcon,
   ChevronUpIcon,
   ClockIcon,
   Layers3Icon,
   LinkIcon,
   MessageCircleIcon,
   PackageCheckIcon,
   PaletteIcon,
   PaperclipIcon,
   Share2Icon,
   ShieldCheckIcon,
   SparklesIcon,
   TruckIcon,
   WrenchIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRef, useState } from 'react'

import CartButton from './cart_button'
import WishlistButton from './wishlist_button'

const STANDARD_PRODUCTION_DAYS = '2–3 iş günü'
const CUSTOM_PRODUCTION_DAYS = '5–7 iş günü'

export const DataSection = ({ product }: { product: ProductWithIncludes }) => {
   const csrfToken = useCsrf()
   const isCustomProduct = (product as any)?.productType === 'CUSTOM'
   const customOptions = parseCustomOptions((product as any)?.customOptions)

   const [isCustomized, setIsCustomized] = useState(false)
   const [openSection, setOpenSection] = useState<string | null>('uretim')

   // Custom selections
   const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
   const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null)
   const [customText, setCustomText] = useState('')
   const [fileUrl, setFileUrl] = useState<string | null>(null)
   const [uploading, setUploading] = useState(false)
   const fileRef = useRef<HTMLInputElement>(null)

   const basePrice = product?.price ?? 0
   const discount = product?.discount ?? 0
   const discountPct = discount > 0 ? ((discount / basePrice) * 100).toFixed(0) : null

   const finalPrice = calculateCustomPrice(
      basePrice,
      discount,
      isCustomized,
      customOptions,
      selectedColor,
      selectedSize
   )

   const productionTime = isCustomized ? CUSTOM_PRODUCTION_DAYS : STANDARD_PRODUCTION_DAYS

   async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return
      try {
         setUploading(true)
         const formData = new FormData()
         formData.append('file', file)
         const res = await fetch('/api/files', { method: 'POST', body: formData, headers: csrfToken ? { 'x-csrf-token': csrfToken } : {} })
         const json = await res.json()
         setFileUrl(json?.url ?? null)
      } catch {
         // silent fail — user can re-try
      } finally {
         setUploading(false)
      }
   }

   // Build snapshot for cart (passed via data attribute, cart button reads it)
   const snapshot: CustomSnapshot = {
      text: customText || undefined,
      color: selectedColor,
      size: selectedSize,
      fileUrl,
   }

   function toggleSection(key: string) {
      setOpenSection((prev) => (prev === key ? null : key))
   }

   return (
      <div className="col-span-2 w-full space-y-0 rounded-xl border bg-neutral-50 dark:bg-neutral-900 overflow-hidden">

         {/* ── Header ──────────────────────────────────── */}
         <div className="p-6 pb-4 space-y-3">
            <div className="flex flex-wrap gap-2">
               {isCustomProduct && (
                  <Badge className="bg-foreground text-background text-xs">
                     KİŞİYE ÖZEL
                  </Badge>
               )}
               {product.categories.map(({ title }, i) => (
                  <Link key={i} href={`/products?category=${title}`}>
                     <Badge variant="outline" className="text-xs">{title}</Badge>
                  </Link>
               ))}
               {product?.brand?.title && (
                  <Link href={`/products?brand=${product.brand.title}`}>
                     <Badge variant="secondary" className="text-xs">{product.brand.title}</Badge>
                  </Link>
               )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight leading-snug">
               {product.title}
            </h1>

            <div className="flex items-baseline gap-3">
               <span className="text-3xl font-extrabold tracking-tight">
                  {finalPrice.toFixed(2)} ₺
               </span>
               {discount > 0 && !isCustomized && (
                  <>
                     <span className="text-sm line-through text-muted-foreground">
                        {basePrice.toFixed(2)} ₺
                     </span>
                     <Badge variant="destructive" className="text-xs">
                        %{discountPct} İndirim
                     </Badge>
                  </>
               )}
               {isCustomized && customOptions && (
                  <span className="text-xs text-muted-foreground">
                     +{(
                        (customOptions.basePriceAddition ?? 0) +
                        (selectedColor?.price ?? 0) +
                        (selectedSize?.price ?? 0)
                     ).toFixed(2)} ₺ kişiselleştirme
                  </span>
               )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
               {product.description}
            </p>
         </div>

         <Separator />

         {/* ── Customization Section ───────────────────── */}
         {isCustomProduct && (
            <>
               <div className="px-6 py-4 space-y-4">
                  {/* Toggle */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <WrenchIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Kişiselleştirme</span>
                     </div>
                     <button
                        onClick={() => {
                           setIsCustomized((v) => !v)
                           if (isCustomized) {
                              setSelectedColor(null)
                              setSelectedSize(null)
                              setCustomText('')
                              setFileUrl(null)
                           }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isCustomized ? 'bg-foreground' : 'bg-neutral-300 dark:bg-neutral-600'
                           }`}
                        aria-pressed={isCustomized}
                     >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCustomized ? 'translate-x-6' : 'translate-x-1'
                           }`} />
                     </button>
                  </div>

                  {/* Options — shown when customization is on */}
                  {isCustomized && customOptions && (
                     <div className="space-y-5 rounded-lg border border-dashed p-4">

                        {/* Color selector */}
                        {customOptions.colors.length > 0 && (
                           <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Renk{selectedColor && (
                                    <span className="ml-2 normal-case font-normal">
                                       — {selectedColor.label}
                                       {selectedColor.price > 0 && ` (+${selectedColor.price} ₺)`}
                                    </span>
                                 )}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                 {customOptions.colors.map((c) => (
                                    <button
                                       key={c.hex}
                                       title={c.label}
                                       onClick={() => setSelectedColor(
                                          selectedColor?.hex === c.hex ? null : c
                                       )}
                                       className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor?.hex === c.hex
                                             ? 'ring-2 ring-offset-2 ring-foreground border-transparent scale-110'
                                             : 'border-neutral-300 dark:border-neutral-600'
                                          }`}
                                       style={{ backgroundColor: c.hex }}
                                    />
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Size selector */}
                        {customOptions.sizes.length > 0 && (
                           <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Boyut{selectedSize && (
                                    <span className="ml-2 normal-case font-normal">
                                       — {selectedSize.label}
                                       {selectedSize.price > 0 && ` (+${selectedSize.price} ₺)`}
                                    </span>
                                 )}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                 {customOptions.sizes.map((s) => (
                                    <button
                                       key={s.label}
                                       onClick={() => setSelectedSize(
                                          selectedSize?.label === s.label ? null : s
                                       )}
                                       className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-all ${selectedSize?.label === s.label
                                             ? 'bg-foreground text-background border-transparent'
                                             : 'border-neutral-300 dark:border-neutral-600 hover:border-foreground'
                                          }`}
                                    >
                                       {s.label}
                                       {s.price > 0 && <span className="ml-1 text-xs opacity-60">+{s.price}₺</span>}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Text input */}
                        {customOptions.maxTextLength > 0 && (
                           <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Özel Metin
                                 <span className="ml-2 normal-case font-normal text-muted-foreground">
                                    ({customText.length}/{customOptions.maxTextLength})
                                 </span>
                              </p>
                              <Input
                                 placeholder="Eklemek istediğiniz metni yazın..."
                                 maxLength={customOptions.maxTextLength}
                                 value={customText}
                                 onChange={(e) => setCustomText(e.target.value)}
                                 className="text-sm"
                              />
                           </div>
                        )}

                        {/* File upload */}
                        {customOptions.allowFileUpload && (
                           <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                 Tasarım Dosyası
                              </p>
                              <input
                                 ref={fileRef}
                                 type="file"
                                 accept=".jpg,.jpeg,.png,.svg,.pdf,.stl"
                                 className="hidden"
                                 onChange={handleFileUpload}
                              />
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="gap-2"
                                 disabled={uploading}
                                 onClick={() => fileRef.current?.click()}
                              >
                                 <PaperclipIcon className="h-4 w-4" />
                                 {uploading
                                    ? 'Yükleniyor...'
                                    : fileUrl
                                       ? 'Dosya Değiştir'
                                       : 'Dosya Seç'}
                              </Button>
                              {fileUrl && (
                                 <p className="text-xs text-muted-foreground truncate">
                                    ✓ {fileUrl.split('/').pop()}
                                 </p>
                              )}
                           </div>
                        )}

                        {/* No-return notice */}
                        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-destructive">
                           <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                           <span className="text-xs font-medium leading-relaxed">
                              Kişiye Özel Ürünlerde İade Yoktur. Bu sipariş yalnızca sizin için üretilecektir.
                           </span>
                        </div>
                     </div>
                  )}
               </div>
               <Separator />
            </>
         )}

         {/* ── Non-custom toggle (for READY products with customization option) */}
         {!isCustomProduct && (
            <>
               <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <WrenchIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Kişiselleştirme</span>
                        <Badge variant="outline" className="text-xs">Sipariş notunuzla</Badge>
                     </div>
                     <button
                        onClick={() => setIsCustomized((v) => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isCustomized ? 'bg-foreground' : 'bg-neutral-300 dark:bg-neutral-600'
                           }`}
                        aria-pressed={isCustomized}
                     >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCustomized ? 'translate-x-6' : 'translate-x-1'
                           }`} />
                     </button>
                  </div>
                  {isCustomized && (
                     <div className="mt-3 rounded-lg border border-dashed p-4 space-y-3">
                        <p className="text-xs text-muted-foreground">
                           Sipariş notunuzu ödeme sırasında iletebilirsiniz.
                        </p>
                        <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-destructive">
                           <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                           <span className="text-xs font-medium">
                              Kişiye Özel Ürünlerde İade Yoktur.
                           </span>
                        </div>
                     </div>
                  )}
               </div>
               <Separator />
            </>
         )}

         {/* ── Production Time & Shipping ─────────────── */}
         <div className="px-6 py-4 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-foreground/5 flex-shrink-0">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                     Üretim Süresi
                  </p>
                  <p className="text-sm font-semibold mt-0.5">{productionTime}</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-foreground/5 flex-shrink-0">
                  <TruckIcon className="h-4 w-4 text-muted-foreground" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                     Kargo
                  </p>
                  <p className="text-sm font-semibold mt-0.5">Ücretsiz Kargo</p>
                  <p className="text-xs text-muted-foreground">Türkiye geneli</p>
               </div>
            </div>
         </div>

         <Separator />

         {/* ── Add to Cart ──────────────────────────────── */}
         <div className="px-6 py-4 space-y-4">
            <div className="flex gap-2">
               <CartButton product={product} />
               <WishlistButton product={product} />
            </div>
            {/* Share row */}
            <div className="flex items-center gap-3">
               <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Share2Icon className="h-3.5 w-3.5" /> Paylaş
               </span>
               <div className="flex gap-1">
                  <button
                     onClick={() => {
                        const url = window.location.href
                        navigator.clipboard.writeText(url)
                        toast.success('Link kopyalandı!')
                     }}
                     className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                     title="Linki kopyala"
                  >
                     <LinkIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                     onClick={() => {
                        const url = window.location.href
                        const text = `${product.title} - ${url}`
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                     }}
                     className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                     title="WhatsApp ile paylaş"
                  >
                     <MessageCircleIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                     onClick={() => {
                        const url = window.location.href
                        const text = product.title
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                     }}
                     className="inline-flex items-center justify-center h-8 w-8 rounded-md border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                     title="X ile paylaş"
                  >
                     <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
               {[
                  { icon: <PackageCheckIcon className="h-4 w-4" />, label: 'Özenli Paketleme' },
                  { icon: <ShieldCheckIcon className="h-4 w-4" />, label: 'Hasarsız Teslimat' },
                  { icon: <CheckCircle2Icon className="h-4 w-4" />, label: 'Müşteri Memnuniyeti' },
               ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center">
                     <span className="text-muted-foreground">{icon}</span>
                     <span className="text-xs text-muted-foreground leading-tight">{label}</span>
                  </div>
               ))}
            </div>
         </div>

         <Separator />

         {/* ── Accordion Sections ───────────────────────── */}
         {[
            {
               key: 'uretim',
               icon: <Layers3Icon className="h-4 w-4 text-muted-foreground" />,
               title: 'Üretim Kalitesi',
               content: (
                  <div className="space-y-0 text-sm divide-y">
                     {[
                        ['Katman Hassasiyeti', '0.1 – 0.2 mm'],
                        ['Malzeme Tipi', 'Premium PLA / Reçine'],
                        ['Yüzey Kalitesi', 'Pürüzsüz / Boyamaya Hazır'],
                     ].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-2.5">
                           <span className="text-muted-foreground">{k}</span>
                           <span className="font-medium">{v}</span>
                        </div>
                     ))}
                  </div>
               ),
            },
            {
               key: 'malzeme',
               icon: <SparklesIcon className="h-4 w-4 text-muted-foreground" />,
               title: 'Malzeme & Bakım',
               content: (
                  <div className="space-y-2.5 text-sm text-muted-foreground">
                     <p><span className="font-semibold text-foreground">Malzeme: </span>
                        Endüstriyel sınıf, çevre dostu PLA filament veya yüksek detay reçine.
                     </p>
                     <ul className="space-y-1.5 pl-4 list-disc">
                        <li>Direkt güneş ışığından koruyun.</li>
                        <li>Nemli, yumuşak bir bezle temizleyin.</li>
                        <li>60°C üzerindeki ortamlara maruz bırakmayın.</li>
                        <li>Sert yüzeylere düşürmekten kaçının.</li>
                     </ul>
                  </div>
               ),
            },
            {
               key: 'kargo',
               icon: <BoxIcon className="h-4 w-4 text-muted-foreground" />,
               title: 'Kargo & Teslimat',
               content: (
                  <div className="divide-y text-sm">
                     {[
                        ['Kargo Ücreti', 'Ücretsiz'],
                        ['Teslimat Süresi', '1–3 iş günü'],
                        ['Kargo Firması', 'Yurtiçi Kargo'],
                        ['Teslimat Bölgesi', 'Türkiye\'nin 81 İli'],
                     ].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center py-2.5">
                           <span className="text-muted-foreground">{k}</span>
                           <span className="font-medium text-foreground">{v}</span>
                        </div>
                     ))}
                  </div>
               ),
            },
            {
               key: 'iade',
               icon: <PaletteIcon className="h-4 w-4 text-muted-foreground" />,
               title: 'İade & Değişim',
               content: (
                  <div className="space-y-2.5 text-sm text-muted-foreground">
                     <p>Standart ürünlerde teslimattan itibaren <span className="font-semibold text-foreground">14 gün</span> içinde iade.</p>
                     <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-destructive text-xs">
                        <AlertTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Kişiye özel üretilen ürünlerde iade ve değişim yapılamamaktadır.</span>
                     </div>
                  </div>
               ),
            },
         ].map(({ key, icon, title, content }) => (
            <div key={key}>
               <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between gap-3 px-6 py-4 hover:bg-muted/40 transition-colors text-left"
               >
                  <div className="flex items-center gap-2.5">
                     {icon}
                     <span className="text-sm font-medium">{title}</span>
                  </div>
                  {openSection === key
                     ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                     : <ChevronDownIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  }
               </button>
               {openSection === key && <div className="px-6 pb-4">{content}</div>}
               <Separator />
            </div>
         ))}
      </div>
   )
}
