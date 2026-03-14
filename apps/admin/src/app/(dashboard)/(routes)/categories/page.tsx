export const revalidate = 0
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { CategoriesClient, CategoryColumn } from './components/table'

export default async function CategoriesPage() {
   let categories: any[] = []
   try {
      categories = await prisma.category.findMany({
         select: {
            id: true,
            title: true,
            isVisible: true,
            _count: { select: { products: true } },
         },
      })
   } catch (error) {
      console.warn('[CategoriesPage] Failed to fetch categories:', error)
   }

   const formattedCategories: CategoryColumn[] = categories.map((category) => ({
      id: category.id,
      title: category.title,
      products: category._count.products,
      isVisible: category.isVisible ?? true,
   }))

   return (
      <div className="my-6 block space-y-4">
         <div className="flex items-center justify-between">
            <Heading
               title={`Kategoriler (${categories.length})`}
               description="Mağazanızdaki kategorileri yönetin."
            />
            <Link href="/categories/new">
               <Button>
                  <Plus className="mr-2 h-4" /> Yeni Ekle
               </Button>
            </Link>
         </div>
         <Separator />
         <CategoriesClient data={formattedCategories} />
      </div>
   )
}
