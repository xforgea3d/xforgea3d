import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
   try {
      const brands = await prisma.carBrand.findMany({
         orderBy: { sortOrder: 'asc' },
         include: {
            models: {
               orderBy: { name: 'asc' },
               select: {
                  id: true,
                  name: true,
                  slug: true,
                  imageUrl: true,
                  yearRange: true,
               },
            },
         },
      })

      return NextResponse.json(brands)
   } catch (error) {
      console.error('[CAR_BRANDS_GET]', error)
      return NextResponse.json([], { status: 200 })
   }
}
