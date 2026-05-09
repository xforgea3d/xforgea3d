import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
   if (request.nextUrl.pathname.startsWith('/api/auth')) return NextResponse.next()

   const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL

   const isLoginPage = request.nextUrl.pathname === '/login'

   function isTargetingAPI() {
      return request.nextUrl.pathname.startsWith('/api')
   }

   // Refresh Supabase session (reads/writes auth cookies)
   const { supabaseResponse, user } = await updateSession(request)

   // If user is on /login and already authenticated as admin, redirect to dashboard
   if (isLoginPage) {
      if (user && ALLOWED_ADMIN_EMAIL && user.email?.toLowerCase() === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
         const response = NextResponse.redirect(new URL('/', request.url))
         supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value, cookie as any)
         })
         return response
      }
      // Not authenticated or not admin — let them stay on login
      return supabaseResponse
   }

   if (!ALLOWED_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 })
   }

   if (!user) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
   }

   if (user.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/login?error=not_admin', request.url))
   }

   // Check 2FA requirement for sensitive operations
   const sensitivePathPatterns = [
      '/api/products/',
      '/api/orders/',
      '/api/payments/',
      '/api/users/',
      '/api/categories/',
   ]
   const isSensitiveOperation =
      sensitivePathPatterns.some(pattern => request.nextUrl.pathname.startsWith(pattern)) &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)

   if (isSensitiveOperation) {
      const twoFaVerified = request.headers.get('x-2fa-verified') === 'true'
      if (!twoFaVerified) {
         if (isTargetingAPI()) {
            return NextResponse.json(
               { error: 'TWO_FA_REQUIRED', redirect: '/api/admin/require-2fa' },
               { status: 403 }
            )
         }
         return NextResponse.redirect(new URL('/verify-2fa?next=' + encodeURIComponent(request.nextUrl.pathname), request.url))
      }
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
      '/login',
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
