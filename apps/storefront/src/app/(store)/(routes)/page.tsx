export const dynamic = 'force-dynamic'

import Carousel from '@/components/native/Carousel'
import Hero from '@/components/native/Hero'
import { ProductSkeletonGrid } from '@/components/native/Product'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import {
   Layers3,
   Star,
   Truck,
   Wrench,
   Printer,
   Package,
   MapPin,
   Car,
   ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import nextDynamic from 'next/dynamic'

const CarModelImage = nextDynamic(
   () => import('@/components/native/CarModelImage'),
   { ssr: false }
)

const FeaturedProductsCarousel = nextDynamic(
   () => import('@/components/native/FeaturedProductsCarousel'),
   { ssr: false }
)

const RecentlyViewed = nextDynamic(
   () => import('@/components/native/RecentlyViewed'),
   { ssr: false }
)

const ScrollReveal = nextDynamic(
   () => import('@/components/native/ScrollReveal').then(m => ({ default: m.ScrollReveal })),
   { ssr: false }
)
const AnimatedCounter = nextDynamic(
   () => import('@/components/native/AnimatedCounter').then(m => ({ default: m.AnimatedCounter })),
   { ssr: false }
)

/**
 * Fetch homepage data with a timeout to prevent long-running DB queries
 * from causing React error #419 (Suspense boundary failure during SSR).
 */
async function fetchHomeData() {
   const TIMEOUT_MS = 5000
   const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Homepage DB query timeout')), TIMEOUT_MS)
   )

   const query = Promise.all([
      prisma.product.findMany({
         where: { isAvailable: true, isFeatured: true },
         select: {
            id: true, title: true, price: true, discount: true,
            images: true, isAvailable: true, stock: true, isFeatured: true,
            brand: { select: { id: true, title: true } },
            categories: { select: { id: true, title: true } },
         },
         take: 8,
         orderBy: { createdAt: 'desc' },
      }),
      prisma.banner.findMany({
         orderBy: { createdAt: 'desc' },
         take: 6,
      }),
      prisma.carBrand.findMany({
         orderBy: { sortOrder: 'asc' },
         take: 10,
         include: {
            _count: { select: { models: true } },
            models: { take: 1, select: { imageUrl: true } },
         },
      }),
   ])

   return Promise.race([query, timeout])
}

export default async function Index() {
   let featuredProducts: any[] = [], banners: any[] = [], carBrands: any[] = []
   try {
      ;[featuredProducts, banners, carBrands] = await fetchHomeData()
   } catch (e) {
      console.warn('[home] DB unavailable or timed out, rendering empty state:', (e as Error)?.message)
   }

   return (
      <div className="flex flex-col gap-0 -mx-[1.4rem] md:-mx-[4rem] lg:-mx-[6rem] xl:-mx-[8rem] 2xl:-mx-[12rem]">

         {/* ── 1. HERO ──────────────────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] pt-2 pb-6">
            <Hero />
         </section>

         {/* ── 2. ÖNE ÇIKAN ÜRÜNLER ─────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-12 bg-background">
            <div className="mb-6">
               <h2 className="text-3xl font-bold tracking-tight">Öne Çıkan Ürünler</h2>
               <p className="text-sm text-muted-foreground mt-1">
                  En çok tercih edilen 3D baskı ürünlerimiz.
               </p>
            </div>
            {isVariableValid(featuredProducts) ? (
               <FeaturedProductsCarousel products={featuredProducts} />
            ) : (
               <ProductSkeletonGrid />
            )}
            <div className="mt-8 text-center">
               <Link href="/products">
                  <Button variant="outline" size="lg" className="rounded-full gap-2 px-8 font-semibold hover:border-orange-500/40 hover:text-orange-500 transition-colors">
                     Tüm Ürünleri Gör
                     <ArrowRight className="h-4 w-4" />
                  </Button>
               </Link>
            </div>
         </section>

         {/* ── 2.5 SON GÖRÜNTÜLENEN ÜRÜNLER ────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-12 bg-neutral-50/50 dark:bg-neutral-900/50">
            <RecentlyViewed />
         </section>

         {/* ── 3. MÜŞTERİ YORUMLARI ─────────────────────────────── */}
         <section className="py-12 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
               <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Müşterilerimizin Gözünden</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                     Ürünlerimizi kullanan binlerce mutlu müşterimizden bazıları.
                  </p>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {[
                     {
                        name: 'Mehmet K.',
                        stars: 5,
                        review: 'ürün beklediğimden çok daha kaliteli geldi. detaylar harika, boyama da çok düzgün. teşekkürler xforgea',
                     },
                     {
                        name: 'Ayşe D.',
                        stars: 5,
                        review: 'kendi logomun 3d baskısını yaptırdım ofis masamda duruyor herkes soruyor nerden aldın diye :)',
                     },
                     {
                        name: 'Emre T.',
                        stars: 4,
                        review: 'kargo biraz geç geldi 5 gün sürdü ama ürün gerçekten kaliteli. bir dahakine daha hızlı olursa 5 yıldız veririm',
                     },
                     {
                        name: 'Zeynep A.',
                        stars: 5,
                        review: 'hediye olarak aldım çok beğenildi. paketleme de gayet özenli bubble wrap falan hepsi var',
                     },
                     {
                        name: 'Can B.',
                        stars: 5,
                        review: 'araç için telefon tutucu aldım tam oturdu süper kalite. 3d yazıcıdan çıktığına inanmıyosun',
                     },
                     {
                        name: 'Selin M.',
                        stars: 4,
                        review: 'figür aldım rengi fotoğraftakinden biraz farklıydı ama işçilik olarak kusursuz. tekrar alırım',
                     },
                  ].map(({ name, stars, review }) => (
                     <div
                        key={name}
                        className="rounded-xl border bg-background p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                     >
                        <span className="text-3xl text-orange-500/30 font-serif leading-none">&ldquo;</span>
                        <p className="text-sm text-muted-foreground flex-1 -mt-1">{review}</p>
                        <div className="flex items-center gap-0.5">
                           {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                 key={i}
                                 className={`h-3.5 w-3.5 ${i < stars ? 'fill-orange-500 text-orange-500' : 'fill-muted text-muted'}`}
                              />
                           ))}
                        </div>
                        <div className="pt-2 border-t border-border/50">
                           <span className="text-sm font-semibold">{name}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── 4. YENİ KOLEKSİYON (Bannerlar) ────────────────────── */}
         {banners.length > 0 && (
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-12 bg-background">
            <div className="mb-6">
               <h2 className="text-3xl font-bold tracking-tight">Keşfedilmeyi Bekleyen Tasarımlar</h2>
               <p className="text-sm text-muted-foreground mt-1">
                  Yeni koleksiyonumuza göz atın, size ilham verecek ürünler sizi bekliyor.
               </p>
            </div>
            <Carousel images={banners.map((obj) => obj.image)} disableZoom />
         </section>
         )}

         {/* ── 5. NEDEN xFORGEA3D? ──────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-12 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="mb-8 text-center">
               <h2 className="text-3xl font-bold tracking-tight">Neden xForgea3D?</h2>
               <p className="mt-2 text-sm text-muted-foreground">
                  Her üründe aynı kalite, her teslimatda aynı özen.
               </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  {
                     icon: <Star className="h-8 w-8 text-orange-500" />,
                     title: 'Premium Kalite',
                     desc: 'Endüstriyel sınıf filament ve hassas yazıcılarla üretim.',
                     stat: { end: 99, suffix: '%', label: 'Müşteri Memnuniyeti' },
                  },
                  {
                     icon: <Layers3 className="h-8 w-8 text-orange-500" />,
                     title: 'Detay Hassasiyeti',
                     desc: '0.1mm katman çözünürlüğüyle mükemmel yüzey kalitesi.',
                     stat: { end: 100, suffix: 'μm', label: 'Katman Hassasiyeti' },
                  },
                  {
                     icon: <Wrench className="h-8 w-8 text-orange-500" />,
                     title: 'Özelleştirme',
                     desc: 'Renk, boyut ve tasarım seçenekleriyle tamamen size özel.',
                     stat: { end: 50, suffix: '+', label: 'Renk Seçeneği' },
                  },
                  {
                     icon: <Truck className="h-8 w-8 text-orange-500" />,
                     title: 'Türkiye\'ye Kargo',
                     desc: 'Türkiye\'nin her iline hızlı ve güvenli teslimat.',
                     stat: { end: 81, suffix: '', label: 'İl Teslimat' },
                  },
               ].map(({ icon, title, desc, stat }, i) => (
                  <div
                     key={title}
                     className="flex flex-col items-start rounded-xl border p-6 gap-3 hover:bg-muted/40 hover:border-orange-500/20 transition-all group"
                  >
                     <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/15 transition-colors">{icon}</div>
                     <h3 className="font-semibold text-lg">{title}</h3>
                     <p className="text-sm text-muted-foreground">{desc}</p>
                     <div className="mt-auto pt-3 border-t border-border/50 w-full">
                        <div className="text-2xl font-black text-orange-500">
                           <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* ── 5.5 PARA İADE GARANTİSİ ────────────────────────── */}
         <section className="py-12 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 dark:from-green-500/10 dark:via-emerald-500/5 dark:to-green-500/10">
            <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
               <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-600 dark:text-green-400">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                     </svg>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">14 Gün Koşulsuz İade Garantisi</h2>
                  <p className="text-muted-foreground max-w-lg">
                     Ürünlerimizden memnun kalmazsanız, teslimat tarihinden itibaren 14 gün içinde koşulsuz iade edebilirsiniz. Paranız güvende.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                     <span className="inline-flex items-center gap-2 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <Truck className="h-4 w-4" />
                        Ücretsiz İade Kargo
                     </span>
                     <span className="inline-flex items-center gap-2 rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        Hızlı Para İadesi
                     </span>
                  </div>
                  <Link href="/policies/iade-kosullari" className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline font-medium">
                     İade koşullarını inceleyin →
                  </Link>
               </div>
            </div>
         </section>

         {/* ── 6. KİŞİYE ÖZEL CTA ─────────────────────────────── */}
         <section className="py-12 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-orange-600/5 dark:from-orange-500/10 dark:via-amber-500/5 dark:to-orange-600/10">
            <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
               <div className="rounded-2xl border bg-background/80 backdrop-blur-sm p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-12 shadow-xl shadow-orange-500/5">
                  <div className="flex-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                        Sınırsız Yaratıcılık
                     </span>
                     <h2 className="mt-2 text-3xl font-bold tracking-tight">
                        Kişiye Özel Ürünler
                     </h2>
                     <p className="mt-3 text-muted-foreground max-w-md">
                        Kendi tasarımınızı bize gönderin ya da hayal ettiğinizi anlatın — biz üretelim.
                        Hediyeye, koleksiyona veya özel bir anıya özel 3D baskı ürünler.
                     </p>
                     <div className="mt-6">
                        <Link href="/products?custom=true">
                           <Button size="lg" className="rounded-full px-8 font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_20px_rgba(249,115,22,0.3)]">
                              Kişiselleştirmeye Başla
                              <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                     </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20">
                     <Wrench className="h-12 w-12 md:h-16 md:w-16 text-orange-500/60" />
                  </div>
               </div>
            </div>
         </section>

         {/* ── 7. ARAÇ PARÇALARI VİTRİN ─────────────────────────── */}
         {carBrands.length > 0 && (
            <section className="py-12 bg-neutral-50/50 dark:bg-neutral-900/50">
               <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Car className="h-5 w-5 text-orange-500" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Oto Yedek Parça</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Araç Parçaları</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                           Aracınıza özel 3D baskı yedek parça ve aksesuarlar.
                        </p>
                     </div>
                     <Link href="/products?category=Araç Aksesuarları">
                        <Button variant="outline" className="rounded-full gap-2">
                           Tümünü Gör <ArrowRight className="h-4 w-4" />
                        </Button>
                     </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {carBrands.map((brand: any) => {
                        const firstModelImage = brand.models?.[0]?.imageUrl
                        return (
                           <Link
                              key={brand.id}
                              href={`/products?carBrand=${brand.slug}`}
                              className="group relative flex flex-col items-center rounded-xl border bg-background p-5 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                           >
                              {/* Model image preview */}
                              {firstModelImage ? (
                                 <CarModelImage
                                    src={firstModelImage}
                                    alt={`${brand.name} model`}
                                    className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                    containerClassName="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-white"
                                 />
                              ) : (
                                 <div className="w-full aspect-[16/10] rounded-lg bg-white flex items-center justify-center mb-3">
                                    <Car className="h-8 w-8 text-black/20" />
                                 </div>
                              )}
                              {/* Brand logo */}
                              {brand.logoUrl ? (
                                 <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-border/50 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                    <img
                                       src={brand.logoUrl}
                                       alt={brand.name}
                                       width={28}
                                       height={28}
                                       className="object-contain"
                                    />
                                 </div>
                              ) : (
                                 <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-2 group-hover:bg-orange-500/10 transition-colors">
                                    <span className="text-lg font-bold text-muted-foreground">{brand.name.charAt(0)}</span>
                                 </div>
                              )}
                              <span className="text-sm font-semibold text-center">{brand.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                 {brand._count.models} model
                              </span>
                           </Link>
                        )
                     })}
                  </div>
               </div>
            </section>
         )}

         {/* ── 8. ÜRETİM SÜRECİ (Timeline) ────────────────────── */}
         <section className="py-12 bg-background">
            <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem]">
               <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Üretim Süreci</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                     Siparişiniz nasıl hayata geçiyor?
                  </p>
               </div>

               {/* Timeline stepper */}
               <div className="relative">
                  {/* Connection line */}
                  <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[
                        {
                           step: '01',
                           icon: <Layers3 className="h-6 w-6" />,
                           title: 'Tasarla',
                           desc: 'Hazır modellerimizi seçin ya da kendi tasarımınızı paylaşın.',
                        },
                        {
                           step: '02',
                           icon: <Printer className="h-6 w-6" />,
                           title: 'Üret',
                           desc: 'Siparişiniz endüstriyel 3D yazıcılarımızda titizlikle üretilir.',
                        },
                        {
                           step: '03',
                           icon: <Package className="h-6 w-6" />,
                           title: 'Teslim Et',
                           desc: 'Özenle paketlenir, Türkiye\'nin her yerine hızla gönderilir.',
                        },
                     ].map(({ step, icon, title, desc }) => (
                        <div key={step} className="flex flex-col items-center text-center">
                           {/* Step circle */}
                           <div className="relative w-24 h-24 rounded-full bg-background border-2 border-orange-500/40 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/10">
                              <div className="text-orange-500">{icon}</div>
                              <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                 {step}
                              </span>
                           </div>
                           <h3 className="text-lg font-semibold mb-1">{title}</h3>
                           <p className="text-sm text-muted-foreground max-w-[240px]">{desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* ── 9. KARGO + NEWSLETTER (Combined) ──────────────────── */}
         <section className="py-12 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] space-y-8">
               {/* Kargo CTA */}
               <div className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border bg-background px-8 py-8">
                  <div className="flex-shrink-0 p-4 rounded-full bg-orange-500/10">
                     <MapPin className="h-10 w-10 text-orange-500" />
                  </div>
                  <div className="flex-1">
                     <h2 className="text-2xl font-bold tracking-tight">
                        Türkiye Geneli Kargo
                     </h2>
                     <p className="mt-2 text-muted-foreground max-w-lg">
                        İstanbul&apos;dan Van&apos;a, Trabzon&apos;dan Bodrum&apos;a — Türkiye&apos;nin 81 iline hızlı ve güvenli kargo.
                     </p>
                  </div>
                  <div className="flex-shrink-0">
                     <Link href="/products">
                        <Button size="lg" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_16px_rgba(249,115,22,0.3)]">
                           Sipariş Ver
                        </Button>
                     </Link>
                  </div>
               </div>

               {/* Newsletter footer'da mevcut */}
            </div>
         </section>

      </div>
   )
}
