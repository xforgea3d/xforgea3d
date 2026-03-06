import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * POST /api/error-logs — PUBLIC (no auth needed, frontend errors from any user)
 * Logs client-side errors to the database
 */
export async function POST(req: Request) {
   try {
      const body = await req.json()
      const { message, stack, path, severity, source, metadata } = body

      if (!message || typeof message !== 'string') {
         return NextResponse.json({ error: 'message required' }, { status: 400 })
      }

      const userId = req.headers.get('X-USER-ID') || null

      await prisma.error.create({
         data: {
            message: message.slice(0, 2000),
            stack: stack?.slice(0, 10000) || null,
            severity: severity || 'medium',
            source: source || 'frontend',
            path: path?.slice(0, 500) || null,
            method: null,
            statusCode: null,
            userAgent: req.headers.get('user-agent')?.slice(0, 500) || null,
            ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()?.slice(0, 45) || null,
            userId,
            metadata: metadata || null,
         },
      })

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[ERROR_LOG_POST]', error)
      return NextResponse.json({ error: 'Log failed' }, { status: 500 })
   }
}
