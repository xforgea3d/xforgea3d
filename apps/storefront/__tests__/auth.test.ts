import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Auth Tests
// ---------------------------------------------------------------------------

// Mock Supabase server client — the routes import from '@/lib/supabase/server'
// which resolves via vitest alias to '@admin/lib/supabase/server' or similar.
// We mock it at all possible paths.
const mockExchangeCodeForSession = vi.fn()
const mockSignOut = vi.fn()

function createMockSupabase() {
   return {
      auth: {
         exchangeCodeForSession: mockExchangeCodeForSession,
         signOut: mockSignOut,
      },
   }
}

vi.mock('@/lib/supabase/server', () => ({
   createClient: () => createMockSupabase(),
}))

vi.mock('@storefront/lib/supabase/server', () => ({
   createClient: () => createMockSupabase(),
}))

vi.mock('@admin/lib/supabase/server', () => ({
   createClient: () => createMockSupabase(),
}))

// Mock next/server with constructor support
vi.mock('next/server', () => {
   class MockNextResponse extends Response {
      cookies: any
      constructor(body?: BodyInit | null, init?: ResponseInit) {
         super(body, init)
         const cookieStore: Record<string, any> = {}
         this.cookies = {
            set: (name: string | { name: string; value: string; [k: string]: any }, value?: string, opts?: any) => {
               if (typeof name === 'object') {
                  cookieStore[name.name] = { ...name }
               } else {
                  cookieStore[name] = { name, value, ...opts }
               }
            },
            get: (name: string) => cookieStore[name],
            getAll: () => Object.values(cookieStore),
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
         const res = new MockNextResponse(null, {
            status: 307,
            headers: { location: target },
         })
         ;(res as any)._redirectUrl = target
         return res
      }
      static next() {
         return new MockNextResponse(null, { status: 200 })
      }
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

vi.mock('next/cache', () => ({
   revalidatePath: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Auth Callback Route Tests
// ---------------------------------------------------------------------------

describe('Auth Callback Route', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   it('should exchange code for session on valid OAuth callback', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })

      const { GET } = await import('@storefront/app/auth/callback/route')

      const url = new URL('https://xforgea3d.com/auth/callback?code=test-auth-code&next=/')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-auth-code')
      expect(response.status).toBe(307)
   })

   it('should redirect to / when next parameter is missing', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })

      const { GET } = await import('@storefront/app/auth/callback/route')

      const url = new URL('https://xforgea3d.com/auth/callback?code=valid-code')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-code')
      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).toMatch(/\/$/)
   })

   it('should sanitize next parameter to prevent open redirect (protocol-relative URL)', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })

      const { GET } = await import('@storefront/app/auth/callback/route')

      // Attempt open redirect via protocol-relative URL //evil.com
      const url = new URL('https://xforgea3d.com/auth/callback?code=test-code&next=//evil.com')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      // rawNext.startsWith('/') && !rawNext.startsWith('//') rejects //evil.com
      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).not.toContain('evil.com')
   })

   it('should redirect to login with error when no code is provided', async () => {
      const { GET } = await import('@storefront/app/auth/callback/route')

      const url = new URL('https://xforgea3d.com/auth/callback')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).toContain('/login')
      expect(redirectUrl).toContain('error=auth_callback_failed')
   })

   it('should redirect to login when session exchange fails', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
         error: new Error('Invalid code'),
      })

      const { GET } = await import('@storefront/app/auth/callback/route')

      const url = new URL('https://xforgea3d.com/auth/callback?code=expired-code')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).toContain('/login')
      expect(redirectUrl).toContain('error=auth_callback_failed')
   })

   it('should use correct origin in redirect URL (not localhost)', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })

      const { GET } = await import('@storefront/app/auth/callback/route')

      const url = new URL('https://xforgea3d.com/auth/callback?code=valid-code&next=/profile')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      const redirectUrl = (response as any)._redirectUrl || response.headers.get('location') || ''
      expect(redirectUrl).not.toContain('localhost')
      expect(redirectUrl).toContain('xforgea3d.com')
   })

   it('should set logged-in cookie on successful callback', async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: null })

      const { GET } = await import('@storefront/app/auth/callback/route')

      const url = new URL('https://xforgea3d.com/auth/callback?code=valid-code')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      // Check the cookie was set via our mock cookies store
      const cookie = (response as any).cookies?.get('logged-in')
      expect(cookie).toBeDefined()
      expect(cookie.value).toBe('true')
   })
})

// ---------------------------------------------------------------------------
// Logout Route Tests
// ---------------------------------------------------------------------------

describe('Auth Logout Route', () => {
   beforeEach(() => {
      vi.clearAllMocks()
      mockSignOut.mockResolvedValue({ error: null })
   })

   it('should call supabase signOut', async () => {
      const { GET } = await import('@storefront/app/api/auth/logout/route')

      const url = new URL('https://xforgea3d.com/api/auth/logout')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      await GET(request)

      expect(mockSignOut).toHaveBeenCalled()
   })

   it('should return JSON success response after logout', async () => {
      const { GET } = await import('@storefront/app/api/auth/logout/route')

      const url = new URL('https://xforgea3d.com/api/auth/logout')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      const body = await response.json()
      expect(body.success).toBe(true)
   })

   it('should clear logged-in cookie on logout', async () => {
      const { GET } = await import('@storefront/app/api/auth/logout/route')

      const url = new URL('https://xforgea3d.com/api/auth/logout')
      const request = new Request(url) as any
      Object.defineProperty(request, 'url', { value: url.toString() })

      const response = await GET(request)

      // Cookie should be set with empty value and maxAge: 0
      const cookie = (response as any).cookies?.get('logged-in')
      expect(cookie).toBeDefined()
      expect(cookie.value).toBe('')
   })
})

// ---------------------------------------------------------------------------
// Google OAuth URL Generation Tests
// ---------------------------------------------------------------------------

describe('Google OAuth URL generation', () => {
   beforeEach(() => {
      vi.resetModules()
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID = 'test-client-id'
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL = 'https://xforgea3d.com/auth/callback'
   })

   it('should generate a valid Google OAuth URL', async () => {
      const { getGoogleURL } = await import('@storefront/lib/google')

      const url = getGoogleURL()

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('response_type=code')
      expect(url).toContain('access_type=offline')
   })

   it('should include correct redirect URI', async () => {
      const { getGoogleURL } = await import('@storefront/lib/google')

      const url = getGoogleURL()

      expect(url).toContain(encodeURIComponent('https://xforgea3d.com/auth/callback'))
   })

   it('should request email and profile scopes', async () => {
      const { getGoogleURL } = await import('@storefront/lib/google')

      const url = getGoogleURL()

      expect(url).toContain('userinfo.profile')
      expect(url).toContain('userinfo.email')
   })

   it('should set prompt to consent for token refresh', async () => {
      const { getGoogleURL } = await import('@storefront/lib/google')

      const url = getGoogleURL()

      expect(url).toContain('prompt=consent')
   })
})

// ---------------------------------------------------------------------------
// Authentication cookie check logic tests (unit-level, no DOM needed)
// ---------------------------------------------------------------------------

describe('Authentication cookie check logic', () => {
   it('should detect logged-in=true cookie', () => {
      const cookies = 'logged-in=true; theme=dark'
      const loggedIn =
         cookies
            .split(';')
            .find((c) => c.trim().startsWith('logged-in'))
            ?.split('=')[1] === 'true'

      expect(loggedIn).toBe(true)
   })

   it('should return false when logged-in cookie is absent', () => {
      const cookies = 'theme=dark; lang=tr'
      const loggedIn =
         cookies
            .split(';')
            .find((c) => c.trim().startsWith('logged-in'))
            ?.split('=')[1] === 'true'

      expect(loggedIn).toBe(false)
   })

   it('should return false when logged-in cookie is explicitly false', () => {
      const cookies = 'logged-in=false'
      const loggedIn =
         cookies
            .split(';')
            .find((c) => c.trim().startsWith('logged-in'))
            ?.split('=')[1] === 'true'

      expect(loggedIn).toBe(false)
   })

   it('should handle empty cookie string gracefully', () => {
      const cookies = ''
      const loggedIn =
         cookies
            .split(';')
            .find((c) => c.trim().startsWith('logged-in'))
            ?.split('=')[1] === 'true'

      expect(loggedIn).toBe(false)
   })
})

// ---------------------------------------------------------------------------
// Redirect safety tests — validates auth redirect patterns
// ---------------------------------------------------------------------------

describe('Auth redirect safety', () => {
   // Mirrors the sanitization logic used in callback and login forms
   function sanitizeRedirect(raw: string | null): string {
      if (!raw) return '/'
      if (raw.startsWith('/') && !raw.startsWith('//')) return raw
      return '/'
   }

   it('should allow normal relative paths', () => {
      expect(sanitizeRedirect('/profile')).toBe('/profile')
      expect(sanitizeRedirect('/orders/123')).toBe('/orders/123')
   })

   it('should reject protocol-relative URLs', () => {
      expect(sanitizeRedirect('//evil.com')).toBe('/')
      expect(sanitizeRedirect('//evil.com/phish')).toBe('/')
   })

   it('should reject absolute URLs', () => {
      expect(sanitizeRedirect('https://evil.com')).toBe('/')
      expect(sanitizeRedirect('http://evil.com')).toBe('/')
   })

   it('should default to / for null input', () => {
      expect(sanitizeRedirect(null)).toBe('/')
   })

   it('should default to / for empty string', () => {
      expect(sanitizeRedirect('')).toBe('/')
   })
})
