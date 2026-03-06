import { vi } from 'vitest'

// Set required env vars for tests
process.env.JWT_SECRET_KEY = 'test-secret-key-for-csrf-hmac-1234567890'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.ADMIN_EMAIL = 'admin@test.com'
process.env.NEXT_PUBLIC_SITE_URL = 'https://test.xforgea3d.com'
process.env.PAYMENT_API_KEY = ''
process.env.PAYMENT_SECRET_KEY = ''
process.env.PAYMENT_MERCHANT_ID = ''
process.env.NODE_ENV = 'test'

// Mock prisma globally
vi.mock('@/lib/prisma', () => ({
   default: createMockPrisma(),
}))

vi.mock('@storefront/lib/prisma', () => ({
   default: createMockPrisma(),
}))

vi.mock('@admin/lib/prisma', () => ({
   default: createMockPrisma(),
}))

export function createMockPrisma() {
   const handler: ProxyHandler<any> = {
      get(_target, prop) {
         if (prop === '$transaction') {
            return vi.fn(async (fn: any) => {
               if (typeof fn === 'function') {
                  return fn(new Proxy({}, handler))
               }
               return Promise.all(fn)
            })
         }
         if (prop === '$connect' || prop === '$disconnect') {
            return vi.fn()
         }
         // Return a model proxy
         return new Proxy({}, {
            get(_t, method) {
               return vi.fn().mockResolvedValue(null)
            },
         })
      },
   }
   return new Proxy({}, handler)
}

// Mock NextResponse
vi.mock('next/server', async () => {
   const actual = await vi.importActual('next/server') as any
   return {
      ...actual,
      NextResponse: {
         json: (body: any, init?: ResponseInit) => {
            const res = new Response(JSON.stringify(body), {
               ...init,
               headers: { 'content-type': 'application/json', ...init?.headers },
            })
            ;(res as any)._body = body
            return res
         },
         next: () => new Response(null, { status: 200 }),
         redirect: (url: string | URL) => {
            const res = new Response(null, { status: 307 })
            ;(res as any)._redirectUrl = typeof url === 'string' ? url : url.toString()
            return res
         },
      },
   }
})

// Helper to create mock Request
export function mockRequest(
   url: string,
   options?: {
      method?: string
      headers?: Record<string, string>
      body?: any
   }
): Request {
   const { method = 'GET', headers = {}, body } = options ?? {}
   return new Request(url.startsWith('http') ? url : `https://test.xforgea3d.com${url}`, {
      method,
      headers: new Headers(headers),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
   })
}

export function mockFormDataRequest(
   url: string,
   formData: FormData,
   headers?: Record<string, string>
): Request {
   return new Request(url.startsWith('http') ? url : `https://test.xforgea3d.com${url}`, {
      method: 'POST',
      headers: new Headers(headers ?? {}),
      body: formData,
   })
}

// Parse response helper
export async function parseResponse(res: Response) {
   const text = await res.text()
   try {
      return { status: res.status, body: JSON.parse(text) }
   } catch {
      return { status: res.status, body: text }
   }
}
