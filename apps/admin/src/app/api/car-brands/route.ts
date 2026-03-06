import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function GET() {
   try {
      const brands = await prisma.carBrand.findMany({
         orderBy: { sortOrder: 'asc' },
         include: {
            models: {
               orderBy: { name: 'asc' },
            },
         },
      })
      return NextResponse.json(brands)
   } catch (error) {
      console.error('[CAR_BRANDS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { name, slug, logoUrl, sortOrder } = body

      if (!name || !slug) {
         return new NextResponse('Name and slug are required', { status: 400 })
      }

      const brand = await prisma.carBrand.create({
         data: { name, slug, logoUrl, sortOrder: sortOrder || 0 },
      })

      await revalidateStorefront(['/', '/products'])

      return NextResponse.json(brand)
   } catch (error) {
      console.error('[CAR_BRANDS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
