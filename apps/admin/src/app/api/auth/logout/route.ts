import { createClient } from '@/lib/supabase/server'
import { adminPath } from '@/lib/base-path'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
   const supabase = createClient()
   await supabase.auth.signOut()

   const response = NextResponse.redirect(new URL(adminPath('/login'), req.url))
   return response
}
