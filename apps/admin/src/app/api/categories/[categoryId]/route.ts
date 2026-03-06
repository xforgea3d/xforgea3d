import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function GET(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      if (!params.categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const category = await prisma.category.findUnique({
         where: {
            id: params.categoryId,
         },
      })

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORY_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      if (!params.categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const category = await prisma.category.delete({
         where: {
            id: params.categoryId,
         },
      })

      // Bust admin cache and storefront
      revalidatePath('/', 'layout')
      await revalidateStorefront(['/', '/products'])

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORY_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { categoryId: string } }
) {
   try {
      const body = await req.json()

      const { title, description, bannerId, imageUrl } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }

      const updatedCategory = await prisma.category.update({
         where: {
            id: params.categoryId,
         },
         data: {
            title,
            description,
            imageUrl,
            ...(bannerId && {
               banners: {
                  connect: { id: bannerId },
               },
            }),
         },
      })

      // Bust admin cache and storefront
      revalidatePath('/', 'layout')
      await revalidateStorefront(['/', '/products'])

      return NextResponse.json(updatedCategory)
   } catch (error) {
      console.error('[CATEGORY_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
