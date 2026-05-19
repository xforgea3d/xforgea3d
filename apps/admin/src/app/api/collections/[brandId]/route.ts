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

      // Disconnect all products from this brand first
      await prisma.product.updateMany({
         where: { brandId: params.brandId },
         data: { brandId: { set: null } },
      })

      const brand = await prisma.brand.delete({
         where: { id: params.brandId },
      })

      revalidatePath('/collections')
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

      // Check if title conflicts with another brand (not this one)
      if (title) {
         const existing = await prisma.brand.findFirst({
            where: { title, id: { not: params.brandId } },
         })
         if (existing) {
            return new NextResponse('Bu koleksiyon adı zaten kullanılıyor', { status: 400 })
         }
      }

      const data: Record<string, any> = {}
      if (title !== undefined && title !== '') data.title = title
      if (description !== undefined) data.description = description || null
      if (logo !== undefined) data.logo = logo || null

      const updatedBrand = await prisma.brand.update({
         where: { id: params.brandId },
         data,
      })

      revalidatePath('/collections')
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(updatedBrand)
   } catch (error: any) {
      console.error('[BRAND_PATCH]', error)
      if (error?.code === 'P2002') {
         return new NextResponse('Bu koleksiyon adı zaten kullanılıyor', { status: 400 })
      }
      return new NextResponse('Internal error', { status: 500 })
   }
}
