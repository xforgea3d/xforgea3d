import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const profile = await prisma.profile.findUniqueOrThrow({
         where: { id: userId },
         include: {
            wishlist: {
               include: { brand: true, categories: true },
            },
         },
      })

      return NextResponse.json(profile.wishlist)
   } catch (error) {
      console.error('[WISHLIST_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { productId, csrfToken } = await req.json()
      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek', { status: 403 })
      }
      if (!productId) return new NextResponse('productId is required', { status: 400 })

      const profile = await prisma.profile.update({
         where: { id: userId },
         data: { wishlist: { connect: { id: productId } } },
         include: { wishlist: true },
      })

      return NextResponse.json(profile.wishlist)
   } catch (error) {
      console.error('[WISHLIST_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const { productId, csrfToken } = await req.json()
      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek', { status: 403 })
      }
      if (!productId) return new NextResponse('productId is required', { status: 400 })

      const profile = await prisma.profile.update({
         where: { id: userId },
         data: { wishlist: { disconnect: { id: productId } } },
         include: { wishlist: true },
      })

      return NextResponse.json(profile.wishlist)
   } catch (error) {
      console.error('[WISHLIST_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
