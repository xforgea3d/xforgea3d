import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
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
   } catch (error) {
      console.error('[GET_CART]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { productId, count, csrfToken } = await req.json()

      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      if (!productId || typeof count !== 'number') {
         return new NextResponse('productId ve count zorunlu', { status: 400 })
      }

      if (count > 99) {
         return new NextResponse('Maksimum 99 adet eklenebilir', { status: 400 })
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
   } catch (error) {
      console.error('[CART_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
