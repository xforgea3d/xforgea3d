import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(
   req: Request,
   { params }: { params: { itemId: string } }
) {
   try {
      const body = await req.json()
      const { label, href, section, sortOrder, isVisible, icon, badge } = body

      const item = await prisma.navMenuItem.update({
         where: { id: params.itemId },
         data: {
            ...(label !== undefined && { label }),
            ...(href !== undefined && { href }),
            ...(section !== undefined && { section }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(isVisible !== undefined && { isVisible }),
            ...(icon !== undefined && { icon }),
            ...(badge !== undefined && { badge }),
         },
      })

      await revalidateAllStorefront()

      return NextResponse.json(item)
   } catch (error: any) {
      console.error('[NAV_ITEM_PATCH]', error)
      if (error?.code === 'P2025') return new NextResponse('Not found', { status: 404 })
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { itemId: string } }
) {
   try {
      await prisma.navMenuItem.delete({
         where: { id: params.itemId },
      })

      await revalidateAllStorefront()

      return NextResponse.json({ ok: true })
   } catch (error: any) {
      console.error('[NAV_ITEM_DELETE]', error)
      if (error?.code === 'P2025') return new NextResponse('Not found', { status: 404 })
      return new NextResponse('Internal error', { status: 500 })
   }
}
