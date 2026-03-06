import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
   try {
      const brands = await prisma.brand.findMany({
         orderBy: { title: 'asc' },
         select: {
            id: true,
            title: true,
            description: true,
            logo: true,
            _count: { select: { products: true } },
         },
      })

      return NextResponse.json(brands)
   } catch (error) {
      console.error('[COLLECTIONS_GET]', error)
      return NextResponse.json([], { status: 200 })
   }
}
