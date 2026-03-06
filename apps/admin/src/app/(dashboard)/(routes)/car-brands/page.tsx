export const revalidate = 0

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { Plus, Car } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function CarBrandsPage() {
   const brands = await prisma.carBrand.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
         _count: { select: { models: true } },
         models: { take: 3, orderBy: { name: 'asc' } },
      },
   })

   return (
      <div className="my-6 block space-y-4">
         <div className="flex items-center justify-between">
            <Heading
               title={`Araç Markaları (${brands.length})`}
               description="Araç marka ve modellerini yönetin"
            />
            <Link href="/car-brands/new">
               <Button>
                  <Plus className="mr-2 h-4" /> Yeni Marka
               </Button>
            </Link>
         </div>
         <Separator />

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brands.map(brand => (
               <Link
                  key={brand.id}
                  href={`/car-brands/${brand.id}`}
                  className="group border rounded-xl p-4 hover:border-orange-500/40 hover:bg-accent/50 transition-all"
               >
                  <div className="flex items-center gap-3 mb-3">
                     {brand.logoUrl ? (
                        <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">
                           <Image
                              src={brand.logoUrl}
                              alt={brand.name}
                              width={32}
                              height={32}
                              className="object-contain"
                           />
                        </div>
                     ) : (
                        <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                           <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                     )}
                     <div>
                        <h3 className="font-semibold">{brand.name}</h3>
                        <p className="text-xs text-muted-foreground">
                           {brand._count.models} model
                        </p>
                     </div>
                  </div>
                  {brand.models.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {brand.models.map(m => (
                           <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {m.name}
                           </span>
                        ))}
                        {brand._count.models > 3 && (
                           <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                              +{brand._count.models - 3}
                           </span>
                        )}
                     </div>
                  )}
               </Link>
            ))}
         </div>
      </div>
   )
}
