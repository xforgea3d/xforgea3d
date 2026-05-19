import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_QUOTE_STATUSES = ['Pending', 'Priced', 'Accepted', 'Rejected', 'Completed'] as const

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const status = searchParams.get('status')

      if (status && !VALID_QUOTE_STATUSES.includes(status as any)) {
         return new NextResponse('Invalid status value', { status: 400 })
      }

      const requests = await prisma.quoteRequest.findMany({
         where: {
            ...(status && { status: status as (typeof VALID_QUOTE_STATUSES)[number] }),
         },
         include: {
            user: { select: { name: true, email: true } },
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 500,
      })

      return NextResponse.json(requests)
   } catch (error) {
      console.error('[ADMIN_QUOTES_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
