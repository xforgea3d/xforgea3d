import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
   try {
      const { searchParams } = new URL(req.url)
      const severity = searchParams.get('severity')
      const source = searchParams.get('source')
      const resolved = searchParams.get('resolved')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

      const where: any = {}
      if (severity) where.severity = severity
      if (source) where.source = source
      if (resolved !== null && resolved !== undefined) {
         where.resolved = resolved === 'true'
      }

      const [errors, total] = await Promise.all([
         prisma.error.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit,
         }),
         prisma.error.count({ where }),
      ])

      return NextResponse.json({ errors, total, page, limit })
   } catch (error) {
      console.error('[ERROR_LOGS_GET]', error)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
   }
}
