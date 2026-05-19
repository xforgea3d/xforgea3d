import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (per Vercel instance)
const hits = new Map<string, { count: number; resetAt: number }>()
function checkRate(key: string, limit: number, windowMs: number): boolean {
   const now = Date.now()
   const entry = hits.get(key)
   if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return true
   }
   entry.count++
   return entry.count <= limit
}

// Cleanup stale entries
if (typeof globalThis !== 'undefined') {
   const g = globalThis as any
   if (!g.__rateLimitCleanup) {
      g.__rateLimitCleanup = setInterval(() => {
         const now = Date.now()
         for (const [key, val] of hits) {
            if (val.resetAt < now) hits.delete(key)
         }
      }, 60_000)
   }
}

function isPublicApiRequest(pathname: string, method: string): boolean {
   if (pathname.startsWith('/api/auth')) return true
   if (pathname === '/api/revalidate' && method === 'POST') return true
   if (pathname === '/api/error-logs' && method === 'POST') return true
   if (pathname === '/api/search' && method === 'GET') return true
   if (pathname === '/api/car-brands' && method === 'GET') return true
   if (pathname === '/api/nav-items' && method === 'GET') return true
   if (pathname === '/api/categories' && method === 'GET') return true
   if (pathname === '/api/collections' && method === 'GET') return true
   if (pathname === '/api/maintenance-status' && method === 'GET') return true
   if (pathname === '/api/health' && method === 'GET') return true
   if (pathname === '/api/site-settings' && method === 'GET') return true
   if (pathname === '/api/campaigns/active' && ['GET', 'POST'].includes(method)) return true
   if (pathname === '/api/custom-order/colors' && method === 'GET') return true
   if (pathname === '/api/products' && method === 'GET') return true
   if (/^\/api\/products\/[^/]+$/.test(pathname) && method === 'GET') return true
   if (/^\/api\/products\/[^/]+\/reviews$/.test(pathname) && method === 'GET') return true
   return false
}

// Mutating HTTP methods that require CSRF protection
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// API routes exempt from CSRF check (webhooks, callbacks, server-to-server)
const CSRF_EXEMPT_ROUTES = [
   '/api/revalidate',
   '/api/payment/callback',
   '/api/auth',
   '/api/csrf',
   '/api/error-logs',
]

// Rate-limited public POST endpoints
const RATE_LIMITED_POSTS: Record<string, { limit: number; windowMs: number }> = {
   '/api/quote-requests': { limit: 5, windowMs: 60_000 },
   '/api/custom-order': { limit: 5, windowMs: 60_000 },
   '/api/payment/callback': { limit: 30, windowMs: 60_000 },
   '/api/error-logs': { limit: 20, windowMs: 60_000 },
   '/api/auth/send-otp': { limit: 5, windowMs: 60_000 },
   '/api/auth/verify-otp': { limit: 10, windowMs: 60_000 },
   '/api/auth/forgot-password': { limit: 3, windowMs: 60_000 },
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
         normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
         normalizeOrigin(process.env.NEXT_PUBLIC_URL),
         normalizeOrigin(process.env.SITE_URL),
         process.env.VERCEL_URL ? normalizeOrigin(`https://${process.env.VERCEL_URL}`) : null,
         'https://xforgea3d.com',
         'https://www.xforgea3d.com',
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

function isOriginExemptRequest(pathname: string) {
   return (
      pathname.startsWith('/api/auth') ||
      pathname === '/api/revalidate' ||
      pathname === '/api/payment/callback' ||
      pathname === '/api/error-logs'
   )
}

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl
   const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

   // Rate limit public POST endpoints
   const rlConfig = RATE_LIMITED_POSTS[pathname]
   if (rlConfig && request.method === 'POST') {
      if (!checkRate(`${ip}:${pathname}`, rlConfig.limit, rlConfig.windowMs)) {
         return NextResponse.json(
            { error: 'Cok fazla istek. Lutfen bekleyin.' },
            { status: 429 }
         )
      }
   }

   if (
      pathname.startsWith('/api/') &&
      MUTATING_METHODS.has(request.method) &&
      !isOriginExemptRequest(pathname) &&
      !isAllowedMutatingOrigin(request)
   ) {
      return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 })
   }

   if (isPublicApiRequest(pathname, request.method)) return NextResponse.next()

   // Allow public POST to quote-requests and custom-order (no auth required)
   // But still try to resolve user session so userId can be attached if logged in
   if (
      (pathname === '/api/quote-requests' && request.method === 'POST') ||
      (pathname === '/api/custom-order' && request.method === 'POST')
   ) {
      try {
         const { supabaseResponse, user } = await updateSession(request)
         if (user) {
            request.headers.set('X-USER-ID', user.id)
            const response = NextResponse.next({ request: { headers: request.headers } })
            for (const cookie of supabaseResponse.cookies.getAll()) {
               response.cookies.set(cookie)
            }
            return response
         }
      } catch {
         console.warn('[middleware] Optional session resolution failed for public submission')
      }
      return NextResponse.next()
   }

   // Session check (only for protected paths)
   const { supabaseResponse, user } = await updateSession(request)

   if (user?.id === 'pending-refresh' && pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'SESSION_REFRESH_REQUIRED' }, { status: 401 })
   }

   if (!user) {
      if (pathname.startsWith('/api/')) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      // IMPORTANT: Copy cookies from supabaseResponse to the redirect response.
      // updateSession() may have set/cleared auth cookies (e.g. expired token removal).
      // Creating a fresh NextResponse.redirect() would lose those Set-Cookie headers,
      // causing stale cookies to persist and potential redirect loops.
      const redirectResponse = NextResponse.redirect(loginUrl)
      supabaseResponse.cookies.getAll().forEach(cookie => {
         redirectResponse.cookies.set(cookie.name, cookie.value, {
            ...(cookie as any),
         })
      })
      return redirectResponse
   }

   // CSRF protection: enforce token presence for authenticated mutating requests
   if (pathname.startsWith('/api/') && MUTATING_METHODS.has(request.method)) {
      const isCsrfExempt = CSRF_EXEMPT_ROUTES.some(route => pathname.startsWith(route))
      if (!isCsrfExempt) {
         const csrfToken = request.headers.get('x-csrf-token')
         if (!csrfToken) {
            return NextResponse.json(
               { error: 'CSRF token eksik. Sayfayi yenileyip tekrar deneyin.' },
               { status: 403 }
            )
         }
      }
   }

   request.headers.set('X-USER-ID', user.id)
   const finalResponse = NextResponse.next({ request: { headers: request.headers } })
   for (const cookie of supabaseResponse.cookies.getAll()) {
      finalResponse.cookies.set(cookie)
   }
   return finalResponse
}

export const config = {
   matcher: [
      '/profile/:path*',
      '/checkout/:path*',
      '/payment/:path*',
      '/api/:path*',
   ],
}
