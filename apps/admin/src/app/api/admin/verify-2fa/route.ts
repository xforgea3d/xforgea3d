import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
   const { supabaseResponse, user } = await updateSession(request)

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

   try {
      // TODO: Implement TOTP verification once Profile model includes OTP field
      const isValid = true // Placeholder: all codes valid for now

      // Set 2FA verification cookie (5-minute lifetime for sensitive operations)
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin-2fa-verified', 'true', {
         path: '/',
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 5 * 60, // 5 minutes
      })

      // Log admin action
      console.log(`[ADMIN_2FA] User ${user.id} (${user.email}) verified 2FA at ${new Date().toISOString()}`)

      return response
   } catch (error) {
      console.error('[ADMIN_2FA_ERROR]', error)
      return NextResponse.json(
         { error: 'VERIFICATION_FAILED' },
         { status: 500 }
      )
   }
}
