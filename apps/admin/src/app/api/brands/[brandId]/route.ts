import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      if (!params.brandId) return new NextResponse('Brand id is required', { status: 400 })

      const brand = await prisma.brand.findUnique({
         where: { id: params.brandId },
         include: { products: true },
      })
      if (!brand) return new NextResponse('Brand not found', { status: 404 })

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[BRAND_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      if (!params.brandId) return new NextResponse('Brand id is required', { status: 400 })

      const brand = await prisma.brand.delete({
         where: { id: params.brandId },
      })

      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[BRAND_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { brandId: string } }
) {
   try {
      if (!params.brandId) return new NextResponse('Brand id is required', { status: 400 })

      const body = await req.json()
      const { title, description, logo } = body

      if (!title && !description && !logo) {
         return new NextResponse('At least one field is required', { status: 400 })
      }

      const updatedBrand = await prisma.brand.update({
         where: { id: params.brandId },
         data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(logo !== undefined && { logo }),
         },
      })

      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(updatedBrand)
   } catch (error) {
      console.error('[BRAND_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
