import { ImageSkeleton } from '@/components/native/icons'
import SafeImage from '@/components/native/SafeImage'
import { ProductWithIncludes } from '@/types/prisma'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { QuickAddButton } from '@/components/native/QuickAddButton'

export const ProductGrid = ({
   products,
   priority = false,
}: {
   products: ProductWithIncludes[]
   priority?: boolean
}) => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
         {products.map((product, i) => (
            <Product product={product} key={product.id} priority={priority || i < 4} />
         ))}
      </div>
   )
}

export const ProductSkeletonGrid = () => {
   return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
         {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
         ))}
      </div>
   )
}

export const Product = ({
   product,
   priority = false,
}: {
   product: ProductWithIncludes
   priority?: boolean
}) => {
   const hasDiscount = product?.discount > 0
   const displayPrice = hasDiscount ? product.price - product.discount : product.price
   const discountPct = hasDiscount
      ? Math.round((product.discount / product.price) * 100)
      : 0

   return (
      <div className="group block relative h-full">
         <div className={cn(
            "relative flex flex-col h-full overflow-hidden rounded-xl border bg-card transition-all duration-300",
            "group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:-translate-y-1",
            "dark:group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)] dark:group-hover:border-orange-500/25"
         )}>
            <Link href={`/products/${product.id}`} className="block">
               {/* Image container */}
               <div className="relative h-56 sm:h-64 w-full flex-shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {product?.images?.[0] ? (
                     <SafeImage
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        fallbackClassName="absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800"
                        src={product.images[0]}
                        alt={product.title}
                        loading={priority ? 'eager' : 'lazy'}
                     />
                  ) : (
                     <div className="flex h-full w-full items-center justify-center">
                        <ImageSkeleton />
                     </div>
                  )}

                  {/* Discount badge overlay */}
                  {hasDiscount && (
                     <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                           -{discountPct}%
                        </span>
                     </div>
                  )}

                  {/* Out of stock overlay */}
                  {!product?.isAvailable && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-neutral-800 shadow">
                           Tükendi
                        </span>
                     </div>
                  )}
               </div>

               {/* Card body */}
               <div className="p-4 flex flex-col flex-grow space-y-2">
                  {product?.categories?.[0]?.title && (
                     <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {product.categories[0].title}
                     </p>
                  )}

                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 transition-colors">
                     {product.title}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1 mt-auto">
                     <span className="text-lg font-bold tracking-tight">
                        {displayPrice.toFixed(2)} ₺
                     </span>
                     {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                           {product.price.toFixed(2)} ₺
                        </span>
                     )}
                  </div>
               </div>
            </Link>

            {/* Quick-add button — inside card but outside Link */}
            {product?.isAvailable && (
               <div className="px-4 pb-4">
                  <QuickAddButton product={product} />
               </div>
            )}
         </div>
      </div>
   )
}

export function ProductSkeleton() {
   return (
      <div className="animate-pulse rounded-xl border bg-card overflow-hidden">
         <div className="h-56 sm:h-64 w-full bg-neutral-200 dark:bg-neutral-700" />
         <div className="p-4 space-y-3">
            <div className="h-2 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-5 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700 mt-2" />
         </div>
      </div>
   )
}
