import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const revalidate = 60 // cache for 60 seconds

export async function GET(request: Request) {
   try {
      const now = new Date()

      const campaigns = await prisma.campaign.findMany({
         where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
         },
         orderBy: { priority: 'desc' },
         take: 1,
         include: {
            discountCode: {
               select: {
                  id: true,
                  code: true,
                  percent: true,
                  maxDiscountAmount: true,
               },
            },
            products: {
               select: { id: true },
            },
            _count: { select: { products: true } },
         },
      })

      // Increment views only for real users (not bots), fire-and-forget
      const ua = request.headers.get('user-agent') || ''
      const isBot = /bot|crawl|spider|slurp|googlebot|bingbot|yandex/i.test(ua)
      if (!isBot && campaigns.length > 0) {
         prisma.$transaction(
            campaigns.map((c) =>
               prisma.campaign.update({
                  where: { id: c.id },
                  data: { views: { increment: 1 } },
               })
            )
         ).catch(() => {})
      }

      return NextResponse.json(campaigns)
   } catch (error) {
      console.error('[CAMPAIGNS_ACTIVE_GET]', error)
      return NextResponse.json([])
   }
}

export async function POST(request: Request) {
   try {
      const { campaignId } = await request.json()
      if (!campaignId) return NextResponse.json({ ok: false })
      await prisma.campaign.update({
         where: { id: campaignId },
         data: { clicks: { increment: 1 } },
      }).catch(() => {})
      return NextResponse.json({ ok: true })
   } catch {
      return NextResponse.json({ ok: false })
   }
}
