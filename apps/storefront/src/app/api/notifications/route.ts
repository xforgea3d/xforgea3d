import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const [notifications, unreadCount] = await Promise.all([
         prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
         }),
         prisma.notification.count({
            where: { userId, isRead: false },
         }),
      ])

      return NextResponse.json({ notifications, unreadCount })
   } catch (error) {
      console.error('[NOTIFICATIONS_GET]', error)
      return new NextResponse('Internal Server Error', { status: 500 })
   }
}

export async function PATCH(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')

      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const body = await req.json()

      if (body.all === true) {
         await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
         })
      } else if (Array.isArray(body.ids) && body.ids.length > 0) {
         await prisma.notification.updateMany({
            where: {
               id: { in: body.ids },
               userId,
            },
            data: { isRead: true },
         })
      } else {
         return new NextResponse('Bad Request: provide { ids: string[] } or { all: true }', {
            status: 400,
         })
      }

      return NextResponse.json({ success: true })
   } catch (error) {
      console.error('[NOTIFICATIONS_PATCH]', error)
      return new NextResponse('Internal Server Error', { status: 500 })
   }
}
