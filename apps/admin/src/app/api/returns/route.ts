import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
   try {
      const returnRequests = await prisma.returnRequest.findMany({
         include: {
            order: {
               select: { id: true, number: true, status: true, payable: true },
            },
            user: { select: { name: true, email: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 100,
      })

      return NextResponse.json(returnRequests)
   } catch (error) {
      console.error('[ADMIN_RETURNS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
