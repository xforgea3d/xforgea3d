import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
   // Always allow auth API routes
   if (request.nextUrl.pathname.startsWith('/api/auth')) return NextResponse.next()

   function isTargetingAPI() {
      return request.nextUrl.pathname.startsWith('/api')
   }

   // Update session using Supabase SSR
   const { supabaseResponse, user } = await updateSession(request)

   if (!user) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      // Redirect unauthenticated users to login, preserving the intended destination
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
   }

   // Set user context
   supabaseResponse.headers.set('X-USER-ID', user.id)

   return supabaseResponse
}

export const config = {
   // Only protect profile and checkout — everything else is public
   matcher: ['/profile/:path*', '/checkout/:path*', '/api/:path*'],
}
