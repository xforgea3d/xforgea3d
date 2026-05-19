import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      let cart = await prisma.cart.findUnique({
         where: { userId },
         include: {
            items: {
               include: {
                  product: {
                     select: {
                        id: true,
                        title: true,
                        price: true,
                        discount: true,
                        images: true,
                        isAvailable: true,
                        stock: true,
                     },
                  },
               },
            },
         },
      })

      if (!cart) {
         cart = await prisma.cart.create({
            data: { user: { connect: { id: userId } } },
            include: {
               items: {
                  include: {
                     product: {
                        select: {
                           id: true,
                           title: true,
                           price: true,
                           discount: true,
                           images: true,
                           isAvailable: true,
                           stock: true,
                        },
                     },
                  },
               },
            },
         })
      }

      return NextResponse.json(cart)
   } catch (error: any) {
      console.error('[GET_CART]', error)
      logError({
         message: error?.message || '[GET_CART] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      let body: any
      try {
         body = await req.json()
      } catch {
         return new NextResponse('Geçersiz istek gövdesi', { status: 400 })
      }
      const { productId, count, csrfToken } = body

      // Verify CSRF token from body or header
      const headerCsrf = (req as any).headers?.get?.('x-csrf-token') || csrfToken
      if (!headerCsrf || !verifyCsrfToken(headerCsrf, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      if (!productId || !Number.isInteger(count) || count < 0 || count > 99) {
         return new NextResponse('productId zorunlu, count 0-99 arasi tam sayi olmali', { status: 400 })
      }

      // Soft stock check (hard check at order creation with row locking)
      if (count > 0) {
         const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, isAvailable: true },
         })
         if (!product || !product.isAvailable) {
            return new NextResponse('Bu urun mevcut degil', { status: 400 })
         }
         if (count > product.stock) {
            return NextResponse.json(
               { error: `Stokta yalnizca ${product.stock} adet mevcut` },
               { status: 400 }
            )
         }
      }

      if (count < 1) {
         await prisma.cartItem.delete({
            where: { UniqueCartItem: { cartId: userId, productId } },
         })
      } else {
         await prisma.cart.upsert({
            where: { userId },
            create: {
               user: { connect: { id: userId } },
               items: { create: { productId, count } },
            },
            update: {
               items: {
                  upsert: {
                     where: { UniqueCartItem: { cartId: userId, productId } },
                     update: { count },
                     create: { productId, count },
                  },
               },
            },
         })
      }

      const cart = await prisma.cart.findUniqueOrThrow({
         where: { userId },
         include: {
            items: {
               include: {
                  product: {
                     select: {
                        id: true,
                        title: true,
                        price: true,
                        discount: true,
                        images: true,
                        isAvailable: true,
                        stock: true,
                     },
                  },
               },
            },
         },
      })

      return NextResponse.json(cart)
   } catch (error: any) {
      console.error('[CART_POST]', error)
      logError({
         message: error?.message || '[CART_POST] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return new NextResponse('Internal error', { status: 500 })
   }
}
