import prisma from '@/lib/prisma'
import { QuoteRequestForm } from './components/quote-request-form'

export const metadata = {
   title: 'Parça Talep Et / Fiyat Al | xForgea3D',
   description: 'Aracınız için ihtiyacınız olan parçayı talep edin, size fiyat bildirelim.',
}

export default async function QuoteRequestPage() {
   const brands = await prisma.carBrand.findMany({
      include: { models: { select: { id: true, name: true, slug: true } } },
      orderBy: { sortOrder: 'asc' },
   })

   return (
      <div className="max-w-2xl mx-auto px-4 py-8">
         <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Parça Talep Et / Fiyat Al</h1>
            <p className="text-muted-foreground text-sm">
               Aracınız için ihtiyacınız olan parçayı bize bildirin.
               En kısa sürede fiyat bilgisi ile dönüş yapacağız.
            </p>
         </div>
         <QuoteRequestForm
            brands={brands.map((b) => ({
               id: b.id,
               name: b.name,
               models: b.models.map((m) => ({ id: m.id, name: m.name })),
            }))}
         />
      </div>
   )
}
