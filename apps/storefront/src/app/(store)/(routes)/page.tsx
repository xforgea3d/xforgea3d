export const revalidate = 30; // ISR cache for fast loading; webhook bust for instant updates

import {
   BlogPostGrid,
   BlogPostSkeletonGrid,
} from '@/components/native/BlogCard'
import Carousel from '@/components/native/Carousel'
import Hero from '@/components/native/Hero'
import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import {
   Layers3,
   Star,
   Truck,
   Wrench,
   CheckCircle2,
   Printer,
   Package,
   MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Index() {
   // Run all DB queries in parallel — graceful fallback if DB unreachable during build
   let featuredProducts: any[] = [], blogs: any[] = [], banners: any[] = []
   try {
      ;[featuredProducts, blogs, banners] = await Promise.all([
         prisma.product.findMany({
            where: { isAvailable: true, isFeatured: true },
            include: { brand: true, categories: true },
            take: 8,
            orderBy: { createdAt: 'desc' },
         }),
         prisma.blog.findMany({
            include: { author: true },
            take: 3,
            orderBy: { createdAt: 'desc' },
         }),
         prisma.banner.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6,
         }),
      ])
   } catch (e) {
      console.warn('[home] DB unavailable during build, rendering empty state')
   }

   return (
      <div className="flex flex-col gap-0 border-neutral-200 dark:border-neutral-700">

         {/* ── 1. HERO ──────────────────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] pt-2 pb-6">
            <Hero />
         </section>

         <Separator />

         {/* ── 2. ÖNE ÇIKAN ÜRÜNLER ─────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="mb-6">
               <h2 className="text-3xl font-bold tracking-tight">Öne Çıkan Ürünler</h2>
               <p className="text-sm text-muted-foreground mt-1">
                  En çok tercih edilen 3D baskı ürünlerimiz.
               </p>
            </div>
            {isVariableValid(featuredProducts) ? (
               <ProductGrid products={featuredProducts} />
            ) : (
               <ProductSkeletonGrid />
            )}
         </section>

         <Separator />

         {/* ── 3. YENİ KOLEKSİYON ──────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="mb-6">
               <h2 className="text-3xl font-bold tracking-tight">Yeni Koleksiyon</h2>
               <p className="text-sm text-muted-foreground mt-1">
                  En yeni tasarımlarımızı keşfedin.
               </p>
            </div>
            <Carousel images={banners.map((obj) => obj.image)} />
         </section>

         <Separator />

         {/* ── 4. KİŞİYE ÖZEL ÜRÜNLER ──────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="rounded-xl border bg-muted/40 p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-12">
               <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
                        <Button size="lg" className="rounded-full px-8 font-semibold">
                           Kişiselleştirmeye Başla
                        </Button>
                     </Link>
                  </div>
               </div>
               <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full bg-foreground/5">
                  <Wrench className="h-12 w-12 md:h-16 md:w-16 text-foreground/40" />
               </div>
            </div>
         </section>

         <Separator />

         {/* ── 5. NEDEN xFORGEA3D? ──────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="mb-8 text-center">
               <h2 className="text-3xl font-bold tracking-tight">Neden xForgea3D?</h2>
               <p className="mt-2 text-sm text-muted-foreground">
                  Her üründe aynı kalite, her teslimatda aynı özen.
               </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  {
                     icon: <Star className="h-8 w-8 text-foreground/70" />,
                     title: 'Premium Kalite',
                     desc: 'Endüstriyel sınıf filament ve hassas yazıcılarla üretim.',
                  },
                  {
                     icon: <Layers3 className="h-8 w-8 text-foreground/70" />,
                     title: 'Detay Hassasiyeti',
                     desc: '0.1mm katman çözünürlüğüyle mükemmel yüzey kalitesi.',
                  },
                  {
                     icon: <Wrench className="h-8 w-8 text-foreground/70" />,
                     title: 'Özelleştirme',
                     desc: 'Renk, boyut ve tasarım seçenekleriyle tamamen size özel.',
                  },
                  {
                     icon: <Truck className="h-8 w-8 text-foreground/70" />,
                     title: 'Türkiye\'ye Kargo',
                     desc: 'Türkiye\'nin her iline hızlı ve güvenli teslimat.',
                  },
               ].map(({ icon, title, desc }) => (
                  <div
                     key={title}
                     className="flex flex-col items-start rounded-xl border p-6 gap-3 hover:bg-muted/40 transition-colors"
                  >
                     <div className="p-2 rounded-lg bg-foreground/5">{icon}</div>
                     <h3 className="font-semibold text-lg">{title}</h3>
                     <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
               ))}
            </div>
         </section>

         <Separator />

         {/* ── 6. ÜRETİM SÜRECİ ─────────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="mb-8 text-center">
               <h2 className="text-3xl font-bold tracking-tight">Üretim Süreci</h2>
               <p className="mt-2 text-sm text-muted-foreground">
                  Siparişiniz nasıl hayata geçiyor?
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                  {
                     step: '01',
                     icon: <Layers3 className="h-8 w-8" />,
                     title: 'Tasarla',
                     desc: 'Hazır modellerimizi seçin ya da kendi tasarımınızı paylaşın.',
                  },
                  {
                     step: '02',
                     icon: <Printer className="h-8 w-8" />,
                     title: 'Üret',
                     desc: 'Siparişiniz endüstriyel 3D yazıcılarımızda titizlikle üretilir.',
                  },
                  {
                     step: '03',
                     icon: <Package className="h-8 w-8" />,
                     title: 'Teslim Et',
                     desc: 'Özenle paketlenir, Türkiye\'nin her yerine hızla gönderilir.',
                  },
               ].map(({ step, icon, title, desc }) => (
                  <div
                     key={step}
                     className="relative flex flex-col rounded-xl border p-6 gap-4"
                  >
                     <span className="absolute top-4 right-4 text-5xl font-black text-foreground/10 select-none">
                        {step}
                     </span>
                     <div className="p-3 w-fit rounded-xl bg-foreground/5">{icon}</div>
                     <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         <Separator />

         {/* ── 7. TÜRKİYE GENELİ KARGO ─────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="flex flex-col md:flex-row items-center gap-6 rounded-xl border bg-muted/30 px-8 py-10">
               <div className="flex-shrink-0 p-4 rounded-full bg-foreground/5">
                  <MapPin className="h-10 w-10 text-foreground/60" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                     Türkiye Geneli Kargo
                  </h2>
                  <p className="mt-2 text-muted-foreground max-w-lg">
                     İstanbul&apos;dan Van&apos;a, Trabzon&apos;dan Bodrum&apos;a — Türkiye&apos;nin 81 iline hızlı ve güvenli kargo.
                     Siparişleriniz özenle paketlenir, zamanında teslim edilir.
                  </p>
               </div>
               <div className="md:ml-auto flex-shrink-0">
                  <Link href="/products">
                     <Button variant="outline" size="lg" className="rounded-full">
                        Sipariş Ver
                     </Button>
                  </Link>
               </div>
            </div>
         </section>

         <Separator />

         {/* ── 8. GÜNDEMDEN (Blog) ───────────────────────────────── */}
         <section className="px-[1.4rem] md:px-[4rem] lg:px-[6rem] xl:px-[8rem] 2xl:px-[12rem] py-10">
            <div className="mb-6">
               <h2 className="text-3xl font-bold tracking-tight">Gündemden</h2>
               <p className="text-sm text-muted-foreground mt-1">
                  3D baskı dünyasından haberler ve ilham veren içerikler.
               </p>
            </div>
            {isVariableValid(blogs) ? (
               <BlogPostGrid blogs={blogs} />
            ) : (
               <BlogPostSkeletonGrid />
            )}
         </section>

      </div>
   )
}
