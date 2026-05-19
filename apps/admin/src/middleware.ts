import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/admin07'
const ADMIN_2FA_REQUIRED = process.env.ADMIN_2FA_REQUIRED === 'true'
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function adminUrl(path: string, requestUrl: string) {
   const normalizedPath = path.startsWith('/') ? path : `/${path}`
   return new URL(`${BASE_PATH}${normalizedPath}`, requestUrl)
}

function stripBasePath(pathname: string) {
   if (BASE_PATH && pathname === BASE_PATH) return '/'
   if (BASE_PATH && pathname.startsWith(`${BASE_PATH}/`)) {
      return pathname.slice(BASE_PATH.length) || '/'
   }
   return pathname
}

async function isAdminRole(userId: string): Promise<boolean> {
   try {
      // Use service role key to bypass RLS (Profile table has recursive RLS policy)
      const admin = createClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data } = await admin
         .from('Profile')
         .select('role')
         .eq('id', userId)
         .single()
      return data?.role === 'admin'
   } catch {
      return false
   }
}

function normalizeOrigin(value?: string | null) {
   if (!value) return null
   try {
      return new URL(value).origin
   } catch {
      return null
   }
}

function getAllowedRequestOrigins(request: NextRequest) {
   return new Set(
      [
         normalizeOrigin(request.nextUrl.origin),
         normalizeOrigin(process.env.STOREFRONT_URL),
         normalizeOrigin(process.env.NEXT_PUBLIC_URL),
         normalizeOrigin(process.env.ADMIN_PUBLIC_URL),
         process.env.VERCEL_URL ? normalizeOrigin(`https://${process.env.VERCEL_URL}`) : null,
         'https://xforgea3d.com',
         'https://www.xforgea3d.com',
         'https://xforgea-admin.vercel.app',
      ].filter((origin): origin is string => Boolean(origin))
   )
}

function isAllowedMutatingOrigin(request: NextRequest) {
   const origin = normalizeOrigin(request.headers.get('origin'))
   const referer = normalizeOrigin(request.headers.get('referer'))
   const candidate = origin || referer

   if (!candidate) return false

   if (process.env.NODE_ENV !== 'production' && candidate.startsWith('http://localhost')) {
      return true
   }

   return getAllowedRequestOrigins(request).has(candidate)
}

export async function middleware(request: NextRequest) {
   const pathname = stripBasePath(request.nextUrl.pathname)

   if (pathname.startsWith('/api/auth')) return NextResponse.next()

   const isLoginPage = pathname === '/login'

   function isTargetingAPI() {
      return pathname.startsWith('/api')
   }

   // Refresh Supabase session (reads/writes auth cookies)
   const { supabaseResponse, user } = await updateSession(request)

   // If user is on /login and already authenticated as admin, redirect to dashboard
   if (isLoginPage) {
      if (user && await isAdminRole(user.id)) {
         const response = NextResponse.redirect(adminUrl('/', request.url))
         supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value, cookie as any)
         })
         return response
      }
      // Not authenticated or not admin — let them stay on login
      return supabaseResponse
   }

   if (!user) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      return NextResponse.redirect(adminUrl('/login', request.url))
   }

   if (!await isAdminRole(user.id)) {
      if (isTargetingAPI()) {
         return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
      }
      return NextResponse.redirect(adminUrl('/login?error=not_admin', request.url))
   }

   // Check 2FA requirement for sensitive operations
   const isMutatingApi = isTargetingAPI() && MUTATING_METHODS.has(request.method)
   const twoFaExemptApi =
      pathname.startsWith('/api/auth') ||
      pathname === '/api/admin/verify-2fa' ||
      pathname === '/api/health'
   const isSensitiveOperation = isMutatingApi && !twoFaExemptApi

   if (isMutatingApi && !isAllowedMutatingOrigin(request)) {
      return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 })
   }

   if (ADMIN_2FA_REQUIRED && isSensitiveOperation) {
      const twoFaVerified = request.cookies.get('admin-2fa-verified')?.value === 'true'
      if (!twoFaVerified) {
         if (isTargetingAPI()) {
            return NextResponse.json(
               { error: 'TWO_FA_REQUIRED', redirect: adminUrl('/verify-2fa', request.url).pathname },
               { status: 403 }
            )
         }
         return NextResponse.redirect(adminUrl('/verify-2fa?next=' + encodeURIComponent(pathname), request.url))
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
      '/verify-2fa',
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
      '/campaigns/:path*',
      '/discount-codes/:path*',
      '/error-logs/:path*',
      '/notifications/:path*',
      '/returns/:path*',
      '/api/:path*',
   ],
}
