export const revalidate = 60

import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'

import {
   AvailableToggle,
   BrandCombobox,
   CategoriesCombobox,
   SortBy,
} from './components/options'

export default async function Products({ searchParams }) {
   const { sort, isAvailable, brand, category, page = 1 } = searchParams ?? {}

   const orderBy = getOrderBy(sort)

   const whereClause = {
      isAvailable: isAvailable === 'true' || sort ? true : undefined,
      brand: brand
         ? { title: { contains: brand, mode: 'insensitive' as const } }
         : undefined,
      categories: category
         ? { some: { title: { contains: category, mode: 'insensitive' as const } } }
         : undefined,
   }

   let brands: any[] = [], categories: any[] = [], products: any[] = []
   try {
      ;[brands, categories, products] = await Promise.all([
         prisma.brand.findMany({ orderBy: { title: 'asc' } }),
         prisma.category.findMany({ orderBy: { title: 'asc' } }),
         prisma.product.findMany({
            where: whereClause,
            orderBy,
            skip: (Number(page) - 1) * 12,
            take: 12,
            include: { brand: true, categories: true },
         }),
      ])
   } catch (e) {
      console.warn('[products] DB unavailable, rendering empty state')
   }

   return (
      <>
         <Heading
            title="Ürünler"
            description="Tüm 3D baskı ürünlerimize göz atın."
         />
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            <SortBy initialData={sort} />
            <CategoriesCombobox
               initialCategory={category}
               categories={categories}
            />
            <BrandCombobox initialBrand={brand} brands={brands} />
            <AvailableToggle initialData={isAvailable} />
         </div>
         <Separator />
         {isVariableValid(products) ? (
            <ProductGrid products={products} />
         ) : (
            <ProductSkeletonGrid />
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
