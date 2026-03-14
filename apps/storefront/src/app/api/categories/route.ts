import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
   try {
      const categories = await prisma.category.findMany({
         where: { isVisible: true },
         orderBy: { title: 'asc' },
         select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            _count: { select: { products: true } },
         },
      })

      return NextResponse.json(categories)
   } catch (error) {
      console.error('[CATEGORIES_GET]', error)
      return NextResponse.json([], { status: 200 })
   }
}
