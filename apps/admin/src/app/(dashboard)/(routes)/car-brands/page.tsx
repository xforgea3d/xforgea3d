export const revalidate = 0

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import prisma from '@/lib/prisma'
import { Plus, Car } from 'lucide-react'
import Link from 'next/link'
import { BrandDeleteButton } from './brand-delete-button'

export default async function CarBrandsPage() {
   const brands = await prisma.carBrand.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
         _count: { select: { models: true } },
      },
   })

   return (
      <div className="my-6 block space-y-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Araç Markaları (${brands.length})`}
               description="Araç marka ve modellerini yönetin"
            />
            <Link href="/car-brands/new">
               <Button>
                  <Plus className="mr-2 h-4 w-4" /> Yeni Marka Ekle
               </Button>
            </Link>
         </div>
         <Separator />

         {brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <Car className="h-16 w-16 text-muted-foreground/30 mb-4" />
               <h3 className="text-lg font-medium text-muted-foreground">
                  Henüz marka eklenmemiş
               </h3>
               <p className="text-sm text-muted-foreground/70 mt-1">
                  Başlamak için yeni bir marka ekleyin.
               </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
               {brands.map(brand => (
                  <Card
                     key={brand.id}
                     className="group relative overflow-hidden hover:border-orange-500/40 transition-all duration-200"
                  >
                     <CardContent className="p-5">
                        <Link
                           href={`/car-brands/${brand.id}`}
                           className="flex items-center gap-4"
                        >
                           {/* Logo / Initial */}
                           {brand.logoUrl ? (
                              <div className="w-14 h-14 rounded-xl bg-white border flex items-center justify-center shrink-0 overflow-hidden">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="w-11 h-11 object-contain"
                                 />
                              </div>
                           ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 border flex items-center justify-center shrink-0">
                                 <span className="text-xl font-bold text-orange-600">
                                    {brand.name.charAt(0).toUpperCase()}
                                 </span>
                              </div>
                           )}

                           {/* Name & Count */}
                           <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate group-hover:text-orange-600 transition-colors">
                                 {brand.name}
                              </h3>
                              <Badge variant="secondary" className="mt-1.5 text-[11px]">
                                 {brand._count.models} model
                              </Badge>
                           </div>
                        </Link>

                        {/* Delete button - top right */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <BrandDeleteButton brandId={brand.id} brandName={brand.name} />
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}
      </div>
   )
}
