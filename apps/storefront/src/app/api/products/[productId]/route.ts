import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      if (!params.productId) {
         return new NextResponse('Product id is required', { status: 400 })
      }

      const product = await prisma.product.findUnique({
         where: { id: params.productId },
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
            productReviews: {
               select: {
                  id: true,
                  text: true,
                  rating: true,
                  createdAt: true,
               },
            },
            carModels: {
               select: {
                  id: true,
                  name: true,
               },
            },
            createdAt: true,
         },
      })

      if (!product) {
         return new NextResponse('Urun bulunamadi', { status: 404 })
      }

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
