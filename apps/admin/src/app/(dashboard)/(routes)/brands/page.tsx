export const revalidate = 0
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { BrandColumn, BrandsClient } from './components/table'

export default async function BrandsPage() {
   let brands: any[] = []
   try {
      brands = await prisma.brand.findMany({
         select: {
            id: true,
            title: true,
            _count: { select: { products: true } },
         },
      })
   } catch (error) {
      console.warn('[BrandsPage] Failed to fetch brands:', error)
   }

   const formattedBrands: BrandColumn[] = brands.map((brand) => ({
      id: brand.id,
      title: brand.title,
      products: brand._count.products,
   }))

   return (
      <div className="my-6 block space-y-4">
         <div className="flex items-center justify-between">
            <Heading
               title={`Koleksiyonlar (${brands.length})`}
               description="Mağazanızdaki koleksiyonları yönetin."
            />
            <Link href="/brands/new">
               <Button>
                  <Plus className="mr-2 h-4" /> Yeni Ekle
               </Button>
            </Link>
         </div>
         <Separator />
         <BrandsClient data={formattedBrands} />
      </div>
   )
}
