import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()

      if (!body.title) return new NextResponse('Title is required', { status: 400 })
      if (!body.brandId) return new NextResponse('Brand is required', { status: 400 })

      const price = Number(body.price ?? 0)
      const discount = Number(body.discount ?? 0)
      const stock = Number(body.stock ?? 1)
      if (isNaN(price) || price < 0) return new NextResponse('Invalid price', { status: 400 })
      if (isNaN(discount) || discount < 0) return new NextResponse('Invalid discount', { status: 400 })
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) return new NextResponse('Invalid stock', { status: 400 })

      // Validate discount < price
      if (discount >= price && discount > 0) {
         return new NextResponse('Indirim tutari fiyattan buyuk veya esit olamaz', { status: 400 })
      }

      // Validate flash sale price: must be > 0 and less than the product price
      if (body.flashSalePrice !== undefined && body.flashSalePrice !== null) {
         const fsPrice = Number(body.flashSalePrice)
         const productPrice = Number(body.price ?? 0)
         if (isNaN(fsPrice) || fsPrice <= 0 || fsPrice >= productPrice) {
            return new NextResponse('Fırsat fiyatı 0\'dan büyük ve normal fiyattan küçük olmalıdır', { status: 400 })
         }
      }

      const product = await prisma.product.create({
         data: {
            title: body.title,
            description: body.description,
            price,
            discount,
            stock,
            images: body.images ?? [],
            keywords: body.keywords ?? [],
            isFeatured: body.isFeatured ?? false,
            isAvailable: body.isAvailable ?? true,
            isPhysical: body.isPhysical ?? true,
            productType: ['READY', 'CUSTOM'].includes(body.productType) ? body.productType : 'READY',
            metadata: body.metadata,
            customOptions: body.customOptions,
            flashSalePrice: body.flashSalePrice ? Number(body.flashSalePrice) : null,
            flashSaleEndDate: body.flashSaleEndDate ? new Date(body.flashSaleEndDate) : null,
            brand: { connect: { id: body.brandId } },
            ...(body.categoryIds?.length && {
               categories: { connect: body.categoryIds.map((id: string) => ({ id })) },
            }),
            ...(body.carModelIds?.length && {
               carModels: { connect: body.carModelIds.map((id: string) => ({ id })) },
            }),
         },
         include: { brand: true, categories: true },
      })

      // Bust admin cache and storefront
      revalidatePath('/', 'layout')
      await revalidateAllStorefront()

      return NextResponse.json(product, { status: 201 })
   } catch (error) {
      console.error('[PRODUCTS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const isFeatured = searchParams.get('isFeatured')
      const includeSystem = searchParams.get('includeSystem') === 'true'

      const take = Math.min(Number(searchParams.get('limit')) || 200, 500)
      const skip = Math.max(Number(searchParams.get('offset')) || 0, 0)

      const products = await prisma.product.findMany({
         where: {
            ...(!includeSystem && { id: { not: 'quote-request-product' } }),
            ...(categoryId && { categories: { some: { id: categoryId } } }),
            ...(isFeatured !== null && { isFeatured: isFeatured === 'true' }),
         },
         include: { brand: true, categories: true, carModels: true },
         orderBy: { createdAt: 'desc' },
         take,
         skip,
      })

      return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
