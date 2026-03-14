export const revalidate = 60

import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import { Button } from '@/components/ui/button'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import { Package } from 'lucide-react'
import Link from 'next/link'

import {
   AvailableToggle,
   BrandCombobox,
   CategoriesCombobox,
   PriceRangeFilter,
   SortBy,
} from './components/options'
import FilterRestorer from './components/FilterRestorer'

const PAGE_SIZE = 12

export default async function Products({ searchParams }) {
   const { sort, isAvailable, brand, category, carModel, carBrand, page = 1, minPrice, maxPrice } = searchParams ?? {}

   const orderBy = getOrderBy(sort)

   const whereClause = {
      id: { not: 'quote-request-product' },
      isAvailable: isAvailable === 'true' ? true : undefined,
      brand: brand
         ? { title: { contains: brand, mode: 'insensitive' as const } }
         : undefined,
      categories: category
         ? { some: { title: { contains: category, mode: 'insensitive' as const } } }
         : undefined,
      carModels: carModel
         ? { some: { slug: carModel } }
         : carBrand
            ? { some: { brand: { slug: carBrand } } }
            : undefined,
      price: (minPrice || maxPrice)
         ? {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
         }
         : undefined,
   }

   const currentPage = Math.max(1, Number(page))

   let brands: any[] = [], categories: any[] = [], products: any[] = [], totalCount = 0
   try {
      ;[brands, categories, products, totalCount] = await Promise.all([
         prisma.brand.findMany({ orderBy: { title: 'asc' } }),
         prisma.category.findMany({ where: { isVisible: true }, orderBy: { title: 'asc' } }),
         prisma.product.findMany({
            where: whereClause,
            orderBy,
            skip: (currentPage - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            select: {
               id: true, title: true, price: true, discount: true,
               images: true, isAvailable: true, stock: true, isFeatured: true,
               brand: { select: { id: true, title: true } },
               categories: { select: { id: true, title: true } },
            },
         }),
         prisma.product.count({ where: whereClause }),
      ])
   } catch (e) {
      console.warn('[products] DB unavailable, rendering empty state')
   }

   const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

   function buildPageUrl(targetPage: number) {
      const params = new URLSearchParams()
      if (sort) params.set('sort', sort)
      if (isAvailable) params.set('isAvailable', isAvailable)
      if (brand) params.set('brand', brand)
      if (category) params.set('category', category)
      if (carModel) params.set('carModel', carModel)
      if (carBrand) params.set('carBrand', carBrand)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      params.set('page', String(targetPage))
      return `/products?${params.toString()}`
   }

   return (
      <>
         <FilterRestorer />
         <Heading
            title="Ürünler"
            description="Tüm 3D baskı ürünlerimize göz atın."
         />
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            <SortBy initialData={sort} />
            <CategoriesCombobox
               initialCategory={category}
               categories={categories}
            />
            <BrandCombobox initialBrand={brand} brands={brands} />
            <AvailableToggle initialData={isAvailable} />
            <PriceRangeFilter initialMin={minPrice} initialMax={maxPrice} />
         </div>
         <Separator />
         {isVariableValid(products) ? (
            <>
               <ProductGrid products={products} />
               {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8 mb-4">
                     {currentPage > 1 ? (
                        <Link href={buildPageUrl(currentPage - 1)}>
                           <Button variant="outline" className="rounded-full">
                              Önceki
                           </Button>
                        </Link>
                     ) : (
                        <Button variant="outline" className="rounded-full" disabled>
                           Önceki
                        </Button>
                     )}
                     <span className="text-sm font-medium text-muted-foreground">
                        Sayfa {currentPage} / {totalPages}
                     </span>
                     {currentPage < totalPages ? (
                        <Link href={buildPageUrl(currentPage + 1)}>
                           <Button variant="outline" className="rounded-full border-orange-500 text-orange-500 hover:bg-orange-50">
                              Sonraki
                           </Button>
                        </Link>
                     ) : (
                        <Button variant="outline" className="rounded-full" disabled>
                           Sonraki
                        </Button>
                     )}
                  </div>
               )}
            </>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
               <Package className="h-16 w-16 mb-4 stroke-1" />
               <p className="text-lg font-medium">Ürün bulunamadı</p>
               <p className="text-sm mt-1">Filtrelerinizi değiştirmeyi deneyin.</p>
            </div>
         )}
      </>
   )
}

function getOrderBy(sort) {
   let orderBy

   switch (sort) {
      case 'featured':
         orderBy = {
            orders: {
               _count: 'desc',
            },
         }
         break
      case 'most_expensive':
         orderBy = {
            price: 'desc',
         }
         break
      case 'least_expensive':
         orderBy = {
            price: 'asc',
         }
         break

      default:
         orderBy = {
            orders: {
               _count: 'desc',
            },
         }
         break
   }

   return orderBy
}
