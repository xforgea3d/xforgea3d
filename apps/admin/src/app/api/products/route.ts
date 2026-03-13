import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()

      if (!body.title) return new NextResponse('Title is required', { status: 400 })
      if (!body.brandId) return new NextResponse('Brand is required', { status: 400 })

      const product = await prisma.product.create({
         data: {
            title: body.title,
            description: body.description,
            price: Number(body.price ?? 0),
            discount: Number(body.discount ?? 0),
            stock: Number(body.stock ?? 1),
            images: body.images ?? [],
            keywords: body.keywords ?? [],
            isFeatured: body.isFeatured ?? false,
            isAvailable: body.isAvailable ?? true,
            isPhysical: body.isPhysical ?? true,
            productType: ['READY', 'CUSTOM'].includes(body.productType) ? body.productType : 'READY',
            metadata: body.metadata,
            customOptions: body.customOptions,
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

      const products = await prisma.product.findMany({
         where: {
            ...(categoryId && { categories: { some: { id: categoryId } } }),
            ...(isFeatured !== null && { isFeatured: isFeatured === 'true' }),
         },
         include: { brand: true, categories: true, carModels: true },
         orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
