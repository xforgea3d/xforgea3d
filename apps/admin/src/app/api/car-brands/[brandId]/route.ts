import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const brand = await prisma.carBrand.findUnique({
         where: { id: params.brandId },
         include: {
            models: { orderBy: { name: 'asc' } },
         },
      })

      if (!brand) {
         return new NextResponse('Brand not found', { status: 404 })
      }

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[CAR_BRAND_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      const body = await req.json()
      const { name, slug, logoUrl, sortOrder } = body

      const brand = await prisma.carBrand.update({
         where: { id: params.brandId },
         data: {
            ...(name !== undefined && { name }),
            ...(slug !== undefined && { slug }),
            ...(logoUrl !== undefined && { logoUrl }),
            ...(sortOrder !== undefined && { sortOrder }),
         },
      })

      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[CAR_BRAND_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      // Pre-check: CarBrand cascade-deletes CarModels. Block if models have products or quotes.
      const models = await prisma.carModel.findMany({
         where: { brandId: params.brandId },
         select: { id: true },
      })
      if (models.length > 0) {
         const modelIds = models.map((m) => m.id)
         const [productCount, quoteCount] = await Promise.all([
            prisma.product.count({
               where: { carModels: { some: { id: { in: modelIds } } } },
            }),
            prisma.quoteRequest.count({
               where: { OR: [{ carBrandId: params.brandId }, { carModelId: { in: modelIds } }] },
            }),
         ])
         if (productCount > 0 || quoteCount > 0) {
            return new NextResponse(
               `Bu marka silinemez: ${models.length} model, ${productCount} urun ve ${quoteCount} teklif talebi bagli.`,
               { status: 409 }
            )
         }
      }

      await prisma.carBrand.delete({
         where: { id: params.brandId },
      })
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json({ ok: true })
   } catch (error: any) {
      console.error('[CAR_BRAND_DELETE]', error)
      if (error?.code === 'P2003') {
         return new NextResponse('Bu marka silinemez: bagli kayitlar mevcut.', { status: 409 })
      }
      return new NextResponse('Internal error', { status: 500 })
   }
}
