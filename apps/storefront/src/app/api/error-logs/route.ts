import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const severities = new Set(['low', 'medium', 'high', 'critical'])
const sources = new Set(['frontend', 'backend', 'middleware', 'payment', 'external'])

function stringOrNull(value: unknown, max: number) {
   return typeof value === 'string' && value.trim() ? value.slice(0, max) : null
}

function jsonOrNull(value: unknown): Prisma.InputJsonValue | undefined {
   if (!value || typeof value !== 'object') return undefined
   return value as Prisma.InputJsonValue
}

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
      const normalizedSeverity = severities.has(severity) ? severity : 'medium'
      const normalizedSource = sources.has(source) ? source : 'frontend'

      await prisma.error.create({
         data: {
            message: message.slice(0, 2000),
            stack: stringOrNull(stack, 10000),
            severity: normalizedSeverity,
            source: normalizedSource,
            path: stringOrNull(path, 500),
            method: null,
            statusCode: null,
            userAgent: req.headers.get('user-agent')?.slice(0, 500) || null,
            ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()?.slice(0, 45) || null,
            userId,
            metadata: jsonOrNull(metadata),
         },
      })

      return NextResponse.json({ ok: true })
   } catch (error) {
      console.error('[ERROR_LOG_POST]', error)
      return NextResponse.json({ error: 'Log failed' }, { status: 500 })
   }
}
