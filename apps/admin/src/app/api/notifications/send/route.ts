import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { content } = body

      if (!content || typeof content !== 'string') {
         return new NextResponse('Bad Request: content is required', { status: 400 })
      }

      // Support both single userId and multiple userIds
      const userIds: string[] = body.userIds ?? (body.userId ? [body.userId] : [])

      if (userIds.length === 0) {
         return new NextResponse('Bad Request: userId or userIds is required', { status: 400 })
      }

      await prisma.notification.createMany({
         data: userIds.map(userId => ({
            userId,
            content,
         })),
      })

      return NextResponse.json({ success: true, count: userIds.length })
   } catch (error) {
      console.error('[NOTIFICATIONS_SEND]', error)
      return new NextResponse('Internal Server Error', { status: 500 })
   }
}
