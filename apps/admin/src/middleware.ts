import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Tek yetkili admin — env variable ile ayarlanabilir
const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL
if (!ALLOWED_ADMIN_EMAIL) {
   throw new Error('ADMIN_EMAIL environment variable is required')
}

export async function middleware(request: NextRequest) {
   if (request.nextUrl.pathname.startsWith('/api/auth')) return NextResponse.next()

   function isTargetingAPI() {
      return request.nextUrl.pathname.startsWith('/api')
   }

   const { supabaseResponse, user } = await updateSession(request)

   if (!user) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
   }

   // Email kontrolü — sadece adminvolkan girebilir
   if (user.email !== ALLOWED_ADMIN_EMAIL) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/login?error=not_admin', request.url))
   }

   const requestHeaders = new Headers(request.headers)
   requestHeaders.set('X-USER-ID', user.id)

   const response = NextResponse.next({
      request: { headers: requestHeaders },
   })

   // Supabase session cookie'lerini koru
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
