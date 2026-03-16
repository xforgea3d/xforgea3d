export const dynamic = 'force-dynamic'

import Carousel from '@/components/native/Carousel'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import nextDynamic from 'next/dynamic'

const ProductReviews = nextDynamic(
   () => import('@/components/native/ProductReviews'),
   { ssr: false }
)

const RecentlyViewed = nextDynamic(
   () => import('@/components/native/RecentlyViewed'),
   { ssr: false }
)

const RecentlyViewedTracker = nextDynamic(
   () => import('@/components/native/RecentlyViewedTracker'),
   { ssr: false }
)
import { isVariableValid } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { ProductJsonLd } from '@/app/json-ld'
import {
   ChevronRightIcon,
   Layers3Icon,
   SparklesIcon,
} from 'lucide-react'
import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'

import { DataSection } from './components/data'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

type Props = {
   params: { productId: string }
   searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
   { params, searchParams }: Props,
   parent: ResolvingMetadata
): Promise<Metadata> {
   let product: any = null
   try {
      product = await prisma.product.findUnique({
         where: { id: params.productId },
         include: { brand: true, categories: { select: { title: true } } },
      })
   } catch { return {} }

   if (!product) return {}

   const finalPrice = product.price - product.discount

   const availability = product.isAvailable && product.stock > 0 ? 'in stock' : 'out of stock'
   const categoryName = product.categories?.[0]?.title ?? '3D Baski Urunleri'

   return {
      title: product.title,
      description: product.description ?? `${product.title} - xForgea3D premium 3D baski urunu`,
      keywords: product.keywords,
      openGraph: {
         type: 'website',
         title: `${product.title} | xForgea3D`,
         description: product.description ?? `${product.title} - xForgea3D`,
         url: `${SITE_URL}/products/${product.id}`,
         images: product.images.map(img => ({
            url: img,
            alt: product.title,
         })),
      },
      twitter: {
         card: 'summary_large_image',
         title: `${product.title} | xForgea3D`,
         description: product.description ?? `${product.title} - xForgea3D`,
         images: product.images.length > 0 ? [product.images[0]] : undefined,
      },
      alternates: {
         canonical: `${SITE_URL}/products/${product.id}`,
      },
      other: {
         'product:price:amount': finalPrice.toFixed(2),
         'product:price:currency': 'TRY',
         'product:availability': availability,
         'product:brand': 'xForgea3D',
         'product:category': categoryName,
         'instagram:site': '@xforgea3d',
      },
   }
}

export default async function Product({
   params,
}: {
   params: { productId: string }
}) {
   // Fetch product and related products in PARALLEL
   const [product, relatedProducts] = await Promise.all([
      prisma.product.findUnique({
         where: { id: params.productId },
         include: {
            brand: true,
            categories: true,
            productReviews: {
               include: { user: { select: { name: true } } },
               orderBy: { createdAt: 'desc' },
            },
         },
      }),
      prisma.product.findMany({
         where: {
            isAvailable: true,
            NOT: { id: params.productId },
         },
         select: {
            id: true, title: true, price: true, discount: true,
            images: true, isAvailable: true, stock: true, isFeatured: true,
            brand: { select: { id: true, title: true } },
            categories: { select: { id: true, title: true } },
         },
         take: 4,
         orderBy: { createdAt: 'desc' },
      }),
   ])

   if (!isVariableValid(product)) notFound()

   // Filter related to same category after both queries resolve
   const sameCategory = relatedProducts.filter((p) =>
      p.categories.some((c) =>
         product.categories.some((pc) => pc.id === c.id)
      )
   )
   const finalRelated = sameCategory.length > 0 ? sameCategory : relatedProducts.slice(0, 4)


   return (
      <div className="space-y-10">

         {/* JSON-LD Product Schema */}
         <ProductJsonLd product={product} />

         {/* Breadcrumbs */}
         <Breadcrumbs product={product} />

         {/* Main product area — image gallery + data panel */}
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Image Gallery — takes 6 cols on large */}
            <div className="lg:col-span-6 w-full">
               <div className="sticky top-20 rounded-xl overflow-hidden border bg-neutral-100 dark:bg-neutral-900 min-h-[60vh]">
                  <Carousel images={product?.images} />
               </div>
            </div>

            {/* Data Panel — takes 6 cols on large */}
            <div className="lg:col-span-6 w-full">
               <DataSection product={product} />
            </div>
         </div>

         <Separator />

         {/* Koleksiyonun Hikayesi — Storytelling block */}
         <StoryBlock product={product} />

         <Separator />

         {/* Degerlendirmeler */}
         <ProductReviews productId={params.productId} />

         {/* Related Products */}
         {finalRelated.length > 0 && (
            <>
               <Separator />
               <RelatedProductsBlock products={finalRelated} />
            </>
         )}

         {/* Recently Viewed */}
         <Separator />
         <RecentlyViewed />

         {/* Track this product view */}
         <RecentlyViewedTracker
            productId={params.productId}
            productName={product.title}
            productPrice={product.price - product.discount}
         />

      </div>
   )
}

import { ProductGrid } from '@/components/native/Product'

const RelatedProductsBlock = ({ products }) => {
   return (
      <section className="space-y-6">
         <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">İlgili Ürünler</h2>
            <p className="text-sm text-muted-foreground">İlginizi çekebilecek diğer tasarımlarımıza göz atın.</p>
         </div>
         <ProductGrid products={products} />
      </section>
   )
}

const Breadcrumbs = ({ product }) => {
   return (
      <nav className="flex text-muted-foreground" aria-label="Breadcrumb">
         <ol className="inline-flex items-center gap-2">
            <li className="inline-flex items-center">
               <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium hover:text-foreground transition-colors"
               >
                  Ana Sayfa
               </Link>
            </li>
            <li>
               <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4" />
                  <Link
                     className="text-sm font-medium hover:text-foreground transition-colors"
                     href="/products"
                  >
                     Ürünler
                  </Link>
               </div>
            </li>
            <li aria-current="page">
               <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4" />
                  <span className="text-sm font-medium text-foreground">
                     {product?.title}
                  </span>
               </div>
            </li>
         </ol>
      </nav>
   )
}

const StoryBlock = ({ product }) => {
   const collectionName = product?.brand?.title ?? 'xForgea3D'

   return (
      <section className="rounded-xl border overflow-hidden">
         {/* Header */}
         <div className="bg-muted/40 px-8 py-6 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/5">
               <SparklesIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
               <p className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground">
                  {collectionName} Koleksiyonu
               </p>
               <h2 className="text-xl font-bold tracking-tight mt-0.5">
                  Koleksiyonun Hikayesi
               </h2>
            </div>
         </div>

         {/* Body */}
         <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
               <p>
                  Her xForgea3D ürünü, yalnızca bir nesne değil — bir hikâyenin parçasıdır.{' '}
                  <span className="font-semibold text-foreground">{product?.title}</span>,{' '}
                  {collectionName} koleksiyonunun ruhunu taşıyan, özenle tasarlanmış ve
                  katman katman inşa edilmiş bir eserdir.
               </p>
               <p>
                  Bu koleksiyon; sanatı, teknolojiyi ve kişiselleştirmeyi bir araya getirerek
                  her parçayı benzersiz kılar. İster bir hediye, ister koleksiyonunuzun
                  yeni üyesi olsun — bu ürün sizin için üretilmiştir.
               </p>
            </div>

            <div className="space-y-4">
               {[
                  {
                     icon: <Layers3Icon className="h-5 w-5 text-muted-foreground" />,
                     title: 'Katman Katman Üretim',
                     desc: 'Her detay, endüstriyel 3D yazıcılarımızda 0.1mm hassasiyetle hayata geçiyor.',
                  },
                  {
                     icon: <SparklesIcon className="h-5 w-5 text-muted-foreground" />,
                     title: 'El İşçiliği Kalitesi',
                     desc: 'Dijital üretim sonrası her ürün manuel kalite kontrolden geçer; çapaklar temizlenir, yüzeyler işlenir.',
                  },
               ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 rounded-lg border p-4">
                     <div className="flex-shrink-0 p-2 rounded-lg bg-foreground/5">
                        {icon}
                     </div>
                     <div>
                        <h3 className="text-sm font-semibold">{title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                           {desc}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}
