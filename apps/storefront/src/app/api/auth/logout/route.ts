import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
   const supabase = createClient()
   await supabase.auth.signOut()

   const response = NextResponse.json({ success: true })
   response.cookies.set('logged-in', '', { path: '/', maxAge: 0 })
   return response
}
