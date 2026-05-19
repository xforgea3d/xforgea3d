import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const csrfToken = req.headers.get('x-csrf-token')
      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      await prisma.notification.create({
         data: {
            userId,
            content: 'SMS aboneligi aktif edildi.',
            isRead: true,
         },
      })

      return NextResponse.json({ subscribed: true })
   } catch (error) {
      console.error('[PHONE_SUBSCRIBE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) return new NextResponse('Unauthorized', { status: 401 })

      const csrfToken = req.headers.get('x-csrf-token')
      if (!csrfToken || !verifyCsrfToken(csrfToken, userId)) {
         return new NextResponse('Gecersiz istek. Sayfayi yenileyip tekrar deneyin.', { status: 403 })
      }

      await prisma.notification.create({
         data: {
            userId,
            content: 'SMS aboneligi iptal edildi.',
            isRead: true,
         },
      })

      return NextResponse.json({ subscribed: false })
   } catch (error) {
      console.error('[PHONE_UNSUBSCRIBE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
