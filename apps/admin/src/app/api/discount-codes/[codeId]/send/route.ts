import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
   req: Request,
   { params }: { params: { codeId: string } }
) {
   try {
      const { codeId } = params

      const discountCode = await prisma.discountCode.findUnique({
         where: { id: codeId },
      })

      if (!discountCode) {
         return new NextResponse('Discount code not found', { status: 404 })
      }

      const body = await req.json()
      const userIds: string[] = body.userIds ?? (body.userId ? [body.userId] : [])

      if (userIds.length === 0) {
         return new NextResponse('Bad Request: userId or userIds is required', { status: 400 })
      }

      const endDateStr = new Intl.DateTimeFormat('tr-TR', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      }).format(new Date(discountCode.endDate))

      const content = `Size ozel indirim kodu: ${discountCode.code} - %${discountCode.percent} indirim! Gecerlilik: ${endDateStr}`

      await prisma.notification.createMany({
         data: userIds.map(userId => ({
            userId,
            content,
         })),
      })

      return NextResponse.json({ success: true, count: userIds.length })
   } catch (error) {
      console.error('[DISCOUNT_CODE_SEND]', error)
      return new NextResponse('Internal Server Error', { status: 500 })
   }
}
