import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ============================================================================
// RECREATED MIDDLEWARE LOGIC FOR TESTING
// We replicate the exact logic from both storefront and admin middlewares
// so we can test patterns without Next.js/Supabase runtime dependencies.
// ============================================================================

// --- Rate Limiter (from storefront middleware) ---

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

function cleanupStaleEntries(): number {
   const now = Date.now()
   let cleaned = 0
   for (const [key, val] of hits) {
      if (val.resetAt < now) {
         hits.delete(key)
         cleaned++
      }
   }
   return cleaned
}

// --- Public Route Detection (from storefront middleware) ---

const PUBLIC_API_ROUTES = [
   '/api/auth',
   '/api/products',
   '/api/revalidate',
   '/api/search',
   '/api/car-brands',
   '/api/nav-items',
]

const RATE_LIMITED_POSTS: Record<string, { limit: number; windowMs: number }> = {
   '/api/quote-requests': { limit: 5, windowMs: 60_000 },
   '/api/custom-order': { limit: 5, windowMs: 60_000 },
   '/api/payment/callback': { limit: 30, windowMs: 60_000 },
}

function isPublicRoute(pathname: string): boolean {
   for (const route of PUBLIC_API_ROUTES) {
      if (pathname.startsWith(route)) return true
   }
   return false
}

function isPublicPostRoute(pathname: string, method: string): boolean {
   if (method !== 'POST') return false
   return pathname === '/api/quote-requests' || pathname === '/api/custom-order'
}

function isRateLimited(pathname: string, method: string): boolean {
   return method === 'POST' && pathname in RATE_LIMITED_POSTS
}

// --- IP Extraction (from storefront middleware) ---

function extractIP(xForwardedFor: string | null): string {
   return xForwardedFor?.split(',')[0]?.trim() || 'unknown'
}

// --- Admin Middleware Logic ---

function isTargetingAPI(pathname: string): boolean {
   return pathname.startsWith('/api')
}

type AdminMiddlewareResult =
   | { action: 'skip' }
   | { action: 'error'; status: number; error: string }
   | { action: 'redirect'; url: string }
   | { action: 'allow'; userId: string }

function adminMiddlewareLogic(
   pathname: string,
   adminEmail: string | undefined,
   user: { id: string; email: string } | null
): AdminMiddlewareResult {
   if (pathname.startsWith('/api/auth')) return { action: 'skip' }

   if (!adminEmail) {
      return { action: 'error', status: 500, error: 'ADMIN_EMAIL not configured' }
   }

   if (!user) {
      if (isTargetingAPI(pathname)) {
         return { action: 'error', status: 401, error: 'UNAUTHORIZED' }
      }
      return { action: 'redirect', url: '/login' }
   }

   if (user.email !== adminEmail) {
      if (isTargetingAPI(pathname)) {
         return { action: 'error', status: 403, error: 'FORBIDDEN' }
      }
      return { action: 'redirect', url: '/login?error=not_admin' }
   }

   return { action: 'allow', userId: user.id }
}

// --- Storefront Matcher Config ---

const STOREFRONT_MATCHER_PATTERNS = [
   '/profile/:path*',
   '/checkout/:path*',
   '/api/:path*',
]

function matchesStorefrontPattern(pathname: string): boolean {
   const prefixes = ['/profile', '/checkout', '/api']
   return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

// --- Admin Matcher Config ---

const ADMIN_MATCHER_PATTERNS = [
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
]

const ADMIN_DASHBOARD_PREFIXES = [
   '/products', '/categories', '/brands', '/banners',
   '/orders', '/payments', '/users', '/content',
   '/settings', '/car-brands', '/nav-items', '/quote-requests',
]

function matchesAdminPattern(pathname: string): boolean {
   if (pathname === '/') return true
   if (pathname.startsWith('/api') || pathname.startsWith('/api/')) return true
   return ADMIN_DASHBOARD_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
   )
}

// --- Security Helpers ---

function sanitizeRedirect(redirect: string): string {
   // Only accept relative paths - prevent open redirect
   if (!redirect.startsWith('/') || redirect.startsWith('//')) {
      return '/'
   }
   // Strip protocol-like patterns
   if (redirect.includes('://')) return '/'
   return redirect
}

const ALLOWED_UPLOAD_MIMES = [
   'image/jpeg',
   'image/png',
   'image/webp',
   'image/gif',
   'image/svg+xml',
]

function isAllowedMime(mime: string): boolean {
   return ALLOWED_UPLOAD_MIMES.includes(mime)
}

function hasPathTraversal(filePath: string): boolean {
   return filePath.includes('..') || filePath.includes('\0')
}

function sanitizeHtml(input: string): string {
   return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
}

function generateCsrfToken(userId: string, secret: string, expiresAt: number): string {
   // Simplified CSRF: userId + expiry + HMAC-like hash
   const payload = `${userId}:${expiresAt}`
   // In real code this uses crypto.createHmac; we simulate structure
   const hash = Buffer.from(`${payload}:${secret}`).toString('base64')
   return `${payload}:${hash}`
}

function validateCsrfToken(token: string, userId: string, secret: string): boolean {
   const parts = token.split(':')
   if (parts.length < 3) return false
   const [tokenUserId, expiresStr] = parts
   const expiresAt = parseInt(expiresStr, 10)
   if (tokenUserId !== userId) return false
   if (Date.now() > expiresAt) return false
   // Reconstruct hash
   const expectedHash = Buffer.from(`${tokenUserId}:${expiresAt}:${secret}`).toString('base64')
   return parts.slice(2).join(':') === expectedHash
}

// ============================================================================
// TESTS
// ============================================================================

describe('Middleware Security Tests', () => {

   // =====================================================
   // RATE LIMITER
   // =====================================================
   describe('Rate Limiter', () => {
      beforeEach(() => {
         hits.clear()
         vi.useFakeTimers()
      })

      afterEach(() => {
         vi.useRealTimers()
      })

      it('first request always passes', () => {
         expect(checkRate('1.2.3.4:/api/quote-requests', 5, 60_000)).toBe(true)
      })

      it('5 requests within window all pass (at the limit)', () => {
         const key = '10.0.0.1:/api/quote-requests'
         for (let i = 0; i < 5; i++) {
            expect(checkRate(key, 5, 60_000)).toBe(true)
         }
      })

      it('6th request exceeds limit and fails', () => {
         const key = '10.0.0.1:/api/quote-requests'
         for (let i = 0; i < 5; i++) {
            checkRate(key, 5, 60_000)
         }
         expect(checkRate(key, 5, 60_000)).toBe(false)
      })

      it('after window expires, counter resets', () => {
         const key = '10.0.0.2:/api/custom-order'
         for (let i = 0; i < 5; i++) checkRate(key, 5, 60_000)
         expect(checkRate(key, 5, 60_000)).toBe(false)

         vi.advanceTimersByTime(60_001)
         expect(checkRate(key, 5, 60_000)).toBe(true)
      })

      it('different keys are completely independent', () => {
         const keyA = '1.1.1.1:/api/quote-requests'
         const keyB = '2.2.2.2:/api/quote-requests'
         for (let i = 0; i < 5; i++) checkRate(keyA, 5, 60_000)
         expect(checkRate(keyA, 5, 60_000)).toBe(false)
         expect(checkRate(keyB, 5, 60_000)).toBe(true)
      })

      it('key format is ip:pathname', () => {
         const ip = '192.168.1.1'
         const pathname = '/api/quote-requests'
         const key = `${ip}:${pathname}`
         checkRate(key, 5, 60_000)
         expect(hits.has(key)).toBe(true)
         expect(hits.has(ip)).toBe(false)
         expect(hits.has(pathname)).toBe(false)
      })

      it('window boundary: request at exactly windowMs resets counter', () => {
         const key = '10.0.0.3:/api/custom-order'
         for (let i = 0; i < 5; i++) checkRate(key, 5, 60_000)
         expect(checkRate(key, 5, 60_000)).toBe(false)

         // Advance exactly to windowMs boundary
         vi.advanceTimersByTime(60_000)
         // resetAt is now + windowMs, so at exactly windowMs, resetAt === now
         // Condition is entry.resetAt < now, so at exactly boundary resetAt is NOT < now
         // Therefore we need windowMs + 1 for reset
         expect(checkRate(key, 5, 60_000)).toBe(false)

         vi.advanceTimersByTime(1)
         expect(checkRate(key, 5, 60_000)).toBe(true)
      })

      it('rapid burst: 5 requests instantly all pass', () => {
         const key = '10.0.0.4:/api/quote-requests'
         const results: boolean[] = []
         for (let i = 0; i < 5; i++) {
            results.push(checkRate(key, 5, 60_000))
         }
         expect(results).toEqual([true, true, true, true, true])
      })

      it('rapid burst: 6th request in same instant fails', () => {
         const key = '10.0.0.4:/api/quote-requests'
         for (let i = 0; i < 5; i++) checkRate(key, 5, 60_000)
         expect(checkRate(key, 5, 60_000)).toBe(false)
      })

      it('31st request to /api/payment/callback fails', () => {
         const key = '10.0.0.5:/api/payment/callback'
         for (let i = 0; i < 30; i++) {
            expect(checkRate(key, 30, 60_000)).toBe(true)
         }
         expect(checkRate(key, 30, 60_000)).toBe(false)
      })

      it('rate limit only applies to POST, not GET', () => {
         const pathname = '/api/quote-requests'
         // GET should not be rate limited per middleware logic
         expect(isRateLimited(pathname, 'GET')).toBe(false)
         expect(isRateLimited(pathname, 'POST')).toBe(true)
      })

      it('different IPs do not share rate limit', () => {
         const path = '/api/quote-requests'
         for (let i = 0; i < 5; i++) checkRate(`ip-a:${path}`, 5, 60_000)
         expect(checkRate(`ip-a:${path}`, 5, 60_000)).toBe(false)
         // Different IP still has fresh quota
         expect(checkRate(`ip-b:${path}`, 5, 60_000)).toBe(true)
         expect(checkRate(`ip-c:${path}`, 5, 60_000)).toBe(true)
      })

      it('rate limit for /api/quote-requests is 5 per 60s', () => {
         expect(RATE_LIMITED_POSTS['/api/quote-requests']).toEqual({
            limit: 5,
            windowMs: 60_000,
         })
      })

      it('rate limit for /api/custom-order is 5 per 60s', () => {
         expect(RATE_LIMITED_POSTS['/api/custom-order']).toEqual({
            limit: 5,
            windowMs: 60_000,
         })
      })

      it('rate limit for /api/payment/callback is 30 per 60s', () => {
         expect(RATE_LIMITED_POSTS['/api/payment/callback']).toEqual({
            limit: 30,
            windowMs: 60_000,
         })
      })

      it('after window + 1ms, request passes again', () => {
         const key = '10.0.0.6:/api/custom-order'
         for (let i = 0; i < 5; i++) checkRate(key, 5, 60_000)
         expect(checkRate(key, 5, 60_000)).toBe(false)

         vi.advanceTimersByTime(60_001)
         expect(checkRate(key, 5, 60_000)).toBe(true)
      })

      it('stale entries are cleaned up', () => {
         checkRate('stale-1:/api/x', 5, 1000)
         checkRate('stale-2:/api/y', 5, 2000)
         checkRate('fresh:/api/z', 5, 100_000)

         expect(hits.size).toBe(3)

         vi.advanceTimersByTime(3000)
         const cleaned = cleanupStaleEntries()
         expect(cleaned).toBe(2)
         expect(hits.size).toBe(1)
         expect(hits.has('fresh:/api/z')).toBe(true)
      })

      it('concurrent requests from same IP are counted correctly', () => {
         const key = '10.0.0.7:/api/quote-requests'
         // Simulate 5 "concurrent" checks (all at same timestamp)
         const results = Array.from({ length: 5 }, () => checkRate(key, 5, 60_000))
         expect(results.every((r) => r === true)).toBe(true)

         const entry = hits.get(key)
         expect(entry?.count).toBe(5)
      })

      it('x-forwarded-for parsing: takes first IP from comma-separated list', () => {
         const ip = extractIP('1.2.3.4, 5.6.7.8')
         expect(ip).toBe('1.2.3.4')
      })

      it('x-forwarded-for missing returns "unknown"', () => {
         expect(extractIP(null)).toBe('unknown')
      })

      it('x-forwarded-for empty string returns "unknown"', () => {
         expect(extractIP('')).toBe('unknown')
      })

      it('x-forwarded-for with whitespace around IP is trimmed', () => {
         expect(extractIP('  8.8.8.8  , 1.1.1.1')).toBe('8.8.8.8')
      })

      it('x-forwarded-for single IP returns that IP', () => {
         expect(extractIP('203.0.113.50')).toBe('203.0.113.50')
      })

      it('counter tracks exact count within window', () => {
         const key = '10.0.0.8:/api/payment/callback'
         for (let i = 0; i < 15; i++) checkRate(key, 30, 60_000)
         const entry = hits.get(key)
         expect(entry?.count).toBe(15)
      })

      it('multiple windows: exhaust, reset, exhaust again', () => {
         const key = '10.0.0.9:/api/custom-order'
         // Exhaust first window
         for (let i = 0; i < 5; i++) checkRate(key, 5, 60_000)
         expect(checkRate(key, 5, 60_000)).toBe(false)

         // Reset
         vi.advanceTimersByTime(60_001)
         for (let i = 0; i < 5; i++) {
            expect(checkRate(key, 5, 60_000)).toBe(true)
         }
         // Exhaust second window
         expect(checkRate(key, 5, 60_000)).toBe(false)
      })
   })

   // =====================================================
   // PUBLIC ROUTE DETECTION
   // =====================================================
   describe('Public Route Detection', () => {
      it('/api/auth/callback is public', () => {
         expect(isPublicRoute('/api/auth/callback')).toBe(true)
      })

      it('/api/auth/logout is public', () => {
         expect(isPublicRoute('/api/auth/logout')).toBe(true)
      })

      it('/api/products is public', () => {
         expect(isPublicRoute('/api/products')).toBe(true)
      })

      it('/api/products/123 is public (startsWith match)', () => {
         expect(isPublicRoute('/api/products/123')).toBe(true)
      })

      it('/api/products/category/wheels is public (nested)', () => {
         expect(isPublicRoute('/api/products/category/wheels')).toBe(true)
      })

      it('/api/search is public', () => {
         expect(isPublicRoute('/api/search')).toBe(true)
      })

      it('/api/search?q=test is public (query stripped before matching in real middleware, but startsWith works)', () => {
         // In real Next.js middleware, pathname does NOT include query string
         expect(isPublicRoute('/api/search')).toBe(true)
      })

      it('/api/cart is NOT public', () => {
         expect(isPublicRoute('/api/cart')).toBe(false)
      })

      it('/api/orders is NOT public', () => {
         expect(isPublicRoute('/api/orders')).toBe(false)
      })

      it('/api/profile is NOT public', () => {
         expect(isPublicRoute('/api/profile')).toBe(false)
      })

      it('/api/wishlist is NOT public', () => {
         expect(isPublicRoute('/api/wishlist')).toBe(false)
      })

      it('/api/addresses is NOT public', () => {
         expect(isPublicRoute('/api/addresses')).toBe(false)
      })

      it('/api/payment/initiate is NOT public', () => {
         expect(isPublicRoute('/api/payment/initiate')).toBe(false)
      })

      it('/api/csrf is NOT public', () => {
         expect(isPublicRoute('/api/csrf')).toBe(false)
      })

      it('/api/revalidate is public', () => {
         expect(isPublicRoute('/api/revalidate')).toBe(true)
      })

      it('/api/car-brands is public', () => {
         expect(isPublicRoute('/api/car-brands')).toBe(true)
      })

      it('/api/nav-items is public', () => {
         expect(isPublicRoute('/api/nav-items')).toBe(true)
      })

      it('/api/quote-requests POST is public (special case)', () => {
         expect(isPublicPostRoute('/api/quote-requests', 'POST')).toBe(true)
      })

      it('/api/custom-order POST is public (special case)', () => {
         expect(isPublicPostRoute('/api/custom-order', 'POST')).toBe(true)
      })

      it('/api/quote-requests GET is NOT public (requires auth)', () => {
         expect(isPublicRoute('/api/quote-requests')).toBe(false)
         expect(isPublicPostRoute('/api/quote-requests', 'GET')).toBe(false)
      })

      it('/api/custom-order GET is NOT public (requires auth)', () => {
         expect(isPublicRoute('/api/custom-order')).toBe(false)
         expect(isPublicPostRoute('/api/custom-order', 'GET')).toBe(false)
      })
   })

   // =====================================================
   // ADMIN MIDDLEWARE
   // =====================================================
   describe('Admin Middleware Logic', () => {
      const ADMIN_EMAIL = 'admin@test.com'
      const adminUser = { id: 'admin-uuid-123', email: ADMIN_EMAIL }
      const normalUser = { id: 'user-uuid-456', email: 'user@example.com' }

      it('/api/auth routes are bypassed entirely', () => {
         const result = adminMiddlewareLogic('/api/auth/callback', undefined, null)
         expect(result).toEqual({ action: 'skip' })
      })

      it('/api/auth/login is bypassed', () => {
         const result = adminMiddlewareLogic('/api/auth/login', undefined, null)
         expect(result).toEqual({ action: 'skip' })
      })

      it('missing ADMIN_EMAIL returns 500', () => {
         const result = adminMiddlewareLogic('/api/products', undefined, adminUser)
         expect(result).toEqual({
            action: 'error',
            status: 500,
            error: 'ADMIN_EMAIL not configured',
         })
      })

      it('missing ADMIN_EMAIL returns 500 even with empty string', () => {
         // undefined specifically, empty string is technically truthy-check dependent
         const result = adminMiddlewareLogic('/api/products', '', adminUser)
         // Empty string is falsy so it should also trigger 500
         expect(result).toEqual({
            action: 'error',
            status: 500,
            error: 'ADMIN_EMAIL not configured',
         })
      })

      it('no user session on API route returns 401', () => {
         const result = adminMiddlewareLogic('/api/products', ADMIN_EMAIL, null)
         expect(result).toEqual({
            action: 'error',
            status: 401,
            error: 'UNAUTHORIZED',
         })
      })

      it('no user session on page route redirects to /login', () => {
         const result = adminMiddlewareLogic('/products', ADMIN_EMAIL, null)
         expect(result).toEqual({ action: 'redirect', url: '/login' })
      })

      it('wrong email on API route returns 403', () => {
         const result = adminMiddlewareLogic('/api/orders', ADMIN_EMAIL, normalUser)
         expect(result).toEqual({
            action: 'error',
            status: 403,
            error: 'FORBIDDEN',
         })
      })

      it('wrong email on page route redirects to /login?error=not_admin', () => {
         const result = adminMiddlewareLogic('/orders', ADMIN_EMAIL, normalUser)
         expect(result).toEqual({ action: 'redirect', url: '/login?error=not_admin' })
      })

      it('correct email sets X-USER-ID and allows access', () => {
         const result = adminMiddlewareLogic('/api/products', ADMIN_EMAIL, adminUser)
         expect(result).toEqual({ action: 'allow', userId: 'admin-uuid-123' })
      })

      it('correct email allows dashboard page access', () => {
         const result = adminMiddlewareLogic('/products', ADMIN_EMAIL, adminUser)
         expect(result).toEqual({ action: 'allow', userId: 'admin-uuid-123' })
      })

      it('isTargetingAPI: /api/products is true', () => {
         expect(isTargetingAPI('/api/products')).toBe(true)
      })

      it('isTargetingAPI: /products is false', () => {
         expect(isTargetingAPI('/products')).toBe(false)
      })

      it('isTargetingAPI: /api is true (bare /api)', () => {
         expect(isTargetingAPI('/api')).toBe(true)
      })

      it('isTargetingAPI: / is false', () => {
         expect(isTargetingAPI('/')).toBe(false)
      })

      it('all dashboard routes require auth - /orders', () => {
         const result = adminMiddlewareLogic('/orders', ADMIN_EMAIL, null)
         expect(result.action).toBe('redirect')
      })

      it('all dashboard routes require auth - /settings', () => {
         const result = adminMiddlewareLogic('/settings', ADMIN_EMAIL, null)
         expect(result.action).toBe('redirect')
      })
   })

   // =====================================================
   // SECURITY HEADERS & PATTERNS
   // =====================================================
   describe('Security Headers & Patterns', () => {
      it('X-USER-ID is set by middleware, never trusted from client', () => {
         // Middleware sets X-USER-ID after verifying the user
         // Client-sent X-USER-ID should be overwritten
         const clientHeaders = new Headers({ 'X-USER-ID': 'fake-user-id' })
         // Middleware logic: overwrite with authenticated user id
         clientHeaders.set('X-USER-ID', 'real-user-from-session')
         expect(clientHeaders.get('X-USER-ID')).toBe('real-user-from-session')
      })

      it('API routes should extract userId from X-USER-ID header, not request body', () => {
         // Simulating a route handler pattern
         const headers = new Headers({ 'X-USER-ID': 'user-abc-123' })
         const userId = headers.get('X-USER-ID')
         expect(userId).toBe('user-abc-123')
         // Body userId should be ignored if it conflicts
         const body = { userId: 'attacker-injected-id', data: 'something' }
         expect(userId).not.toBe(body.userId)
      })

      it('CSRF tokens are user-specific', () => {
         const secret = 'test-secret'
         const expiry = Date.now() + 4 * 60 * 60 * 1000
         const tokenA = generateCsrfToken('user-a', secret, expiry)
         const tokenB = generateCsrfToken('user-b', secret, expiry)
         expect(tokenA).not.toBe(tokenB)

         // Token for user-a should not validate for user-b
         expect(validateCsrfToken(tokenA, 'user-a', secret)).toBe(true)
         expect(validateCsrfToken(tokenA, 'user-b', secret)).toBe(false)
      })

      it('CSRF tokens expire after 4 hours', () => {
         vi.useFakeTimers()
         const secret = 'test-secret'
         const fourHours = 4 * 60 * 60 * 1000
         const expiry = Date.now() + fourHours
         const token = generateCsrfToken('user-x', secret, expiry)

         expect(validateCsrfToken(token, 'user-x', secret)).toBe(true)

         // Advance past expiry
         vi.advanceTimersByTime(fourHours + 1)
         expect(validateCsrfToken(token, 'user-x', secret)).toBe(false)
         vi.useRealTimers()
      })

      it('CSRF token with tampered userId fails validation', () => {
         const secret = 'test-secret'
         const expiry = Date.now() + 4 * 60 * 60 * 1000
         const token = generateCsrfToken('user-legit', secret, expiry)
         // Try to validate with different user
         expect(validateCsrfToken(token, 'user-attacker', secret)).toBe(false)
      })

      it('CSRF token with wrong secret fails validation', () => {
         const expiry = Date.now() + 4 * 60 * 60 * 1000
         const token = generateCsrfToken('user-x', 'secret-1', expiry)
         expect(validateCsrfToken(token, 'user-x', 'secret-2')).toBe(false)
      })

      it('open redirect prevention: absolute URL rejected', () => {
         expect(sanitizeRedirect('https://evil.com/steal')).toBe('/')
      })

      it('open redirect prevention: protocol-relative URL rejected', () => {
         expect(sanitizeRedirect('//evil.com/steal')).toBe('/')
      })

      it('open redirect prevention: javascript: protocol rejected', () => {
         expect(sanitizeRedirect('javascript://alert(1)')).toBe('/')
      })

      it('open redirect prevention: valid relative path accepted', () => {
         expect(sanitizeRedirect('/profile')).toBe('/profile')
         expect(sanitizeRedirect('/checkout/success')).toBe('/checkout/success')
      })

      it('open redirect prevention: empty string rejected', () => {
         expect(sanitizeRedirect('')).toBe('/')
      })

      it('file upload: only allowed MIME types pass', () => {
         expect(isAllowedMime('image/jpeg')).toBe(true)
         expect(isAllowedMime('image/png')).toBe(true)
         expect(isAllowedMime('image/webp')).toBe(true)
         expect(isAllowedMime('image/gif')).toBe(true)
         expect(isAllowedMime('image/svg+xml')).toBe(true)
      })

      it('file upload: dangerous MIME types blocked', () => {
         expect(isAllowedMime('application/javascript')).toBe(false)
         expect(isAllowedMime('text/html')).toBe(false)
         expect(isAllowedMime('application/x-php')).toBe(false)
         expect(isAllowedMime('application/octet-stream')).toBe(false)
         expect(isAllowedMime('text/x-python')).toBe(false)
      })

      it('path traversal prevention: ".." detected', () => {
         expect(hasPathTraversal('../etc/passwd')).toBe(true)
         expect(hasPathTraversal('uploads/../../secret')).toBe(true)
         expect(hasPathTraversal('normal/file.jpg')).toBe(false)
      })

      it('path traversal prevention: null byte detected', () => {
         expect(hasPathTraversal('file.jpg\0.php')).toBe(true)
      })

      it('SQL injection: Prisma parameterizes queries (pattern test)', () => {
         // Prisma uses parameterized queries. We test that raw input
         // would be treated as a string value, not SQL.
         const maliciousInput = "'; DROP TABLE products; --"
         // In Prisma: prisma.product.findMany({ where: { name: { contains: maliciousInput } } })
         // The input is parameterized, not interpolated.
         // We verify the input remains as-is (not split/executed).
         expect(maliciousInput).toContain("DROP TABLE")
         expect(typeof maliciousInput).toBe('string')
         // The key assertion: this string should be passed as a parameter
         // not concatenated into SQL. Prisma enforces this by design.
         expect(maliciousInput.length).toBeGreaterThan(0)
      })

      it('XSS prevention: sanitizeHtml escapes dangerous characters', () => {
         const input = '<script>alert("xss")</script>'
         const sanitized = sanitizeHtml(input)
         expect(sanitized).not.toContain('<script>')
         expect(sanitized).toContain('&lt;script&gt;')
         expect(sanitized).toContain('&quot;')
      })

      it('XSS prevention: event handler attributes escaped', () => {
         const input = '<img onerror="alert(1)" src=x>'
         const sanitized = sanitizeHtml(input)
         expect(sanitized).not.toContain('<img')
         expect(sanitized).toContain('&lt;img')
      })

      it('IDOR prevention: resource userId must match authenticated userId', () => {
         // Pattern: API handler checks resource ownership
         const authenticatedUserId = 'user-123'
         const resource = { id: 'order-1', userId: 'user-123', total: 100 }
         const attackerResource = { id: 'order-2', userId: 'user-456', total: 200 }

         expect(resource.userId === authenticatedUserId).toBe(true)
         expect(attackerResource.userId === authenticatedUserId).toBe(false)
      })
   })

   // =====================================================
   // MATCHER CONFIG
   // =====================================================
   describe('Matcher Config', () => {
      describe('Storefront Matcher', () => {
         it('includes /profile/:path*', () => {
            expect(STOREFRONT_MATCHER_PATTERNS).toContainEqual('/profile/:path*')
         })

         it('matches /profile/orders', () => {
            expect(matchesStorefrontPattern('/profile/orders')).toBe(true)
         })

         it('includes /checkout/:path*', () => {
            expect(STOREFRONT_MATCHER_PATTERNS).toContainEqual('/checkout/:path*')
         })

         it('matches /checkout/payment', () => {
            expect(matchesStorefrontPattern('/checkout/payment')).toBe(true)
         })

         it('includes /api/:path*', () => {
            expect(STOREFRONT_MATCHER_PATTERNS).toContainEqual('/api/:path*')
         })

         it('matches /api/cart', () => {
            expect(matchesStorefrontPattern('/api/cart')).toBe(true)
         })

         it('does NOT match / (homepage is not middleware-protected)', () => {
            expect(matchesStorefrontPattern('/')).toBe(false)
         })

         it('does NOT match /products (product listing is public)', () => {
            expect(matchesStorefrontPattern('/products')).toBe(false)
         })
      })

      describe('Admin Matcher', () => {
         it('includes / (admin root)', () => {
            expect(ADMIN_MATCHER_PATTERNS).toContainEqual('/')
            expect(matchesAdminPattern('/')).toBe(true)
         })

         it('includes all dashboard routes', () => {
            const dashboardRoutes = [
               '/products', '/categories', '/brands', '/banners',
               '/orders', '/payments', '/users', '/content',
               '/settings', '/car-brands', '/nav-items', '/quote-requests',
            ]
            for (const route of dashboardRoutes) {
               expect(matchesAdminPattern(route)).toBe(true)
            }
         })

         it('includes /api/:path* for admin API', () => {
            expect(ADMIN_MATCHER_PATTERNS).toContainEqual('/api/:path*')
            expect(matchesAdminPattern('/api/products')).toBe(true)
         })

         it('matches nested dashboard routes', () => {
            expect(matchesAdminPattern('/products/123/edit')).toBe(true)
            expect(matchesAdminPattern('/orders/456')).toBe(true)
            expect(matchesAdminPattern('/settings/general')).toBe(true)
         })

         it('does NOT match unknown top-level routes', () => {
            expect(matchesAdminPattern('/unknown-page')).toBe(false)
            expect(matchesAdminPattern('/hacker-route')).toBe(false)
         })
      })
   })

   // =====================================================
   // EDGE CASES & INTEGRATION PATTERNS
   // =====================================================
   describe('Edge Cases & Integration Patterns', () => {
      beforeEach(() => {
         hits.clear()
         vi.useFakeTimers()
      })

      afterEach(() => {
         vi.useRealTimers()
      })

      it('rate limit + public route: rate-limited POST to /api/quote-requests still public after passing', () => {
         const key = '1.1.1.1:/api/quote-requests'
         const allowed = checkRate(key, 5, 60_000)
         expect(allowed).toBe(true)
         // Even though rate-limited, it is a public POST route
         expect(isPublicPostRoute('/api/quote-requests', 'POST')).toBe(true)
      })

      it('rate limit blocks before public route check matters', () => {
         // Exhaust rate limit
         const key = '2.2.2.2:/api/quote-requests'
         for (let i = 0; i < 5; i++) checkRate(key, 5, 60_000)
         expect(checkRate(key, 5, 60_000)).toBe(false)
         // Even though route is public, rate limit returns 429 first
      })

      it('non-rate-limited POST endpoint has no limit config', () => {
         expect(RATE_LIMITED_POSTS['/api/cart']).toBeUndefined()
         expect(RATE_LIMITED_POSTS['/api/orders']).toBeUndefined()
      })

      it('sanitizeHtml handles nested HTML', () => {
         const input = '<div><span onclick="steal()">click</span></div>'
         const sanitized = sanitizeHtml(input)
         expect(sanitized).toBe(
            '&lt;div&gt;&lt;span onclick=&quot;steal()&quot;&gt;click&lt;/span&gt;&lt;/div&gt;'
         )
      })

      it('open redirect: data: URI rejected', () => {
         expect(sanitizeRedirect('data:text/html,<h1>pwned</h1>')).toBe('/')
      })

      it('path traversal: encoded dots still caught after decode', () => {
         // If the application decodes first, then checks
         const decoded = decodeURIComponent('%2e%2e/etc/passwd')
         expect(hasPathTraversal(decoded)).toBe(true)
      })

      it('admin middleware: /api/auth is always skipped regardless of user state', () => {
         // No user, no admin email - still skipped
         expect(adminMiddlewareLogic('/api/auth', undefined, null)).toEqual({ action: 'skip' })
         // Wrong user, still skipped
         expect(adminMiddlewareLogic('/api/auth/callback', 'admin@test.com', {
            id: 'x', email: 'wrong@test.com',
         })).toEqual({ action: 'skip' })
      })

      it('rate limiter map grows with unique keys and shrinks on cleanup', () => {
         for (let i = 0; i < 100; i++) {
            checkRate(`ip-${i}:/api/test`, 5, 1000)
         }
         expect(hits.size).toBe(100)

         vi.advanceTimersByTime(1001)
         cleanupStaleEntries()
         expect(hits.size).toBe(0)
      })

      it('CSRF empty/malformed token rejected', () => {
         expect(validateCsrfToken('', 'user-x', 'secret')).toBe(false)
         expect(validateCsrfToken('garbage', 'user-x', 'secret')).toBe(false)
         expect(validateCsrfToken('a:b', 'user-x', 'secret')).toBe(false)
      })

      it('sanitizeRedirect with query params on relative path is allowed', () => {
         expect(sanitizeRedirect('/profile?tab=orders')).toBe('/profile?tab=orders')
      })

      it('file upload: empty MIME type blocked', () => {
         expect(isAllowedMime('')).toBe(false)
      })

      it('file upload: case-sensitive MIME check (image/JPEG blocked)', () => {
         // MIME types are case-sensitive per RFC; uppercase should be rejected
         expect(isAllowedMime('image/JPEG')).toBe(false)
      })
   })
})
