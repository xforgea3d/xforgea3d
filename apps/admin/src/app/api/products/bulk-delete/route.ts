import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { ids } = body

      if (!Array.isArray(ids) || ids.length === 0) {
         return new NextResponse('ids array is required', { status: 400 })
      }

      // Filter out sentinel product
      const safeIds = ids.filter((id: string) => id !== 'quote-request-product')

      if (safeIds.length === 0) {
         return new NextResponse('No valid product ids provided', { status: 400 })
      }

      // Delete in batches to avoid transaction timeout
      const BATCH_SIZE = 10
      for (let i = 0; i < safeIds.length; i += BATCH_SIZE) {
         const batch = safeIds.slice(i, i + BATCH_SIZE)
         await prisma.$transaction(async (tx) => {
            // Delete related cart items
            await tx.cartItem.deleteMany({
               where: { productId: { in: batch } },
            })

            // Delete related product reviews
            await tx.productReview.deleteMany({
               where: { productId: { in: batch } },
            })

            // Disconnect wishlist relations (many-to-many, just disconnect)
            for (const id of batch) {
               await tx.product.update({
                  where: { id },
                  data: {
                     wishlists: { set: [] },
                     categories: { set: [] },
                     carModels: { set: [] },
                  },
               })
            }

            // Delete order items
            await tx.orderItem.deleteMany({
               where: { productId: { in: batch } },
            })

            // Delete the products
            await tx.product.deleteMany({
               where: { id: { in: batch } },
            })
         }, { timeout: 30000 })
      }

      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json({ deleted: safeIds.length })
   } catch (error: any) {
      console.error('[PRODUCTS_BULK_DELETE]', error)
      return new NextResponse(error?.message || 'Internal error', { status: 500 })
   }
}
