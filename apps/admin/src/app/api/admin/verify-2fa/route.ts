import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

// Rate limiting: per-user attempt tracking
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
   const now = Date.now()
   const record = attempts.get(userId)

   if (record && now < record.resetAt) {
      if (record.count >= 3) {
         return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
      }
      record.count++
      return { allowed: true }
   }

   // Reset or create new window (10 minutes)
   attempts.set(userId, { count: 1, resetAt: now + 10 * 60 * 1000 })
   return { allowed: true }
}

function clearRateLimit(userId: string) {
   attempts.delete(userId)
}

function safeCompare(a: string, b: string): boolean {
   if (a.length !== b.length) return false
   return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export async function POST(request: NextRequest) {
   const { user } = await updateSession(request)

   if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
   }

   const { code } = await request.json() as { code?: string }

   if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
         { error: 'INVALID_CODE' },
         { status: 400 }
      )
   }

   // Rate limit check
   const rateCheck = checkRateLimit(user.id)
   if (!rateCheck.allowed) {
      return NextResponse.json(
         { error: 'TOO_MANY_ATTEMPTS', retryAfter: rateCheck.retryAfter },
         { status: 429 }
      )
   }

   try {
      const configuredCode = process.env.ADMIN_2FA_CODE

      if (!configuredCode || !/^\d{6}$/.test(configuredCode)) {
         return NextResponse.json(
            { error: 'TWO_FA_NOT_CONFIGURED' },
            { status: 503 }
         )
      }

      if (!safeCompare(code, configuredCode)) {
         return NextResponse.json(
            { error: 'INVALID_CODE' },
            { status: 401 }
         )
      }

      // Success — clear rate limit
      clearRateLimit(user.id)

      // Set 2FA verification cookie (5-minute lifetime for sensitive operations)
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-2fa-verified', 'true', {
         path: '/',
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 5 * 60, // 5 minutes
      })

      // Log admin action (no PII)
      console.log(`[ADMIN_2FA] 2FA verified at ${new Date().toISOString()}`)

      return response
   } catch (error) {
      console.error('[ADMIN_2FA_ERROR]', error)
      return NextResponse.json(
         { error: 'VERIFICATION_FAILED' },
         { status: 500 }
      )
   }
}
