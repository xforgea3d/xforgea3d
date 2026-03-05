import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
   try {
      const items = await prisma.navMenuItem.findMany({
         where: { isVisible: true },
         orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      })
      return NextResponse.json(items)
   } catch (error) {
      console.error('[NAV_ITEMS_GET]', error)
      return NextResponse.json([], { status: 200 })
   }
}
