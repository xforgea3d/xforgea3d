import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET() {
   try {
      const items = await prisma.navMenuItem.findMany({
         take: 100,
         orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      })
      return NextResponse.json(items)
   } catch (error) {
      console.error('[NAV_ITEMS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { label, href, section, sortOrder, isVisible, icon, badge } = body

      if (!label || !href) {
         return new NextResponse('Label and href are required', { status: 400 })
      }

      const item = await prisma.navMenuItem.create({
         data: {
            label,
            href,
            section: section || 'main',
            sortOrder: sortOrder ?? 0,
            isVisible: isVisible ?? true,
            icon: icon || null,
            badge: badge || null,
         },
      })

      await revalidateAllStorefront()

      return NextResponse.json(item)
   } catch (error) {
      console.error('[NAV_ITEMS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PUT(req: Request) {
   try {
      const body = await req.json()
      const { items } = body as { items: Array<{ id: string; sortOrder: number; isVisible: boolean }> }

      if (!Array.isArray(items)) {
         return new NextResponse('Items array is required', { status: 400 })
      }

      await prisma.$transaction(
         items.map((item) =>
            prisma.navMenuItem.update({
               where: { id: item.id },
               data: { sortOrder: item.sortOrder, isVisible: item.isVisible },
            })
         )
      )

      await revalidateAllStorefront()

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[NAV_ITEMS_PUT]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
