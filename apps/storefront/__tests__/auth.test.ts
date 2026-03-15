import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Auth Tests
// ---------------------------------------------------------------------------

const mockExchangeCodeForSession = vi.fn()
const mockSignOut = vi.fn()

// Mock @supabase/ssr createServerClient used by callback
vi.mock('@supabase/ssr', () => ({
   createServerClient: () => ({
      auth: {
         exchangeCodeForSession: mockExchangeCodeForSession,
      },
   }),
}))

// Mock next/headers cookies()
const mockCookieStore: Record<string, any> = {}
vi.mock('next/headers', () => ({
   cookies: () => ({
      get: (name: string) => mockCookieStore[name] ? { value: mockCookieStore[name] } : undefined,
      set: (opts: any) => { mockCookieStore[typeof opts === 'string' ? opts : opts.name] = typeof opts === 'string' ? '' : opts.value },
   }),
}))

// Mock Supabase server client for logout route
vi.mock('@/lib/supabase/server', () => ({
   createClient: () => ({
      auth: { signOut: mockSignOut },
   }),
}))
vi.mock('@storefront/lib/supabase/server', () => ({
   createClient: () => ({
      auth: { signOut: mockSignOut },
   }),
}))

// Mock next/server
vi.mock('next/server', () => {
   class MockNextResponse extends Response {
      cookies: any
      constructor(body?: BodyInit | null, init?: ResponseInit) {
         super(body, init)
         const store: Record<string, any> = {}
         this.cookies = {
            set: (nameOrObj: any, value?: string, opts?: any) => {
               if (typeof nameOrObj === 'object') {
                  store[nameOrObj.name] = { ...nameOrObj }
               } else {
                  store[nameOrObj] = { name: nameOrObj, value, ...opts }
               }
            },
            get: (name: string) => store[name],
            getAll: () => Object.values(store),
         }
      }
      static json(data: any, init?: ResponseInit) {
         return new MockNextResponse(JSON.stringify(data), {
            ...init,
            headers: { 'content-type': 'application/json', ...init?.headers },
         })
      }
      static redirect(url: string | URL) {
         const target = typeof url === 'string' ? url : url.toString()
         const res = new MockNextResponse(null, { status: 307, headers: { location: target } })
         ;(res as any)._redirectUrl = target
         return res
      }
      static next() { return new MockNextResponse(null, { status: 200 }) }
   }
   return {
      NextResponse: MockNextResponse,
      NextRequest: class extends Request {
         nextUrl: URL
         constructor(input: string | URL, init?: RequestInit) {
            super(input, init)
            this.nextUrl = new URL(typeof input === 'string' ? input : input.toString())
         }
      },
   }
})

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// ---------------------------------------------------------------------------
// Auth Callback Route Tests
// ---------------------------------------------------------------------------

describe('Auth Callback Route', () => {
   beforeEach(() => {
      vi.clearAllMocks()
      Object.keys(mockCookieStore).forEach(k => delete mockCookieStore[k])
   })

   it('should exchange code for session on valid OAuth callback', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      const { GET } = await import('@storefront/app/auth/callback/route')
      const url = 'https://xforgea3d.com/auth/callback?code=test-auth-code&next=/'
      const request = new Request(url) as any
      request.nextUrl = new URL(url)
      Object.defineProperty(request, 'url', { value: url })
      const response = await GET(request)
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-auth-code')
      expect(response.status).toBe(307)
   })

   it('should redirect to / when next parameter is missing', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      const { GET } = await import('@storefront/app/auth/callback/route')
      const url = 'https://xforgea3d.com/auth/callback?code=valid-code'
      const request = new Request(url) as any
      request.nextUrl = new URL(url)
      Object.defineProperty(request, 'url', { value: url })
      const response = await GET(request)
      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).toMatch(/\/$/)
   })

   it('should sanitize next parameter to prevent open redirect', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      const { GET } = await import('@storefront/app/auth/callback/route')
      const url = 'https://xforgea3d.com/auth/callback?code=test-code&next=//evil.com'
      const request = new Request(url) as any
      request.nextUrl = new URL(url)
      Object.defineProperty(request, 'url', { value: url })
      const response = await GET(request)
      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).not.toContain('evil.com')
   })

   it('should redirect to login when no code is provided', async () => {
      const { GET } = await import('@storefront/app/auth/callback/route')
      const url = 'https://xforgea3d.com/auth/callback'
      const request = new Request(url) as any
      request.nextUrl = new URL(url)
      Object.defineProperty(request, 'url', { value: url })
      const response = await GET(request)
      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).toContain('/login')
      expect(redirectUrl).toContain('error=auth_callback_failed')
   })

   it('should redirect to login when session exchange fails', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: new Error('Invalid code') })
      const { GET } = await import('@storefront/app/auth/callback/route')
      const url = 'https://xforgea3d.com/auth/callback?code=expired-code'
      const request = new Request(url) as any
      request.nextUrl = new URL(url)
      Object.defineProperty(request, 'url', { value: url })
      const response = await GET(request)
      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).toContain('/login')
   })

   it('should set logged-in cookie on successful callback', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })
      const { GET } = await import('@storefront/app/auth/callback/route')
      const url = 'https://xforgea3d.com/auth/callback?code=valid-code'
      const request = new Request(url) as any
      request.nextUrl = new URL(url)
      Object.defineProperty(request, 'url', { value: url })
      const response = await GET(request)
      const cookie = (response as any).cookies?.get('logged-in')
      expect(cookie).toBeDefined()
      expect(cookie.value).toBe('true')
   })
})

// ---------------------------------------------------------------------------
// Logout Route Tests
// ---------------------------------------------------------------------------

describe('Auth Logout Route', () => {
   beforeEach(() => { vi.clearAllMocks(); mockSignOut.mockResolvedValue({ error: null }) })

   it('should call supabase signOut', async () => {
      const { GET } = await import('@storefront/app/api/auth/logout/route')
      const request = new Request('https://xforgea3d.com/api/auth/logout') as any
      Object.defineProperty(request, 'url', { value: 'https://xforgea3d.com/api/auth/logout' })
      await GET(request)
      expect(mockSignOut).toHaveBeenCalled()
   })

   it('should return JSON success response after logout', async () => {
      const { GET } = await import('@storefront/app/api/auth/logout/route')
      const request = new Request('https://xforgea3d.com/api/auth/logout') as any
      Object.defineProperty(request, 'url', { value: 'https://xforgea3d.com/api/auth/logout' })
      const response = await GET(request)
      const body = await response.json()
      expect(body.success).toBe(true)
   })

   it('should clear logged-in cookie on logout', async () => {
      const { GET } = await import('@storefront/app/api/auth/logout/route')
      const request = new Request('https://xforgea3d.com/api/auth/logout') as any
      Object.defineProperty(request, 'url', { value: 'https://xforgea3d.com/api/auth/logout' })
      const response = await GET(request)
      const cookie = (response as any).cookies?.get('logged-in')
      expect(cookie).toBeDefined()
      expect(cookie.value).toBe('')
   })
})

// ---------------------------------------------------------------------------
// Authentication cookie check logic tests
// ---------------------------------------------------------------------------

describe('Authentication cookie check logic', () => {
   it('should detect logged-in=true cookie', () => {
      const cookies = 'logged-in=true; theme=dark'
      const loggedIn = cookies.split(';').find(c => c.trim().startsWith('logged-in'))?.split('=')[1] === 'true'
      expect(loggedIn).toBe(true)
   })
   it('should return false when logged-in cookie is absent', () => {
      const loggedIn = 'theme=dark'.split(';').find(c => c.trim().startsWith('logged-in'))?.split('=')[1] === 'true'
      expect(loggedIn).toBe(false)
   })
   it('should return false when logged-in cookie is explicitly false', () => {
      const loggedIn = 'logged-in=false'.split(';').find(c => c.trim().startsWith('logged-in'))?.split('=')[1] === 'true'
      expect(loggedIn).toBe(false)
   })
   it('should handle empty cookie string gracefully', () => {
      const loggedIn = ''.split(';').find(c => c.trim().startsWith('logged-in'))?.split('=')[1] === 'true'
      expect(loggedIn).toBe(false)
   })
})

// ---------------------------------------------------------------------------
// Redirect safety tests
// ---------------------------------------------------------------------------

describe('Auth redirect safety', () => {
   function sanitizeRedirect(raw: string | null): string {
      if (!raw) return '/'
      if (raw.startsWith('/') && !raw.startsWith('//')) return raw
      return '/'
   }
   it('should allow normal relative paths', () => {
      expect(sanitizeRedirect('/profile')).toBe('/profile')
   })
   it('should reject protocol-relative URLs', () => {
      expect(sanitizeRedirect('//evil.com')).toBe('/')
   })
   it('should reject absolute URLs', () => {
      expect(sanitizeRedirect('https://evil.com')).toBe('/')
   })
   it('should default to / for null', () => {
      expect(sanitizeRedirect(null)).toBe('/')
   })
   it('should default to / for empty string', () => {
      expect(sanitizeRedirect('')).toBe('/')
   })
})
