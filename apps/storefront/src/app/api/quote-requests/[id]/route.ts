import prisma from '@/lib/prisma'
import { logError, extractRequestContext } from '@/lib/error-logger'
import { NextResponse } from 'next/server'

/**
 * GET /api/quote-requests/[id] — PROTECTED
 * Returns detail of a single quote request (must belong to user)
 */
export async function GET(
   req: Request,
   { params }: { params: { id: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }

      const quoteRequest = await prisma.quoteRequest.findFirst({
         where: { id: params.id, userId },
         include: {
            carBrand: { select: { name: true, slug: true } },
            carModel: { select: { name: true, slug: true } },
            order: { select: { id: true, number: true, status: true, isPaid: true } },
         },
      })

      if (!quoteRequest) {
         return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
      }

      return NextResponse.json(quoteRequest)
   } catch (error: any) {
      console.error('[QUOTE_DETAIL]', error)
      logError({
         message: error?.message || '[QUOTE_DETAIL] Unhandled error',
         stack: error?.stack,
         severity: 'critical',
         source: 'backend',
         statusCode: 500,
         ...extractRequestContext(req),
      })
      return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
   }
}
