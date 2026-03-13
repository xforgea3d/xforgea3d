import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Revalidation Tests
// ---------------------------------------------------------------------------

// Override next/server to provide NextResponse as both constructor and static methods
vi.mock('next/server', () => {
   class MockNextResponse extends Response {
      constructor(body?: BodyInit | null, init?: ResponseInit) {
         super(body, init)
      }
      static json(data: any, init?: ResponseInit) {
         return new Response(JSON.stringify(data), {
            ...init,
            headers: { 'content-type': 'application/json', ...init?.headers },
         })
      }
      static redirect(url: string | URL) {
         const res = new Response(null, { status: 307 })
         ;(res as any)._redirectUrl = typeof url === 'string' ? url : url.toString()
         return res
      }
      static next() {
         return new Response(null, { status: 200 })
      }
   }
   return { NextResponse: MockNextResponse, NextRequest: Request }
})

vi.mock('next/cache', () => ({
   revalidatePath: vi.fn(),
}))

// Capture the original env and fetch
const originalEnv = { ...process.env }
const originalFetch = global.fetch

const mockFetch = vi.fn()

beforeEach(() => {
   vi.clearAllMocks()
   vi.resetModules()
   global.fetch = mockFetch as any
   process.env.STOREFRONT_URL = 'https://storefront.xforgea3d.com'
   process.env.REVALIDATION_SECRET = 'test-revalidation-secret-42'
})

afterEach(() => {
   process.env = { ...originalEnv }
   global.fetch = originalFetch
})

describe('revalidateStorefront', () => {
   it('should call fetch with the correct URL and authorization header', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/products'])

      expect(mockFetch).toHaveBeenCalledWith(
         'https://storefront.xforgea3d.com/api/revalidate?path=%2Fproducts',
         expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
               Authorization: 'Bearer test-revalidation-secret-42',
            }),
         })
      )
   })

   it('should revalidate multiple paths in parallel', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/products', '/api/categories', '/'])

      expect(mockFetch).toHaveBeenCalledTimes(3)

      const calledUrls = mockFetch.mock.calls.map((c: any) => c[0])
      expect(calledUrls).toContain(
         'https://storefront.xforgea3d.com/api/revalidate?path=%2Fproducts'
      )
      expect(calledUrls).toContain(
         'https://storefront.xforgea3d.com/api/revalidate?path=%2Fapi%2Fcategories'
      )
      expect(calledUrls).toContain(
         'https://storefront.xforgea3d.com/api/revalidate?path=%2F'
      )
   })

   it('should silently skip when STOREFRONT_URL is empty', async () => {
      process.env.STOREFRONT_URL = ''

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/'])

      expect(mockFetch).not.toHaveBeenCalled()
   })

   it('should silently skip when REVALIDATION_SECRET is empty', async () => {
      process.env.REVALIDATION_SECRET = ''

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/'])

      expect(mockFetch).not.toHaveBeenCalled()
   })

   it('should retry on fetch failure with exponential backoff', async () => {
      // Fail first 3 times, succeed on 4th (attempt index 3)
      mockFetch
         .mockRejectedValueOnce(new Error('ECONNREFUSED'))
         .mockRejectedValueOnce(new Error('ECONNREFUSED'))
         .mockRejectedValueOnce(new Error('ECONNREFUSED'))
         .mockResolvedValue({ ok: true })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/'])

      // MAX_RETRIES = 3 means attempts 0,1,2,3 = 4 calls total
      expect(mockFetch).toHaveBeenCalledTimes(4)
      consoleSpy.mockRestore()
   })

   it('should retry on non-ok HTTP response', async () => {
      mockFetch
         .mockResolvedValueOnce({ ok: false, status: 503 })
         .mockResolvedValueOnce({ ok: true })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/'])

      expect(mockFetch).toHaveBeenCalledTimes(2)
      consoleSpy.mockRestore()
   })

   it('should exhaust retries without throwing', async () => {
      mockFetch.mockRejectedValue(new Error('Network down'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mod = await import('@admin/lib/revalidate-storefront')

      // Should NOT throw
      await expect(mod.revalidateStorefront(['/'])).resolves.toBeUndefined()

      // Should have logged exhaustion message
      expect(consoleSpy).toHaveBeenCalledWith(
         expect.stringContaining('All retries exhausted')
      )

      consoleSpy.mockRestore()
   })

   it('should use POST method with no-store cache', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateStorefront(['/'])

      expect(mockFetch).toHaveBeenCalledWith(
         expect.any(String),
         expect.objectContaining({
            method: 'POST',
            cache: 'no-store',
         })
      )
   })
})

describe('revalidateAllStorefront', () => {
   it('should revalidate all known storefront paths', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateAllStorefront()

      // ALL_STOREFRONT_PATHS has 9 paths, plus an extra revalidateWithRetry('/', 'layout')
      // call for the root layout tree = 10 total calls
      const expectedPaths = [
         '/',
         '/products',
         '/api/categories',
         '/api/car-brands',
         '/api/collections',
         '/api/nav-items',
         '/api/products',
         '/api/search',
         '/api/maintenance-status',
      ]

      expect(mockFetch).toHaveBeenCalledTimes(expectedPaths.length + 1)

      const calledPaths = mockFetch.mock.calls.map((c: any) => {
         const url = new URL(c[0])
         return decodeURIComponent(url.searchParams.get('path') || '')
      })

      for (const path of expectedPaths) {
         expect(calledPaths).toContain(path)
      }
   })

   it('should URL-encode paths properly', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const mod = await import('@admin/lib/revalidate-storefront')

      await mod.revalidateAllStorefront()

      const calledUrls = mockFetch.mock.calls.map((c: any) => c[0] as string)
      const carBrandsCall = calledUrls.find((u) => u.includes('car-brands'))
      expect(carBrandsCall).toBeDefined()
      expect(carBrandsCall).toContain('path=%2Fapi%2Fcar-brands')
   })
})

describe('Storefront revalidate webhook endpoint', () => {
   beforeEach(() => {
      process.env.REVALIDATION_SECRET = 'webhook-secret-123'
   })

   it('should return 401 for invalid token', async () => {
      const { POST } = await import('@storefront/app/api/revalidate/route')

      const request = new Request(
         'https://xforgea3d.com/api/revalidate?path=/&secret=wrong-token',
         { method: 'POST' }
      )

      const response = await POST(request)
      expect(response.status).toBe(401)
   })

   it('should return 400 when path parameter is missing', async () => {
      const { POST } = await import('@storefront/app/api/revalidate/route')

      const request = new Request('https://xforgea3d.com/api/revalidate', {
         method: 'POST',
         headers: { Authorization: 'Bearer webhook-secret-123' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
   })

   it('should revalidate path and return success', async () => {
      const { POST } = await import('@storefront/app/api/revalidate/route')

      const request = new Request(
         'https://xforgea3d.com/api/revalidate?path=/products',
         {
            method: 'POST',
            headers: { Authorization: 'Bearer webhook-secret-123' },
         }
      )

      const response = await POST(request)
      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.revalidated).toBe(true)
      expect(body.path).toBe('/products')
   })

   it('should accept Authorization header (Bearer token)', async () => {
      const { POST } = await import('@storefront/app/api/revalidate/route')

      const request = new Request('https://xforgea3d.com/api/revalidate?path=/', {
         method: 'POST',
         headers: { Authorization: 'Bearer webhook-secret-123' },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
   })

   it('should support scope=layout parameter', async () => {
      const { POST } = await import('@storefront/app/api/revalidate/route')

      const request = new Request(
         'https://xforgea3d.com/api/revalidate?path=/&scope=layout',
         {
            method: 'POST',
            headers: { Authorization: 'Bearer webhook-secret-123' },
         }
      )

      const response = await POST(request)
      const body = await response.json()
      expect(body.scope).toBe('layout')
   })
})
