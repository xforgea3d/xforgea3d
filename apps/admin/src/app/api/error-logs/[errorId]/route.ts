import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
   req: Request,
   { params }: { params: { errorId: string } }
) {
   try {
      const body = await req.json()
      const error = await prisma.error.update({
         where: { id: params.errorId },
         data: { resolved: body.resolved ?? true },
      })
      return NextResponse.json(error)
   } catch (error) {
      console.error('[ERROR_LOG_PATCH]', error)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { errorId: string } }
) {
   try {
      await prisma.error.delete({ where: { id: params.errorId } })
      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[ERROR_LOG_DELETE]', error)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
   }
}
