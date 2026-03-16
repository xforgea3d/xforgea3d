import { ImageSkeleton } from '@/components/native/icons'
import SafeImage from '@/components/native/SafeImage'
import { ProductWithIncludes } from '@/types/prisma'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { QuickAddButton } from '@/components/native/QuickAddButton'
import { WishlistHeart } from '@/components/native/WishlistHeart'

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

function getFlashSaleTimeLeft(endDate: string | Date | null | undefined): string | null {
   if (!endDate) return null
   const diff = new Date(endDate).getTime() - Date.now()
   if (diff <= 0) return null
   const days = Math.floor(diff / (1000 * 60 * 60 * 24))
   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
   if (days > 0) return `${days}g ${hours}s kaldi`
   const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
   return `${hours}s ${mins}dk kaldi`
}

function isFlashSaleActive(product: any): boolean {
   return !!(
      product?.flashSalePrice &&
      product?.flashSalePrice > 0 &&
      product?.flashSaleEndDate &&
      new Date(product.flashSaleEndDate).getTime() > Date.now()
   )
}

export const Product = ({
   product,
   priority = false,
}: {
   product: ProductWithIncludes
   priority?: boolean
}) => {
   const flashActive = isFlashSaleActive(product)
   const hasDiscount = product?.discount > 0
   const displayPrice = flashActive
      ? (product as any).flashSalePrice
      : hasDiscount
         ? product.price - product.discount
         : product.price
   const discountPct = flashActive
      ? Math.round(((product.price - (product as any).flashSalePrice) / product.price) * 100)
      : hasDiscount
         ? Math.round((product.discount / product.price) * 100)
         : 0
   const flashTimeLeft = flashActive ? getFlashSaleTimeLeft((product as any).flashSaleEndDate) : null

   return (
      <div className="group block relative h-full">
         <div className={cn(
            "relative flex flex-col h-full overflow-hidden rounded-xl border bg-card transition-all duration-300",
            "group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:-translate-y-1",
            "dark:group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.12)] dark:group-hover:border-orange-500/25",
            flashActive && "border-red-400/50 dark:border-red-500/30"
         )}>
            <Link href={`/products/${product.id}`} className="block">
               {/* Image container */}
               <div className="relative aspect-[4/3] w-full flex-shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
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

                  {/* Wishlist heart */}
                  <WishlistHeart productId={product.id} />

                  {/* Flash sale badge */}
                  {flashActive && (
                     <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-pulse">
                           ⚡ Ozel Firsat
                        </span>
                        {flashTimeLeft && (
                           <span className="inline-flex items-center rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                              {flashTimeLeft}
                           </span>
                        )}
                     </div>
                  )}

                  {/* Discount badge overlay (only when no flash sale) */}
                  {!flashActive && hasDiscount && (
                     <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                           -{discountPct}%
                        </span>
                     </div>
                  )}

                  {/* Out of stock overlay */}
                  {!product?.isAvailable && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                        <span className="rounded-full bg-white/90 dark:bg-neutral-800/90 px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow">
                           Stokta Yok
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
                     <span className={cn("text-lg font-bold tracking-tight", flashActive && "text-red-600 dark:text-red-400")}>
                        {displayPrice.toFixed(2)} ₺
                     </span>
                     {(hasDiscount || flashActive) && (
                        <span className="text-sm text-muted-foreground line-through">
                           {product.price.toFixed(2)} ₺
                        </span>
                     )}
                     {flashActive && (
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                           -{discountPct}%
                        </span>
                     )}
                  </div>
               </div>
            </Link>

            {/* Quick-add button — inside card but outside Link */}
            <div className="px-4 pb-4">
               <QuickAddButton product={product} />
            </div>
         </div>
      </div>
   )
}

export function ProductSkeleton() {
   return (
      <div className="animate-pulse rounded-xl border bg-card overflow-hidden">
         <div className="aspect-[4/3] w-full bg-neutral-200 dark:bg-neutral-700" />
         <div className="p-4 space-y-3">
            <div className="h-2 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-5 w-20 rounded-full bg-neutral-200 dark:bg-neutral-700 mt-2" />
         </div>
      </div>
   )
}
