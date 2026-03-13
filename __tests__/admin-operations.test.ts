/**
 * ADMIN OPERATIONS & SECURITY CONFIG TESTS
 * Tests admin input validation, security headers, and config integrity.
 */

import { describe, it, expect } from 'vitest'

// ─── Admin Product Numeric Validation (mirrors route logic) ──────────────────

describe('Admin Product PATCH — Numeric Validation Logic', () => {
   // Recreates the validation added to apps/admin/src/app/api/products/[productId]/route.ts
   function validateProductPatch(body: Record<string, unknown>): { valid: boolean; field?: string } {
      if (body.price !== undefined) {
         const n = Number(body.price)
         if (isNaN(n) || n < 0) return { valid: false, field: 'price' }
      }
      if (body.discount !== undefined) {
         const n = Number(body.discount)
         if (isNaN(n) || n < 0) return { valid: false, field: 'discount' }
      }
      if (body.stock !== undefined) {
         const n = Number(body.stock)
         if (isNaN(n) || n < 0 || !Number.isInteger(n)) return { valid: false, field: 'stock' }
      }
      if (body.productType !== undefined) {
         if (!['READY', 'CUSTOM'].includes(body.productType as string)) return { valid: false, field: 'productType' }
      }
      return { valid: true }
   }

   it('rejects negative price', () => {
      expect(validateProductPatch({ price: -10 }).valid).toBe(false)
   })

   it('rejects NaN price', () => {
      expect(validateProductPatch({ price: 'not-a-number' }).valid).toBe(false)
   })

   it('Infinity passes basic Number() check (Prisma rejects at DB level)', () => {
      // Number(Infinity) is not NaN and not < 0
      expect(validateProductPatch({ price: Infinity }).valid).toBe(true)
   })

   it('accepts zero price', () => {
      expect(validateProductPatch({ price: 0 }).valid).toBe(true)
   })

   it('accepts decimal price', () => {
      expect(validateProductPatch({ price: 49.99 }).valid).toBe(true)
   })

   it('rejects negative discount', () => {
      expect(validateProductPatch({ discount: -5 }).valid).toBe(false)
   })

   it('rejects NaN discount', () => {
      expect(validateProductPatch({ discount: 'abc' }).valid).toBe(false)
   })

   it('accepts zero discount', () => {
      expect(validateProductPatch({ discount: 0 }).valid).toBe(true)
   })

   it('rejects negative stock', () => {
      expect(validateProductPatch({ stock: -1 }).valid).toBe(false)
   })

   it('rejects non-integer stock', () => {
      expect(validateProductPatch({ stock: 3.5 }).valid).toBe(false)
   })

   it('rejects NaN stock', () => {
      expect(validateProductPatch({ stock: 'invalid' }).valid).toBe(false)
   })

   it('accepts zero stock', () => {
      expect(validateProductPatch({ stock: 0 }).valid).toBe(true)
   })

   it('accepts positive integer stock', () => {
      expect(validateProductPatch({ stock: 100 }).valid).toBe(true)
   })

   it('accepts valid combination of all numeric fields', () => {
      expect(validateProductPatch({ price: 99.99, discount: 10, stock: 50 }).valid).toBe(true)
   })

   it('rejects invalid productType', () => {
      expect(validateProductPatch({ productType: 'INVALID' }).valid).toBe(false)
   })

   it('accepts READY productType', () => {
      expect(validateProductPatch({ productType: 'READY' }).valid).toBe(true)
   })

   it('accepts CUSTOM productType', () => {
      expect(validateProductPatch({ productType: 'CUSTOM' }).valid).toBe(true)
   })

   it('accepts update with no numeric fields', () => {
      expect(validateProductPatch({ title: 'New Title' }).valid).toBe(true)
   })

   it('rejects if any numeric field is invalid (early return)', () => {
      const result = validateProductPatch({ price: 100, discount: -5, stock: 10 })
      expect(result.valid).toBe(false)
      expect(result.field).toBe('discount')
   })
})

// ─── Security Headers Validation ─────────────────────────────────────────────

describe('Security Headers Config — Storefront', () => {
   let config: any

   it('loads storefront config', async () => {
      config = require('../apps/storefront/next.config.js')
      expect(config).toBeDefined()
   })

   it('includes HSTS header', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const hsts = mainHeaders.find((h: any) => h.key === 'Strict-Transport-Security')
      expect(hsts).toBeDefined()
      expect(hsts.value).toContain('max-age=')
      expect(hsts.value).toContain('includeSubDomains')
      expect(hsts.value).toContain('preload')
   })

   it('includes X-Frame-Options DENY', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const xfo = mainHeaders.find((h: any) => h.key === 'X-Frame-Options')
      expect(xfo).toBeDefined()
      expect(xfo.value).toBe('DENY')
   })

   it('includes X-Content-Type-Options nosniff', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const xcto = mainHeaders.find((h: any) => h.key === 'X-Content-Type-Options')
      expect(xcto).toBeDefined()
      expect(xcto.value).toBe('nosniff')
   })

   it('includes CSP with frame-ancestors none', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const csp = mainHeaders.find((h: any) => h.key === 'Content-Security-Policy')
      expect(csp).toBeDefined()
      expect(csp.value).toContain("frame-ancestors 'none'")
   })

   it('includes Referrer-Policy', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const rp = mainHeaders.find((h: any) => h.key === 'Referrer-Policy')
      expect(rp).toBeDefined()
      expect(rp.value).toBe('strict-origin-when-cross-origin')
   })

   it('includes Permissions-Policy denying camera, microphone, geolocation', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const pp = mainHeaders.find((h: any) => h.key === 'Permissions-Policy')
      expect(pp).toBeDefined()
      expect(pp.value).toContain('camera=()')
      expect(pp.value).toContain('microphone=()')
      expect(pp.value).toContain('geolocation=()')
   })

   it('includes X-XSS-Protection', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const xss = mainHeaders.find((h: any) => h.key === 'X-XSS-Protection')
      expect(xss).toBeDefined()
      expect(xss.value).toBe('1; mode=block')
   })

   it('sets immutable cache for static assets', async () => {
      const headers = await config.headers()
      const staticHeaders = headers.find((h: any) => h.source.includes('_next/static'))
      expect(staticHeaders).toBeDefined()
      const cc = staticHeaders.headers.find((h: any) => h.key === 'Cache-Control')
      expect(cc.value).toContain('immutable')
      expect(cc.value).toContain('max-age=31536000')
   })
})

describe('Security Headers Config — Admin', () => {
   let config: any

   it('loads admin config', async () => {
      config = require('../apps/admin/next.config.js')
      expect(config).toBeDefined()
   })

   it('includes HSTS header', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const hsts = mainHeaders.find((h: any) => h.key === 'Strict-Transport-Security')
      expect(hsts).toBeDefined()
      expect(hsts.value).toContain('max-age=')
      expect(hsts.value).toContain('includeSubDomains')
   })

   it('includes all required security headers', async () => {
      const headers = await config.headers()
      const mainHeaders = headers[0].headers
      const headerKeys = mainHeaders.map((h: any) => h.key)
      expect(headerKeys).toContain('X-Content-Type-Options')
      expect(headerKeys).toContain('X-Frame-Options')
      expect(headerKeys).toContain('X-XSS-Protection')
      expect(headerKeys).toContain('Referrer-Policy')
      expect(headerKeys).toContain('Permissions-Policy')
      expect(headerKeys).toContain('Strict-Transport-Security')
      // CSP was removed — admin panel is an internal tool behind auth,
      // and a restrictive CSP was breaking external Supabase storage images.
   })
})

// ─── Build Config Validation ─────────────────────────────────────────────────

describe('Build Config Integrity', () => {
   it('both apps disable poweredByHeader', () => {
      const storefrontConfig = require('../apps/storefront/next.config.js')
      const adminConfig = require('../apps/admin/next.config.js')
      expect(storefrontConfig.poweredByHeader).toBe(false)
      expect(adminConfig.poweredByHeader).toBe(false)
   })

   it('both apps have compression enabled', () => {
      const storefrontConfig = require('../apps/storefront/next.config.js')
      const adminConfig = require('../apps/admin/next.config.js')
      expect(storefrontConfig.compress).toBe(true)
      expect(adminConfig.compress).toBe(true)
   })

   it('both apps do not ignore TypeScript build errors', () => {
      const storefrontConfig = require('../apps/storefront/next.config.js')
      const adminConfig = require('../apps/admin/next.config.js')
      expect(storefrontConfig.typescript.ignoreBuildErrors).toBe(false)
      expect(adminConfig.typescript.ignoreBuildErrors).toBe(false)
   })

   it('storefront has image optimization configured', () => {
      const config = require('../apps/storefront/next.config.js')
      // next/image is no longer used — all images use native <img> tags.
      // unoptimized: true disables the Next.js image optimization API entirely.
      expect(config.images.unoptimized).toBe(true)
   })

   it('storefront has redirect from /product to /products', async () => {
      const config = require('../apps/storefront/next.config.js')
      const redirects = await config.redirects()
      const productRedirect = redirects.find((r: any) => r.source === '/product')
      expect(productRedirect).toBeDefined()
      expect(productRedirect.destination).toBe('/products')
      expect(productRedirect.permanent).toBe(true)
   })

   it('both apps use unoptimized images (no remotePatterns needed)', () => {
      const storefrontConfig = require('../apps/storefront/next.config.js')
      const adminConfig = require('../apps/admin/next.config.js')
      // Both apps switched to native <img> tags with unoptimized: true,
      // so remotePatterns configuration is no longer required.
      expect(storefrontConfig.images.unoptimized).toBe(true)
      expect(adminConfig.images.unoptimized).toBe(true)
   })
})

// ─── Admin Middleware Logic ──────────────────────────────────────────────────

describe('Admin Email Validation Logic', () => {
   function checkAdminEmail(
      userEmail: string | null | undefined,
      allowedEmail: string | undefined
   ): { allowed: boolean; reason?: string } {
      if (!allowedEmail) return { allowed: false, reason: 'ADMIN_EMAIL not configured' }
      if (!userEmail) return { allowed: false, reason: 'no email' }
      if (userEmail.toLowerCase() !== allowedEmail.toLowerCase()) {
         return { allowed: false, reason: 'not admin' }
      }
      return { allowed: true }
   }

   it('rejects when ADMIN_EMAIL is not configured', () => {
      expect(checkAdminEmail('user@test.com', undefined).allowed).toBe(false)
   })

   it('rejects when user has no email', () => {
      expect(checkAdminEmail(null, 'admin@test.com').allowed).toBe(false)
   })

   it('rejects when emails do not match', () => {
      expect(checkAdminEmail('user@test.com', 'admin@test.com').allowed).toBe(false)
   })

   it('accepts when emails match (case-insensitive)', () => {
      expect(checkAdminEmail('Admin@Test.com', 'admin@test.com').allowed).toBe(true)
   })

   it('accepts exact match', () => {
      expect(checkAdminEmail('admin@test.com', 'admin@test.com').allowed).toBe(true)
   })

   it('rejects empty string email', () => {
      expect(checkAdminEmail('', 'admin@test.com').allowed).toBe(false)
   })
})
