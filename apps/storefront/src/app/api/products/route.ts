import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
   try {
      const products = await prisma.product.findMany({
         where: { isAvailable: true },
         select: {
            id: true,
            title: true,
            description: true,
            images: true,
            price: true,
            discount: true,
            stock: true,
            isAvailable: true,
            isFeatured: true,
            productType: true,
            customOptions: true,
            keywords: true,
            brand: { select: { id: true, title: true, logo: true } },
            categories: { select: { id: true, title: true } },
            createdAt: true,
         },
         orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCT_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
