export const revalidate = 0
import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import { Badge } from '@/components/ui/badge'

import { BrandForm } from './components/brand-form'

const BrandPage = async ({ params }: { params: { brandId: string } }) => {
   const brand = await prisma.brand.findUnique({
      where: {
         id: params.brandId,
      },
      include: {
         products: {
            select: {
               id: true,
               title: true,
               images: true,
               price: true,
               isAvailable: true,
            },
         },
      },
   })

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 p-8 pt-6">
            <BrandForm initialData={brand} />

            {brand && (
               <>
                  <Separator className="my-6" />
                  <Heading
                     title={`Bu Koleksiyondaki Ürünler (${brand.products.length})`}
                     description="Bu koleksiyona ait ürünlerin listesi."
                  />
                  {brand.products.length === 0 ? (
                     <p className="text-sm text-muted-foreground py-4">
                        Bu koleksiyonda henüz ürün yok.
                     </p>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                        {brand.products.map((product) => (
                           <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                           >
                              <div className="relative aspect-square bg-muted">
                                 {product.images[0] ? (
                                    <Image
                                       src={product.images[0]}
                                       alt={product.title}
                                       fill
                                       className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                       Görsel yok
                                    </div>
                                 )}
                              </div>
                              <div className="p-3 space-y-1">
                                 <p className="font-medium text-sm truncate">{product.title}</p>
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                       {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </span>
                                    <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
                                       {product.isAvailable ? 'Satışta' : 'Pasif'}
                                    </Badge>
                                 </div>
                              </div>
                           </Link>
                        ))}
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   )
}

export default BrandPage
