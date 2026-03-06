import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function POST(req: Request) {
   try {
      const body = await req.json()

      const { title, description, logo } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }

      const brand = await prisma.brand.create({
         data: {
            title,
            description,
            logo,
         },
      })

      revalidatePath('/', 'layout')
      await revalidateStorefront(['/', '/products'])

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[BRANDS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const brands = await prisma.brand.findMany({})

      return NextResponse.json(brands)
   } catch (error) {
      console.error('[BRANDS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
