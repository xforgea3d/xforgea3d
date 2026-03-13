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
      await prisma.carBrand.delete({
         where: { id: params.brandId },
      })
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[CAR_BRAND_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
