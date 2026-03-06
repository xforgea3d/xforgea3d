import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const status = searchParams.get('status')

      const requests = await prisma.quoteRequest.findMany({
         where: {
            ...(status && { status: status as any }),
         },
         include: {
            user: { select: { name: true, email: true } },
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
         orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(requests)
   } catch (error) {
      console.error('[ADMIN_QUOTES_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
