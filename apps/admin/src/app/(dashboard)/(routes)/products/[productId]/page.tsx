export const revalidate = 0
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

import { ProductForm } from './components/product-form'

export default async function ProductPage({
   params,
}: {
   params: { productId: string }
}) {
   try {
      const [categories, brands] = await Promise.all([
         prisma.category.findMany(),
         prisma.brand.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      ])

      if (params.productId === 'new') {
         return (
            <div className="flex-col">
               <div className="flex-1 space-y-4 pt-6 pb-12">
                  <ProductForm categories={categories} brands={brands} initialData={null} />
               </div>
            </div>
         )
      }

      const product = await prisma.product.findUnique({
         where: {
            id: params.productId,
         },
         include: {
            categories: true,
            brand: true,
         },
      })

      if (!product) {
         notFound()
      }

      return (
         <div className="flex-col">
            <div className="flex-1 space-y-4 pt-6 pb-12">
               <ProductForm categories={categories} brands={brands} initialData={product} />
            </div>
         </div>
      )
   } catch {
      notFound()
   }
}
