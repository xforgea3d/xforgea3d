import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
   try {
      const [pendingOrders, pendingQuotes, pendingReturns, unreadErrors] = await Promise.all([
         prisma.order.count({
            where: { status: 'OnayBekleniyor' },
         }),
         prisma.quoteRequest.count({
            where: { status: 'Pending' },
         }),
         prisma.returnRequest.count({
            where: { status: 'Pending' },
         }),
         prisma.error.count({
            where: { resolved: false, severity: { in: ['critical', 'high'] } },
         }),
      ])

      return NextResponse.json({
         orders: pendingOrders,
         quotes: pendingQuotes,
         returns: pendingReturns,
         errors: unreadErrors,
      })
   } catch (error) {
      console.error('[NOTIFICATION_COUNTS]', error)
      return NextResponse.json({ orders: 0, quotes: 0, returns: 0, errors: 0 })
   }
}
