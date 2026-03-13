import prisma from '@/lib/prisma'
import { BrandForm } from './components/brand-form'
import { ModelForm } from './components/model-form'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

export default async function CarBrandPage({
   params,
}: {
   params: { brandId: string }
}) {
   const isNew = params.brandId === 'new'

   const brand = isNew
      ? null
      : await prisma.carBrand.findUnique({
           where: { id: params.brandId },
           include: {
              models: { orderBy: { name: 'asc' } },
           },
        })

   return (
      <div className="my-6 space-y-6">
         <Link href="/car-brands">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
               <ArrowLeft className="h-4 w-4" />
               Markalara Dön
            </Button>
         </Link>

         {isNew ? (
            <>
               <Heading
                  title="Yeni Marka Ekle"
                  description="Yeni bir araç markası oluşturun."
               />
               <Separator />
               <BrandForm initialData={null} />
            </>
         ) : brand ? (
            <>
               {/* Marka Bilgileri - Kompakt */}
               <BrandForm initialData={brand} />

               {/* Belirgin Ayraç */}
               <div className="relative py-2">
                  <Separator className="bg-border" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-background px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                     Modeller ({brand.models.length})
                  </span>
               </div>

               {/* Modeller */}
               <ModelForm brandId={brand.id} brandName={brand.name} models={brand.models} />
            </>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <h3 className="text-lg font-medium text-muted-foreground">
                  Marka bulunamadı
               </h3>
            </div>
         )}
      </div>
   )
}
