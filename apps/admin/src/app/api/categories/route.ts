import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()

      const { title, description, bannerId, imageUrl } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }

      // Create a new category
      const category = await prisma.category.create({
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
      await revalidateAllStorefront()

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORIES_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      // Find all categories
      const categories = await prisma.category.findMany({ take: 200, orderBy: { title: 'asc' } })

      return NextResponse.json(categories)
   } catch (error) {
      console.error('[CATEGORIES_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
