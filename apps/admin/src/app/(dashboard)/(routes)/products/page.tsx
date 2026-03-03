export const revalidate = 30

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { formatter } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ProductsTable } from './components/table'
import { ProductColumn } from './components/table'

export default async function ProductsPage() {
   let products: any[] = []
   try {
      products = await prisma.product.findMany({
         select: {
            id: true,
            title: true,
            price: true,
            discount: true,
            isAvailable: true,
            categories: { select: { title: true }, take: 1 },
            brand: { select: { title: true } },
            _count: { select: { orders: true } },
         },
         orderBy: {
            createdAt: 'desc',
         },
         take: 100,
      })
   } catch (error) {
      console.warn('[ProductsPage] Failed to fetch products:', error)
   }

   const formattedProducts: ProductColumn[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      price: formatter.format(product.price),
      discount: formatter.format(product.discount),
      category: product.categories[0]?.title || '-',
      sales: product._count.orders,
      isAvailable: product.isAvailable,
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Products (${products.length})`}
               description="Manage products for your store"
            />
            <Link href="/products/new">
               <Button>
                  <Plus className="mr-2 h-4" /> Add New
               </Button>
            </Link>
         </div>
         <Separator />
         <ProductsTable data={formattedProducts} />
      </div>
   )
}
