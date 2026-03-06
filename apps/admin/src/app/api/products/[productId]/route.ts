import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'
import { revalidatePath } from 'next/cache'

export async function GET(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      if (!params.productId) {
         return new NextResponse('Product id is required', { status: 400 })
      }

      const product = await prisma.product.findUniqueOrThrow({
         where: {
            id: params.productId,
         },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const product = await prisma.product.delete({
         where: {
            id: params.productId,
         },
      })

      // Bust admin layout cache and storefront pages
      revalidatePath('/', 'layout')
      await revalidateStorefront(['/', '/products', `/products/${params.productId}`])

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      if (!params.productId) {
         return new NextResponse('Product Id is required', { status: 400 })
      }

      const { title, description, price, discount, stock, isFeatured, isAvailable, images, keywords, categoryIds, carModelIds, brandId, productType, customOptions } = await req.json()

      const product = await prisma.product.update({
         where: { id: params.productId },
         data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price: Number(price) }),
            ...(discount !== undefined && { discount: Number(discount) }),
            ...(stock !== undefined && { stock: Number(stock) }),
            ...(isFeatured !== undefined && { isFeatured }),
            ...(isAvailable !== undefined && { isAvailable }),
            ...(images !== undefined && { images }),
            ...(keywords !== undefined && { keywords }),
            ...(brandId !== undefined && { brand: { connect: { id: brandId } } }),
            ...(productType !== undefined && { productType }),
            ...(customOptions !== undefined && { customOptions }),
            ...(categoryIds !== undefined && {
               categories: { set: categoryIds.map((id: string) => ({ id })) },
            }),
            ...(carModelIds !== undefined && {
               carModels: { set: carModelIds.map((id: string) => ({ id })) },
            }),
         },
         include: { brand: true, categories: true, carModels: true },
      })

      // Bust admin layout cache and storefront pages
      revalidatePath('/', 'layout')
      await revalidateStorefront(['/', '/products', `/products/${params.productId}`])

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
