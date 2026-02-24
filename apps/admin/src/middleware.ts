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
      // Redirect unauthenticated users to login
      return NextResponse.redirect(new URL('/login', request.url))
   }

   // Set user context
   supabaseResponse.headers.set('X-USER-ID', user.id)

   return supabaseResponse
}

export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - login (login path doesn't need protection block)
       * Feel free to modify this pattern to include more paths.
       */
      '/((?!_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
   ],
}
