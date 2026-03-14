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

      revalidatePath('/brands')
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

      // Build update data, treating empty strings as valid values (clearing a field)
      const data: Record<string, any> = {}
      if (title !== undefined && title !== '') data.title = title
      if (description !== undefined) data.description = description || null
      if (logo !== undefined) data.logo = logo || null

      // If title was sent as empty but is the only field, keep existing title
      // At minimum we need the brand to exist, so just do a touch-update
      const updatedBrand = await prisma.brand.update({
         where: { id: params.brandId },
         data,
      })

      revalidatePath('/brands')
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(updatedBrand)
   } catch (error: any) {
      console.error('[BRAND_PATCH]', error)
      const message = error?.message || 'Internal error'
      return new NextResponse(message, { status: 500 })
   }
}
