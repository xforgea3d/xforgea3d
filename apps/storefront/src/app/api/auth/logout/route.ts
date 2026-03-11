import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
   const supabase = createClient()
   await supabase.auth.signOut()

   const response = NextResponse.redirect(new URL('/login', req.url))
   response.cookies.set('logged-in', '', { path: '/', maxAge: 0 })
   return response
}
