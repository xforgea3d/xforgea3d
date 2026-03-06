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

// Public API routes that don't need auth
const PUBLIC_API_ROUTES = [
   '/api/auth',
   '/api/products',
   '/api/revalidate',
   '/api/search',
   '/api/car-brands',
   '/api/nav-items',
   '/api/error-logs',
]

// Rate-limited public POST endpoints
const RATE_LIMITED_POSTS: Record<string, { limit: number; windowMs: number }> = {
   '/api/quote-requests': { limit: 5, windowMs: 60_000 },
   '/api/custom-order': { limit: 5, windowMs: 60_000 },
   '/api/payment/callback': { limit: 30, windowMs: 60_000 },
   '/api/error-logs': { limit: 20, windowMs: 60_000 },
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

   // Always allow public API routes
   for (const route of PUBLIC_API_ROUTES) {
      if (pathname.startsWith(route)) return NextResponse.next()
   }

   // Allow public POST to quote-requests (form submission without auth)
   if (pathname === '/api/quote-requests' && request.method === 'POST') return NextResponse.next()
   // Allow public POST to custom-order
   if (pathname === '/api/custom-order' && request.method === 'POST') return NextResponse.next()

   // Session check (only for protected paths)
   const { supabaseResponse, user } = await updateSession(request)

   if (!user) {
      if (pathname.startsWith('/api/')) {
         return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
      }
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
   }

   supabaseResponse.headers.set('X-USER-ID', user.id)
   return supabaseResponse
}

export const config = {
   matcher: [
      '/profile/:path*',
      '/checkout/:path*',
      '/api/:path*',
   ],
}
