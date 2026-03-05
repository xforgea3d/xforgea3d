import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

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

      await revalidateStorefront(['/', '/products'])

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
      await prisma.carBrand.delete({
         where: { id: params.brandId },
      })
      await revalidateStorefront(['/', '/products'])

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[CAR_BRAND_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
