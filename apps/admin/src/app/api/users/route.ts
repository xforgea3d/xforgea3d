import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
   try {
      const users = await prisma.profile.findMany({
         select: {
            id: true,
            email: true,
            name: true,
         },
         orderBy: { createdAt: 'desc' },
         take: 500,
      })

      return NextResponse.json(users)
   } catch (error) {
      console.error('[USERS_LIST]', error)
      return new NextResponse('Internal Server Error', { status: 500 })
   }
}
