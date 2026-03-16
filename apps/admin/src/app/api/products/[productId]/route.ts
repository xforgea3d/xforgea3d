import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'
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
      await revalidateAllStorefront()

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

      const { title, description, price, discount, stock, isFeatured, isAvailable, images, keywords, categoryIds, carModelIds, brandId, productType, customOptions, flashSalePrice, flashSaleEndDate } = await req.json()

      // Validate numeric fields
      if (price !== undefined) {
         const n = Number(price)
         if (isNaN(n) || n < 0) return new NextResponse('Invalid price', { status: 400 })
      }
      if (discount !== undefined) {
         const n = Number(discount)
         if (isNaN(n) || n < 0) return new NextResponse('Invalid discount', { status: 400 })
      }
      if (stock !== undefined) {
         const n = Number(stock)
         if (isNaN(n) || n < 0 || !Number.isInteger(n)) return new NextResponse('Invalid stock', { status: 400 })
      }

      // Validate flash sale price: must be > 0 and less than the product's current price
      if (flashSalePrice !== undefined) {
         if (flashSalePrice !== null) {
            const fsPrice = Number(flashSalePrice)
            // Resolve effective price: use incoming price if provided, otherwise fetch existing
            const effectivePrice = price !== undefined ? Number(price) : (await prisma.product.findUnique({ where: { id: params.productId }, select: { price: true } }))?.price ?? 0
            if (isNaN(fsPrice) || fsPrice <= 0 || fsPrice >= effectivePrice) {
               return new NextResponse('Fırsat fiyatı 0\'dan büyük ve normal fiyattan küçük olmalıdır', { status: 400 })
            }
         }
      }

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
            ...(productType !== undefined && ['READY', 'CUSTOM'].includes(productType) && { productType }),
            ...(customOptions !== undefined && { customOptions }),
            ...(flashSalePrice !== undefined && { flashSalePrice: flashSalePrice ? Number(flashSalePrice) : null }),
            ...(flashSaleEndDate !== undefined && { flashSaleEndDate: flashSaleEndDate ? new Date(flashSaleEndDate) : null }),
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
      await revalidateAllStorefront()

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
