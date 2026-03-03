import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Lightweight middleware — ONLY runs on truly protected routes.
 * Previously this fetched /api/maintenance-status on EVERY request,
 * adding a full Supabase round-trip (100-400ms) to every page load.
 * That fetch has been removed entirely; maintenance mode checks are
 * now handled at the component level if needed.
 */
export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl

   // ── Always allow public API routes ─────────────────────────────────────
   if (pathname.startsWith('/api/auth')) return NextResponse.next()
   if (pathname.startsWith('/api/custom-order')) return NextResponse.next()
   if (pathname.startsWith('/api/products')) return NextResponse.next()
   if (pathname.startsWith('/api/revalidate')) return NextResponse.next()
   if (pathname.startsWith('/api/search')) return NextResponse.next()
   if (pathname.startsWith('/api/car-brands')) return NextResponse.next()
   // Allow public POST to quote-requests (form submission without auth)
   if (pathname === '/api/quote-requests' && request.method === 'POST') return NextResponse.next()

   // ── Session check (only for protected paths) ───────────────────────────
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
   // ONLY protect these routes — do NOT run middleware on every page
   matcher: [
      '/profile/:path*',
      '/checkout/:path*',
      // We protect all APIs by default, but exclude public ones at the top of the function
      '/api/:path*'
   ],
}
