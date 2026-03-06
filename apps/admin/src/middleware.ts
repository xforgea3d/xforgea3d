import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
   // Always allow auth API routes and upload/generate endpoints
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
      return NextResponse.redirect(new URL('/login', request.url))
   }

   // Verify admin role via Supabase - check profile table
   // We use a lightweight Supabase query to check admin role
   const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
         cookies: {
            get(name: string) {
               return request.cookies.get(name)?.value
            },
            set() {},
            remove() {},
         },
      }
   )

   const { data: profile } = await supabase
      .from('Profile')
      .select('role')
      .eq('id', user.id)
      .single()

   if (!profile || profile.role !== 'admin') {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/login?error=not_admin', request.url))
   }

   // Pass admin user ID in headers
   const requestHeaders = new Headers(request.headers)
   requestHeaders.set('X-USER-ID', user.id)

   const response = NextResponse.next({
      request: { headers: requestHeaders },
   })

   supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie as any)
   })

   return response
}

export const config = {
   matcher: [
      '/',
      '/products/:path*',
      '/categories/:path*',
      '/brands/:path*',
      '/banners/:path*',
      '/orders/:path*',
      '/payments/:path*',
      '/users/:path*',
      '/content/:path*',
      '/settings/:path*',
      '/car-brands/:path*',
      '/nav-items/:path*',
      '/quote-requests/:path*',
      '/api/:path*',
   ],
}
