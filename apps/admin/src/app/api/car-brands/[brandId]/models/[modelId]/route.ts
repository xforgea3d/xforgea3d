import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(
   req: Request,
   { params }: { params: { brandId: string; modelId: string } }
) {
   try {
      const body = await req.json()
      const { name, slug, imageUrl, yearRange } = body

      // Verify model belongs to this brand
      const existing = await prisma.carModel.findFirst({
         where: { id: params.modelId, brandId: params.brandId },
      })
      if (!existing) {
         return new NextResponse('Model not found for this brand', { status: 404 })
      }

      const model = await prisma.carModel.update({
         where: { id: params.modelId },
         data: {
            ...(name !== undefined && { name }),
            ...(slug !== undefined && { slug }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(yearRange !== undefined && { yearRange }),
         },
      })

      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(model)
   } catch (error: any) {
      console.error('[CAR_MODEL_PATCH]', error)
      if (error?.code === 'P2002') {
         return new NextResponse('Bu slug bu marka altinda zaten mevcut', { status: 409 })
      }
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { brandId: string; modelId: string } }
) {
   try {
      // Pre-check: block if products or quote requests reference this model
      const [productCount, quoteCount] = await Promise.all([
         prisma.product.count({ where: { carModels: { some: { id: params.modelId } } } }),
         prisma.quoteRequest.count({ where: { carModelId: params.modelId } }),
      ])
      if (productCount > 0 || quoteCount > 0) {
         return new NextResponse(
            `Bu model silinemez: ${productCount} urun ve ${quoteCount} teklif talebi bagli.`,
            { status: 409 }
         )
      }

      await prisma.carModel.delete({
         where: { id: params.modelId },
      })
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json({ ok: true })
   } catch (error: any) {
      console.error('[CAR_MODEL_DELETE]', error)
      if (error?.code === 'P2003') {
         return new NextResponse('Bu model silinemez: bagli kayitlar mevcut.', { status: 409 })
      }
      return new NextResponse('Internal error', { status: 500 })
   }
}
