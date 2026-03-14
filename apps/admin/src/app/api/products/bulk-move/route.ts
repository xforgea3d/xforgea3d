import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { ids, brandId } = body

      if (!Array.isArray(ids) || ids.length === 0) {
         return new NextResponse('ids array is required', { status: 400 })
      }

      if (!brandId || typeof brandId !== 'string') {
         return new NextResponse('brandId is required', { status: 400 })
      }

      // Verify brand exists
      const brand = await prisma.brand.findUnique({ where: { id: brandId } })
      if (!brand) {
         return new NextResponse('Brand not found', { status: 404 })
      }

      // Filter out sentinel product
      const safeIds = ids.filter((id: string) => id !== 'quote-request-product')

      await prisma.product.updateMany({
         where: { id: { in: safeIds } },
         data: { brandId },
      })

      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json({ moved: safeIds.length, brandId })
   } catch (error: any) {
      console.error('[PRODUCTS_BULK_MOVE]', error)
      return new NextResponse(error?.message || 'Internal error', { status: 500 })
   }
}
