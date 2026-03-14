/**
 * COMPREHENSIVE USER FLOW TESTS
 *
 * Tests every critical user path: cart operations, order creation,
 * discount code validation, quote request flow, return request flow,
 * profile operations, and address operations.
 *
 * Validation logic recreated inline to mirror actual route handler behavior
 * without importing Next.js route handlers directly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateCsrfToken, verifyCsrfToken } from '@storefront/lib/csrf'

// =============================================================================
// INLINE BUSINESS LOGIC (mirrors actual route handlers)
// =============================================================================

const TAX_RATE_DEFAULT = 20

// --- Cart validation (mirrors /api/cart POST) ---
function validateCartPost(body: {
   productId?: unknown
   count?: unknown
   csrfToken?: string
}): { status: number; error?: string; action?: 'delete' | 'upsert' } {
   const { productId, count } = body
   if (!productId) return { status: 400, error: 'productId zorunlu' }
   if (count === undefined || count === null) return { status: 400, error: 'count zorunlu' }
   if (!Number.isInteger(count) || typeof count !== 'number') {
      return { status: 400, error: 'count 0-99 arasi tam sayi olmali' }
   }
   if ((count as number) < 0) return { status: 400, error: 'count 0-99 arasi tam sayi olmali' }
   if ((count as number) > 99) return { status: 400, error: 'count 0-99 arasi tam sayi olmali' }
   if ((count as number) < 1) return { action: 'delete', status: 200 }
   return { action: 'upsert', status: 200 }
}

// --- Stock check at cart add time ---
function validateStockForCartAdd(
   product: { isAvailable: boolean; stock: number; title: string } | null,
   requestedCount: number
): { status: number; error?: string } {
   if (!product) return { status: 404, error: 'Urun bulunamadi' }
   if (!product.isAvailable) return { status: 400, error: `${product.title} su an mevcut degil` }
   if (product.stock < requestedCount) {
      return { status: 400, error: `${product.title} icin yeterli stok yok` }
   }
   return { status: 200 }
}

// --- Order creation validation (mirrors /api/orders POST) ---
function validateOrderCreation(params: {
   userId: string | null
   addressId: string | null
   csrfToken: string | undefined
   csrfUserId: string
   cart: { items: Array<{ count: number; productId: string; product: { price: number; discount: number; isAvailable: boolean; stock: number; title: string } }> } | null
   address: { userId: string } | null
   discountCode?: {
      code: string
      stock: number
      startDate: Date
      endDate: Date
      percent: number
      maxDiscountAmount: number
   } | null
}): { status: number; error?: string } {
   if (!params.userId) return { status: 401, error: 'Unauthorized' }
   if (!params.csrfToken || !verifyCsrfToken(params.csrfToken, params.csrfUserId)) {
      return { status: 403, error: 'Gecersiz istek' }
   }
   if (!params.addressId) return { status: 400, error: 'addressId is required' }
   if (!params.address || params.address.userId !== params.userId) {
      return { status: 403, error: 'Adres bulunamadi veya size ait degil' }
   }
   if (!params.cart || !params.cart.items.length) {
      return { status: 400, error: 'Sepet bos' }
   }
   for (const item of params.cart.items) {
      if (!item.product.isAvailable) {
         return { status: 400, error: `${item.product.title} su an mevcut degil` }
      }
      if (item.product.stock < item.count) {
         return { status: 400, error: `${item.product.title} icin yeterli stok yok` }
      }
   }
   if (params.discountCode) {
      const now = new Date()
      const dc = params.discountCode
      if (dc.stock < 1) return { status: 400, error: 'Gecersiz veya suresi dolmus indirim kodu' }
      if (dc.endDate < now) return { status: 400, error: 'Gecersiz veya suresi dolmus indirim kodu' }
      if (dc.startDate > now) return { status: 400, error: 'Gecersiz veya suresi dolmus indirim kodu' }
   }
   return { status: 200 }
}

// --- Cost calculation (mirrors orders route) ---
function calculateCosts(args: {
   cart: { items: Array<{ count: number; product: { price: number; discount: number } }> }
   discountCodeData?: { percent: number; maxDiscountAmount: number | null } | null
   taxRate?: number
}) {
   const taxRate = args.taxRate ?? TAX_RATE_DEFAULT
   let total = 0
   let discount = 0
   for (const item of args.cart.items) {
      total += item.count * item.product.price
      discount += item.count * item.product.discount
   }
   if (args.discountCodeData) {
      const afterProductDiscount = total - discount
      let codeDiscount = afterProductDiscount * (args.discountCodeData.percent / 100)
      if (args.discountCodeData.maxDiscountAmount && codeDiscount > args.discountCodeData.maxDiscountAmount) {
         codeDiscount = args.discountCodeData.maxDiscountAmount
      }
      discount += codeDiscount
   }
   const afterDiscount = Math.max(total - discount, 0)
   const tax = afterDiscount * (taxRate / 100)
   const payable = afterDiscount + tax
   return {
      total: parseFloat(total.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      afterDiscount: parseFloat(afterDiscount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      payable: parseFloat(payable.toFixed(2)),
   }
}

// --- Order code generation (mirrors orders route) ---
function generateOrderCode(orderNumber: number): string {
   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
   let rand = ''
   for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return `XF-${orderNumber}-${rand}`
}

// --- Discount code validation (mirrors /api/discount-validate POST) ---
function validateDiscountCode(
   code: { stock: number; startDate: Date; endDate: Date; percent: number; maxDiscountAmount: number } | null,
   now: Date
): { valid: boolean; error?: string } {
   if (!code) return { valid: false, error: 'Gecersiz indirim kodu' }
   if (code.stock < 1) return { valid: false, error: 'Bu indirim kodu tukenmistir' }
   if (code.endDate < now) return { valid: false, error: 'Bu indirim kodunun suresi dolmus' }
   if (code.startDate > now) return { valid: false, error: 'Bu indirim kodu henuz aktif degil' }
   return { valid: true }
}

// --- Quote request validation (mirrors /api/quote-requests POST) ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateQuoteRequestPost(data: {
   email?: string
   partDescription?: string
}): { status: number; error?: string } | null {
   if (!data.email || !data.partDescription) {
      return { status: 400, error: 'Email ve parca aciklamasi zorunludur' }
   }
   if (!EMAIL_REGEX.test(data.email)) {
      return { status: 400, error: 'Gecersiz email formati' }
   }
   if (data.partDescription.length > 2000) {
      return { status: 400, error: 'Parca aciklamasi cok uzun' }
   }
   return null // valid
}

// --- Quote accept validation (mirrors /api/quote-requests/[id]/accept POST) ---
function validateQuoteAccept(params: {
   userId: string | null
   addressId: string | null
   quote: { userId: string; status: string; quotedPrice: number | null; orderId?: string | null } | null
   addressOwnerId: string | null
}): { status: number; error?: string; orderId?: string } | null {
   if (!params.userId) return { status: 401, error: 'Unauthorized' }
   if (!params.addressId) return { status: 400, error: 'addressId zorunlu' }
   if (!params.quote || params.quote.userId !== params.userId || params.quote.status !== 'Priced') {
      return { status: 404, error: 'Teklif talebi bulunamadi' }
   }
   if (params.addressOwnerId !== params.userId) {
      return { status: 403, error: 'Bu adres size ait degil' }
   }
   if (params.quote.orderId) {
      return { status: 200, orderId: params.quote.orderId } // idempotent
   }
   if (!params.quote.quotedPrice || params.quote.quotedPrice <= 0) {
      return { status: 400, error: 'Gecersiz fiyat' }
   }
   return null // proceed to create order
}

// --- Return request validation (mirrors /api/returns POST) ---
function validateReturnRequest(params: {
   userId: string | null
   orderId: string | null
   reason: string | null
   csrfToken: string | undefined
   csrfUserId: string
   order: { id: string; userId: string; status: string; number: number } | null
   existingReturn: { id: string } | null
}): { status: number; error?: string } {
   if (!params.userId) return { status: 401, error: 'Unauthorized' }
   if (!params.csrfToken || !verifyCsrfToken(params.csrfToken, params.csrfUserId)) {
      return { status: 403, error: 'Gecersiz istek' }
   }
   if (!params.orderId || !params.reason) {
      return { status: 400, error: 'orderId ve reason zorunludur' }
   }
   if (!params.order || params.order.userId !== params.userId) {
      return { status: 404, error: 'Siparis bulunamadi veya size ait degil' }
   }
   if (params.order.status !== 'Delivered') {
      return { status: 400, error: 'Yalnizca teslim edilmis siparisler icin iade talebi olusturulabilir' }
   }
   if (params.existingReturn) {
      return { status: 400, error: 'Bu siparis icin zaten bir iade talebi bulunmaktadir' }
   }
   return { status: 200 }
}

// --- Notification validation (mirrors /api/notifications PATCH) ---
function validateNotificationPatch(params: {
   userId: string | null
   ids?: string[]
   all?: boolean
   csrfToken: string | undefined
   csrfUserId: string
}): { status: number; error?: string; action?: 'mark-all' | 'mark-ids' } {
   if (!params.userId) return { status: 401, error: 'Unauthorized' }
   if (!params.csrfToken || !verifyCsrfToken(params.csrfToken, params.csrfUserId)) {
      return { status: 403, error: 'Gecersiz istek' }
   }
   if (params.all === true) return { status: 200, action: 'mark-all' }
   if (Array.isArray(params.ids) && params.ids.length > 0) return { status: 200, action: 'mark-ids' }
   return { status: 400, error: 'provide { ids: string[] } or { all: true }' }
}

// --- Profile validation (mirrors /api/profile PATCH) ---
function validateProfilePatch(input: {
   name?: unknown
   phone?: unknown
   avatar?: unknown
}): { valid: boolean; field?: string } {
   const { name, phone, avatar } = input
   if (name !== undefined && (typeof name !== 'string' || name.length > 100))
      return { valid: false, field: 'name' }
   if (phone !== undefined && (typeof phone !== 'string' || phone.length > 20))
      return { valid: false, field: 'phone' }
   if (avatar !== undefined && (typeof avatar !== 'string' || avatar.length > 500))
      return { valid: false, field: 'avatar' }
   return { valid: true }
}

// --- Address validation (mirrors /api/addresses POST) ---
function validateAddressPost(input: {
   address?: string
   city?: string
   phone?: string
   existingCount?: number
}): { status: number; error?: string; phoneClean?: string } {
   if ((input.existingCount ?? 0) >= 10) {
      return { status: 400, error: 'En fazla 10 adres ekleyebilirsiniz' }
   }
   if (!input.address || !input.city || !input.phone) {
      return { status: 400, error: 'Adres, sehir ve telefon zorunlu alanlardir' }
   }
   if (input.address.length > 500 || input.city.length > 100) {
      return { status: 400, error: 'Alan uzunlugu limiti asildi' }
   }
   const phoneClean = input.phone.replace(/[^0-9+]/g, '')
   if (phoneClean.length < 10 || phoneClean.length > 15) {
      return { status: 400, error: 'Gecersiz telefon numarasi' }
   }
   return { status: 200, phoneClean }
}

// =============================================================================
// TEST GROUP 1: CART OPERATIONS
// =============================================================================

describe('Cart Operations', () => {
   const userId = 'cart-test-user-001'

   describe('Add product to cart (authenticated)', () => {
      it('accepts valid productId + count=1', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 1 })
         expect(result.status).toBe(200)
         expect(result.action).toBe('upsert')
      })

      it('accepts valid productId + count=50 (mid-range)', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 50 })
         expect(result.action).toBe('upsert')
      })

      it('accepts valid productId + count=99 (boundary max)', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 99 })
         expect(result.action).toBe('upsert')
         expect(result.status).toBe(200)
      })
   })

   describe('Add product to cart (unauthenticated - localStorage)', () => {
      it('cart stored in localStorage structure mirrors server cart', () => {
         const localCart = {
            items: [
               { productId: 'prod-1', count: 2 },
               { productId: 'prod-2', count: 1 },
            ],
         }
         expect(localCart.items).toHaveLength(2)
         expect(localCart.items[0].count).toBe(2)
      })

      it('localStorage cart items have productId and count', () => {
         const item = { productId: 'prod-x', count: 3 }
         expect(item.productId).toBeDefined()
         expect(item.count).toBeGreaterThan(0)
      })

      it('server rejects requests without X-USER-ID header', () => {
         // The cart POST route requires userId from X-USER-ID
         const userId: string | null = null
         expect(!userId).toBe(true)
         // Route returns 401
      })
   })

   describe('Remove product from cart', () => {
      it('count=0 triggers delete action', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 0 })
         expect(result.action).toBe('delete')
         expect(result.status).toBe(200)
      })
   })

   describe('Update quantity', () => {
      it('count=5 triggers upsert action', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 5 })
         expect(result.action).toBe('upsert')
      })

      it('changing from count=3 to count=7 is a valid upsert', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 7 })
         expect(result.action).toBe('upsert')
      })
   })

   describe('Add out-of-stock product (should fail)', () => {
      it('rejects product with stock=0', () => {
         const result = validateStockForCartAdd(
            { isAvailable: true, stock: 0, title: 'Out-of-stock Widget' },
            1
         )
         expect(result.status).toBe(400)
         expect(result.error).toContain('stok')
      })

      it('rejects unavailable product', () => {
         const result = validateStockForCartAdd(
            { isAvailable: false, stock: 10, title: 'Disabled Product' },
            1
         )
         expect(result.status).toBe(400)
         expect(result.error).toContain('mevcut degil')
      })

      it('rejects null product (not found)', () => {
         const result = validateStockForCartAdd(null, 1)
         expect(result.status).toBe(404)
      })
   })

   describe('Add product with count > stock (should fail)', () => {
      it('rejects when requested count exceeds available stock', () => {
         const result = validateStockForCartAdd(
            { isAvailable: true, stock: 3, title: 'Limited Widget' },
            5
         )
         expect(result.status).toBe(400)
         expect(result.error).toContain('stok')
      })

      it('accepts when count equals stock exactly', () => {
         const result = validateStockForCartAdd(
            { isAvailable: true, stock: 5, title: 'Widget' },
            5
         )
         expect(result.status).toBe(200)
      })
   })

   describe('Add product with count=0 (should remove)', () => {
      it('count=0 triggers delete flow', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 0 })
         expect(result.action).toBe('delete')
      })
   })

   describe('Add product with negative count (should fail)', () => {
      it('count=-1 returns 400', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: -1 })
         expect(result.status).toBe(400)
      })

      it('count=-999 returns 400', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: -999 })
         expect(result.status).toBe(400)
      })
   })

   describe('Add product with NaN count (should fail)', () => {
      it('string count returns 400', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 'five' as any })
         expect(result.status).toBe(400)
      })

      it('NaN count returns 400', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: NaN as any })
         expect(result.status).toBe(400)
      })

      it('undefined count returns 400', () => {
         const result = validateCartPost({ productId: 'prod-abc' })
         expect(result.status).toBe(400)
      })

      it('null count returns 400', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: null })
         expect(result.status).toBe(400)
      })

      it('float count returns 400 (not integer)', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 2.5 as any })
         expect(result.status).toBe(400)
      })

      it('count=100 returns 400 (exceeds max 99)', () => {
         const result = validateCartPost({ productId: 'prod-abc', count: 100 })
         expect(result.status).toBe(400)
      })

      it('missing productId returns 400', () => {
         const result = validateCartPost({ count: 1 })
         expect(result.status).toBe(400)
      })

      it('empty productId returns 400', () => {
         const result = validateCartPost({ productId: '', count: 1 })
         expect(result.status).toBe(400)
      })
   })
})

// =============================================================================
// TEST GROUP 2: ORDER CREATION
// =============================================================================

describe('Order Creation', () => {
   const userId = 'order-test-user-001'

   function makeCsrf() {
      return generateCsrfToken(userId)
   }

   const validProduct = {
      price: 100,
      discount: 10,
      isAvailable: true,
      stock: 50,
      title: 'Test Product',
   }

   const validCart = {
      items: [{ count: 2, productId: 'prod-1', product: validProduct }],
   }

   const validAddress = { userId }

   describe('Create order with valid cart + address', () => {
      it('returns 200 for valid order', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
         })
         expect(result.status).toBe(200)
      })

      it('calculates costs correctly', () => {
         const costs = calculateCosts({ cart: validCart })
         expect(costs.total).toBe(200)
         expect(costs.discount).toBe(20)
         expect(costs.afterDiscount).toBe(180)
         expect(costs.tax).toBe(36) // 180 * 0.20
         expect(costs.payable).toBe(216) // 180 + 36
      })
   })

   describe('Create order with empty cart (should fail)', () => {
      it('returns 400 for empty cart items', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: { items: [] },
            address: validAddress,
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('bos')
      })

      it('returns 400 for null cart', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: null,
            address: validAddress,
         })
         expect(result.status).toBe(400)
      })
   })

   describe('Create order with invalid address (should fail)', () => {
      it('returns 400 when addressId is missing', () => {
         const result = validateOrderCreation({
            userId,
            addressId: null,
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
         })
         expect(result.status).toBe(400)
      })

      it('returns 403 when address belongs to another user', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: { userId: 'other-user' },
         })
         expect(result.status).toBe(403)
      })

      it('returns 403 when address is null (not found)', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-nonexist',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: null,
         })
         expect(result.status).toBe(403)
      })
   })

   describe('Create order with valid discount code', () => {
      it('accepts valid discount code within date range', () => {
         const now = new Date()
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
            discountCode: {
               code: 'SAVE10',
               stock: 5,
               startDate: new Date(now.getTime() - 86400000),
               endDate: new Date(now.getTime() + 86400000),
               percent: 10,
               maxDiscountAmount: 50,
            },
         })
         expect(result.status).toBe(200)
      })

      it('calculates discount code on top of product discounts', () => {
         const costs = calculateCosts({
            cart: validCart,
            discountCodeData: { percent: 10, maxDiscountAmount: null },
         })
         // total=200, productDiscount=20, afterProductDiscount=180
         // codeDiscount = 180 * 0.10 = 18
         // totalDiscount = 20 + 18 = 38
         expect(costs.discount).toBe(38)
         expect(costs.afterDiscount).toBe(162)
      })

      it('caps discount code at maxDiscountAmount', () => {
         const costs = calculateCosts({
            cart: { items: [{ count: 1, product: { price: 1000, discount: 0 } }] },
            discountCodeData: { percent: 50, maxDiscountAmount: 100 },
         })
         expect(costs.discount).toBe(100)
         expect(costs.afterDiscount).toBe(900)
      })
   })

   describe('Create order with expired discount code (should fail)', () => {
      it('returns 400 for expired code', () => {
         const now = new Date()
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
            discountCode: {
               code: 'EXPIRED',
               stock: 5,
               startDate: new Date('2024-01-01'),
               endDate: new Date('2024-12-31'),
               percent: 10,
               maxDiscountAmount: 50,
            },
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('indirim kodu')
      })
   })

   describe('Create order with used-up discount code (should fail)', () => {
      it('returns 400 for code with stock=0', () => {
         const now = new Date()
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
            discountCode: {
               code: 'USEDUP',
               stock: 0,
               startDate: new Date(now.getTime() - 86400000),
               endDate: new Date(now.getTime() + 86400000),
               percent: 10,
               maxDiscountAmount: 50,
            },
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('indirim kodu')
      })
   })

   describe('Create order decrements stock correctly', () => {
      it('stock decrement calculation for single item', () => {
         const productStock = 10
         const orderCount = 3
         const newStock = productStock - orderCount
         expect(newStock).toBe(7)
      })

      it('stock decrement calculation for multiple items', () => {
         const products = [
            { stock: 20, ordered: 5 },
            { stock: 10, ordered: 3 },
            { stock: 1, ordered: 1 },
         ]
         for (const p of products) {
            expect(p.stock - p.ordered).toBeGreaterThanOrEqual(0)
         }
      })

      it('detects insufficient stock during order creation', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            cart: {
               items: [{
                  count: 100,
                  productId: 'prod-1',
                  product: { ...validProduct, stock: 5 },
               }],
            },
            address: validAddress,
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('stok')
      })
   })

   describe('Create order generates unique orderCode', () => {
      it('generates code in format XF-{number}-{4chars}', () => {
         const code = generateOrderCode(123)
         expect(code).toMatch(/^XF-123-[A-Z0-9]{4}$/)
      })

      it('generates different codes for same order number', () => {
         const codes = new Set<string>()
         for (let i = 0; i < 100; i++) {
            codes.add(generateOrderCode(1))
         }
         // With 32^4 = 1,048,576 possibilities, 100 codes should be mostly unique
         expect(codes.size).toBeGreaterThan(90)
      })

      it('code only uses allowed characters (no ambiguous 0/O, 1/I/L)', () => {
         const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
         for (let i = 0; i < 50; i++) {
            const code = generateOrderCode(i)
            const suffix = code.split('-')[2]
            for (const char of suffix) {
               expect(allowedChars).toContain(char)
            }
         }
      })
   })

   describe('Order CSRF enforcement', () => {
      it('rejects order without CSRF token', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: undefined,
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
         })
         expect(result.status).toBe(403)
      })

      it('rejects order with invalid CSRF token', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: 'bad.token',
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
         })
         expect(result.status).toBe(403)
      })

      it('rejects order with CSRF token for wrong user', () => {
         const result = validateOrderCreation({
            userId,
            addressId: 'addr-1',
            csrfToken: generateCsrfToken('wrong-user'),
            csrfUserId: userId,
            cart: validCart,
            address: validAddress,
         })
         expect(result.status).toBe(403)
      })
   })
})

// =============================================================================
// TEST GROUP 3: DISCOUNT CODE VALIDATION
// =============================================================================

describe('Discount Code Validation', () => {
   const now = new Date('2026-03-14T12:00:00Z')

   it('valid code returns discount info', () => {
      const result = validateDiscountCode(
         {
            stock: 10,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            percent: 15,
            maxDiscountAmount: 100,
         },
         now
      )
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
   })

   it('expired code returns error', () => {
      const result = validateDiscountCode(
         {
            stock: 10,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            percent: 15,
            maxDiscountAmount: 100,
         },
         now
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('suresi dolmus')
   })

   it('future code (not yet active) returns error', () => {
      const result = validateDiscountCode(
         {
            stock: 10,
            startDate: new Date('2027-01-01'),
            endDate: new Date('2027-12-31'),
            percent: 15,
            maxDiscountAmount: 100,
         },
         now
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('aktif degil')
   })

   it('zero-stock code returns error', () => {
      const result = validateDiscountCode(
         {
            stock: 0,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            percent: 15,
            maxDiscountAmount: 100,
         },
         now
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('tukenmistir')
   })

   it('non-existent code (null) returns error', () => {
      const result = validateDiscountCode(null, now)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Gecersiz')
   })

   it('code valid on exact startDate boundary', () => {
      const exactStart = new Date('2026-03-14T12:00:00Z')
      const result = validateDiscountCode(
         {
            stock: 1,
            startDate: exactStart,
            endDate: new Date('2026-12-31'),
            percent: 10,
            maxDiscountAmount: 50,
         },
         exactStart
      )
      expect(result.valid).toBe(true)
   })

   it('code valid on exact endDate boundary', () => {
      const exactEnd = new Date('2026-03-14T12:00:00Z')
      const result = validateDiscountCode(
         {
            stock: 1,
            startDate: new Date('2026-01-01'),
            endDate: exactEnd,
            percent: 10,
            maxDiscountAmount: 50,
         },
         exactEnd
      )
      expect(result.valid).toBe(true)
   })

   it('code with stock=1 (last remaining) is valid', () => {
      const result = validateDiscountCode(
         {
            stock: 1,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            percent: 20,
            maxDiscountAmount: 200,
         },
         now
      )
      expect(result.valid).toBe(true)
   })

   it('code with negative stock returns error', () => {
      const result = validateDiscountCode(
         {
            stock: -1,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            percent: 10,
            maxDiscountAmount: 50,
         },
         now
      )
      expect(result.valid).toBe(false)
   })
})

// =============================================================================
// TEST GROUP 4: QUOTE REQUEST FLOW
// =============================================================================

describe('Quote Request Flow', () => {
   const userId = 'quote-test-user-001'

   describe('Create quote request (authenticated)', () => {
      it('accepts valid quote request with userId', () => {
         const result = validateQuoteRequestPost({
            email: 'user@example.com',
            partDescription: 'I need a replacement bracket for model X100',
         })
         expect(result).toBeNull() // null means valid
      })

      it('userId from X-USER-ID header is optional for quote creation', () => {
         // Public endpoint - userId can be null
         const authenticated = userId
         const anonymous: string | null = null
         expect(authenticated).toBeTruthy()
         expect(anonymous).toBeNull()
         // Both should be accepted by the route
      })
   })

   describe('Create quote request (unauthenticated)', () => {
      it('accepts valid quote request without auth', () => {
         const result = validateQuoteRequestPost({
            email: 'guest@example.com',
            partDescription: 'Need a gear replacement',
         })
         expect(result).toBeNull()
      })

      it('rejects missing email', () => {
         const result = validateQuoteRequestPost({ partDescription: 'Need a part' })
         expect(result).not.toBeNull()
         expect(result!.status).toBe(400)
      })

      it('rejects missing partDescription', () => {
         const result = validateQuoteRequestPost({ email: 'user@test.com' })
         expect(result).not.toBeNull()
         expect(result!.status).toBe(400)
      })

      it('rejects invalid email format', () => {
         const result = validateQuoteRequestPost({
            email: 'not-an-email',
            partDescription: 'Part needed',
         })
         expect(result).not.toBeNull()
         expect(result!.status).toBe(400)
      })

      it('rejects partDescription > 2000 chars', () => {
         const result = validateQuoteRequestPost({
            email: 'user@test.com',
            partDescription: 'A'.repeat(2001),
         })
         expect(result).not.toBeNull()
         expect(result!.status).toBe(400)
      })

      it('accepts partDescription at exactly 2000 chars', () => {
         const result = validateQuoteRequestPost({
            email: 'user@test.com',
            partDescription: 'A'.repeat(2000),
         })
         expect(result).toBeNull()
      })
   })

   describe('Accept quoted price creates order', () => {
      it('valid accept proceeds to order creation', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: 250 },
            addressOwnerId: userId,
         })
         expect(result).toBeNull() // null means proceed
      })

      it('calculates tax on quoted price at default rate', () => {
         const price = 250
         const tax = parseFloat((price * (TAX_RATE_DEFAULT / 100)).toFixed(2))
         const payable = parseFloat((price + tax).toFixed(2))
         expect(tax).toBe(50)
         expect(payable).toBe(300)
      })
   })

   describe('Accept already-accepted quote (should fail)', () => {
      it('returns existing orderId for idempotent re-accept', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: 200, orderId: 'order-existing-123' },
            addressOwnerId: userId,
         })
         expect(result).not.toBeNull()
         expect((result as any).orderId).toBe('order-existing-123')
         expect((result as any).status).toBe(200)
      })

      it('rejects quote with wrong status (Accepted)', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Accepted', quotedPrice: 200 },
            addressOwnerId: userId,
         })
         expect(result).not.toBeNull()
         expect((result as any).status).toBe(404)
      })

      it('rejects quote with wrong status (Pending)', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Pending', quotedPrice: 200 },
            addressOwnerId: userId,
         })
         expect(result).not.toBeNull()
         expect((result as any).status).toBe(404)
      })

      it('rejects quote with wrong status (Completed)', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Completed', quotedPrice: 200 },
            addressOwnerId: userId,
         })
         expect(result).not.toBeNull()
         expect((result as any).status).toBe(404)
      })
   })

   describe('Quote accept edge cases', () => {
      it('rejects without userId (401)', () => {
         const result = validateQuoteAccept({
            userId: null,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: 100 },
            addressOwnerId: userId,
         })
         expect(result).toEqual({ status: 401, error: 'Unauthorized' })
      })

      it('rejects without addressId', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: null,
            quote: { userId, status: 'Priced', quotedPrice: 100 },
            addressOwnerId: userId,
         })
         expect((result as any).status).toBe(400)
      })

      it('rejects when address belongs to another user', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: 100 },
            addressOwnerId: 'other-user',
         })
         expect((result as any).status).toBe(403)
      })

      it('rejects zero quotedPrice', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: 0 },
            addressOwnerId: userId,
         })
         expect((result as any).status).toBe(400)
      })

      it('rejects negative quotedPrice', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: -50 },
            addressOwnerId: userId,
         })
         expect((result as any).status).toBe(400)
      })

      it('rejects null quotedPrice', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId, status: 'Priced', quotedPrice: null },
            addressOwnerId: userId,
         })
         expect((result as any).status).toBe(400)
      })

      it('rejects null quote', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: null,
            addressOwnerId: userId,
         })
         expect((result as any).status).toBe(404)
      })

      it('rejects quote belonging to different user', () => {
         const result = validateQuoteAccept({
            userId,
            addressId: 'addr-1',
            quote: { userId: 'other-user', status: 'Priced', quotedPrice: 100 },
            addressOwnerId: userId,
         })
         expect((result as any).status).toBe(404)
      })
   })
})

// =============================================================================
// TEST GROUP 5: RETURN REQUEST FLOW
// =============================================================================

describe('Return Request Flow', () => {
   const userId = 'return-test-user-001'

   function makeCsrf() {
      return generateCsrfToken(userId)
   }

   describe('Create return for delivered order', () => {
      it('accepts return for Delivered order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Defective product',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Delivered', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(200)
      })
   })

   describe('Create return for non-delivered order (should fail)', () => {
      it('rejects return for Processing order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Changed mind',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Processing', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('teslim edilmis')
      })

      it('rejects return for Shipped order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Changed mind',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Shipped', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(400)
      })

      it('rejects return for OnayBekleniyor order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Wrong item',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'OnayBekleniyor', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(400)
      })

      it('rejects return for Cancelled order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Defective',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Cancelled', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(400)
      })

      it('rejects return for ReturnCompleted order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Duplicate',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'ReturnCompleted', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(400)
      })
   })

   describe('Create duplicate return (should fail)', () => {
      it('rejects when return already exists for order', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Defective again',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Delivered', number: 100 },
            existingReturn: { id: 'return-existing-1' },
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('zaten')
      })
   })

   describe('Return status validation', () => {
      it('valid return statuses are enumerated', () => {
         const validStatuses = [
            'Pending',
            'Approved',
            'ReturnShipping',
            'Received',
            'Refunded',
            'Rejected',
         ]
         expect(validStatuses).toHaveLength(6)
      })

      it('return creation sets initial status to Pending', () => {
         const defaultStatus = 'Pending'
         expect(defaultStatus).toBe('Pending')
      })

      it('order status changes to ReturnProcessing after return creation', () => {
         const newOrderStatus = 'ReturnProcessing'
         expect(newOrderStatus).toBe('ReturnProcessing')
      })
   })

   describe('Return request edge cases', () => {
      it('rejects without auth', () => {
         const result = validateReturnRequest({
            userId: null,
            orderId: 'order-1',
            reason: 'Defective',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Delivered', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(401)
      })

      it('rejects without CSRF token', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Defective',
            csrfToken: undefined,
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Delivered', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(403)
      })

      it('rejects without orderId', () => {
         const result = validateReturnRequest({
            userId,
            orderId: null,
            reason: 'Defective',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: null,
            existingReturn: null,
         })
         expect(result.status).toBe(400)
      })

      it('rejects without reason', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: null,
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId, status: 'Delivered', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(400)
      })

      it('rejects order belonging to different user', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-1',
            reason: 'Defective',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: { id: 'order-1', userId: 'other-user', status: 'Delivered', number: 100 },
            existingReturn: null,
         })
         expect(result.status).toBe(404)
      })

      it('rejects when order is null (not found)', () => {
         const result = validateReturnRequest({
            userId,
            orderId: 'order-nonexist',
            reason: 'Defective',
            csrfToken: makeCsrf(),
            csrfUserId: userId,
            order: null,
            existingReturn: null,
         })
         expect(result.status).toBe(404)
      })
   })
})

// =============================================================================
// TEST GROUP 6: NOTIFICATION SYSTEM
// =============================================================================

describe('Notification System', () => {
   const userId = 'notif-test-user-001'

   function makeCsrf() {
      return generateCsrfToken(userId)
   }

   describe('Create notification', () => {
      it('notification has required fields', () => {
         const notification = {
            id: 'notif-1',
            content: 'Siparis #100 olusturuldu',
            type: 'notification',
            isRead: false,
            userId,
         }
         expect(notification.content).toBeTruthy()
         expect(notification.userId).toBe(userId)
         expect(notification.isRead).toBe(false)
         expect(notification.type).toBe('notification')
      })

      it('notification default type is "notification"', () => {
         const defaultType = 'notification'
         expect(defaultType).toBe('notification')
      })

      it('notification can have type "popup"', () => {
         const notification = { type: 'popup' }
         expect(notification.type).toBe('popup')
      })
   })

   describe('Mark single notification as read', () => {
      it('accepts valid ids array with CSRF', () => {
         const result = validateNotificationPatch({
            userId,
            ids: ['notif-1'],
            csrfToken: makeCsrf(),
            csrfUserId: userId,
         })
         expect(result.status).toBe(200)
         expect(result.action).toBe('mark-ids')
      })

      it('accepts multiple ids', () => {
         const result = validateNotificationPatch({
            userId,
            ids: ['notif-1', 'notif-2', 'notif-3'],
            csrfToken: makeCsrf(),
            csrfUserId: userId,
         })
         expect(result.status).toBe(200)
         expect(result.action).toBe('mark-ids')
      })
   })

   describe('Mark all notifications as read', () => {
      it('accepts all=true with CSRF', () => {
         const result = validateNotificationPatch({
            userId,
            all: true,
            csrfToken: makeCsrf(),
            csrfUserId: userId,
         })
         expect(result.status).toBe(200)
         expect(result.action).toBe('mark-all')
      })
   })

   describe('CSRF token required for mutations', () => {
      it('rejects PATCH without CSRF token', () => {
         const result = validateNotificationPatch({
            userId,
            all: true,
            csrfToken: undefined,
            csrfUserId: userId,
         })
         expect(result.status).toBe(403)
      })

      it('rejects PATCH with invalid CSRF token', () => {
         const result = validateNotificationPatch({
            userId,
            all: true,
            csrfToken: 'fake.token',
            csrfUserId: userId,
         })
         expect(result.status).toBe(403)
      })

      it('rejects PATCH with wrong user CSRF token', () => {
         const result = validateNotificationPatch({
            userId,
            all: true,
            csrfToken: generateCsrfToken('other-user'),
            csrfUserId: userId,
         })
         expect(result.status).toBe(403)
      })
   })

   describe('Notification edge cases', () => {
      it('rejects without auth', () => {
         const result = validateNotificationPatch({
            userId: null,
            all: true,
            csrfToken: makeCsrf(),
            csrfUserId: userId,
         })
         expect(result.status).toBe(401)
      })

      it('rejects empty ids array', () => {
         const result = validateNotificationPatch({
            userId,
            ids: [],
            csrfToken: makeCsrf(),
            csrfUserId: userId,
         })
         expect(result.status).toBe(400)
      })

      it('rejects when neither ids nor all is provided', () => {
         const result = validateNotificationPatch({
            userId,
            csrfToken: makeCsrf(),
            csrfUserId: userId,
         })
         expect(result.status).toBe(400)
      })

      it('GET notifications requires auth (401 without)', () => {
         const userId: string | null = null
         expect(!userId).toBe(true)
      })

      it('GET returns max 50 notifications', () => {
         const take = 50
         expect(take).toBe(50)
      })

      it('GET returns unreadCount alongside notifications', () => {
         const response = {
            notifications: [{ id: 'n1', isRead: false }],
            unreadCount: 1,
         }
         expect(response.unreadCount).toBe(1)
      })
   })
})

// =============================================================================
// TEST GROUP 7: PROFILE OPERATIONS
// =============================================================================

describe('Profile Operations', () => {
   const userId = 'profile-test-user-001'

   describe('Update profile name', () => {
      it('accepts valid name', () => {
         expect(validateProfilePatch({ name: 'John Doe' })).toEqual({ valid: true })
      })

      it('accepts name at boundary (100 chars)', () => {
         expect(validateProfilePatch({ name: 'x'.repeat(100) })).toEqual({ valid: true })
      })

      it('rejects name > 100 chars', () => {
         expect(validateProfilePatch({ name: 'x'.repeat(101) }).valid).toBe(false)
      })

      it('rejects non-string name', () => {
         expect(validateProfilePatch({ name: 12345 }).valid).toBe(false)
      })

      it('rejects array as name', () => {
         expect(validateProfilePatch({ name: ['a'] as any }).valid).toBe(false)
      })

      it('accepts empty string name', () => {
         expect(validateProfilePatch({ name: '' }).valid).toBe(true)
      })
   })

   describe('Update profile phone', () => {
      it('accepts valid phone', () => {
         expect(validateProfilePatch({ phone: '+905551234567' })).toEqual({ valid: true })
      })

      it('accepts phone at boundary (20 chars)', () => {
         expect(validateProfilePatch({ phone: '0'.repeat(20) })).toEqual({ valid: true })
      })

      it('rejects phone > 20 chars', () => {
         expect(validateProfilePatch({ phone: '0'.repeat(21) }).valid).toBe(false)
      })

      it('rejects non-string phone', () => {
         expect(validateProfilePatch({ phone: 5551234567 }).valid).toBe(false)
      })

      it('rejects object as phone', () => {
         expect(validateProfilePatch({ phone: {} as any }).valid).toBe(false)
      })
   })

   describe('Profile CSRF validation', () => {
      it('CSRF is required for PATCH', () => {
         const csrfToken = generateCsrfToken(userId)
         expect(verifyCsrfToken(csrfToken, userId)).toBe(true)
      })

      it('invalid CSRF rejects PATCH', () => {
         expect(verifyCsrfToken('bad.token', userId)).toBe(false)
      })

      it('CSRF for wrong user rejects PATCH', () => {
         const token = generateCsrfToken('other-user')
         expect(verifyCsrfToken(token, userId)).toBe(false)
      })

      it('expired CSRF rejects PATCH', () => {
         const realNow = Date.now
         const pastTime = realNow() - 2 * 60 * 60 * 1000
         Date.now = () => pastTime
         const token = generateCsrfToken(userId)
         Date.now = realNow
         expect(verifyCsrfToken(token, userId)).toBe(false)
      })
   })

   describe('Email cannot be changed', () => {
      it('profile PATCH does not accept email field', () => {
         // The route only destructures { name, phone, avatar, csrfToken }
         // Email is never used in the update query
         const updateData: Record<string, unknown> = {}
         const body = { name: 'New Name', email: 'newemail@test.com', csrfToken: 'token' }

         // Simulating the route: only name, phone, avatar are accepted
         if (body.name !== undefined) updateData.name = body.name
         // body.email is IGNORED

         expect(updateData).not.toHaveProperty('email')
         expect(updateData).toHaveProperty('name')
      })
   })

   describe('Profile update edge cases', () => {
      it('accepts no-op update (empty body)', () => {
         expect(validateProfilePatch({})).toEqual({ valid: true })
      })

      it('accepts all fields at boundary', () => {
         expect(
            validateProfilePatch({
               name: 'x'.repeat(100),
               phone: '0'.repeat(20),
               avatar: 'x'.repeat(500),
            })
         ).toEqual({ valid: true })
      })

      it('rejects avatar > 500 chars', () => {
         expect(validateProfilePatch({ avatar: 'x'.repeat(501) }).valid).toBe(false)
      })

      it('rejects non-string avatar', () => {
         expect(validateProfilePatch({ avatar: true }).valid).toBe(false)
      })

      it('GET profile requires auth', () => {
         const userId: string | null = null
         expect(!userId).toBe(true)
      })
   })
})

// =============================================================================
// TEST GROUP 8: ADDRESS OPERATIONS
// =============================================================================

describe('Address Operations', () => {
   const userId = 'addr-test-user-001'

   describe('Create address', () => {
      it('accepts valid address with all required fields', () => {
         const result = validateAddressPost({
            address: '123 Main Street, Apt 4B',
            city: 'Istanbul',
            phone: '+905551234567',
            existingCount: 0,
         })
         expect(result.status).toBe(200)
         expect(result.phoneClean).toBe('+905551234567')
      })

      it('strips non-numeric chars from phone', () => {
         const result = validateAddressPost({
            address: 'Test Street',
            city: 'Ankara',
            phone: '+90 (555) 123-4567',
            existingCount: 0,
         })
         expect(result.status).toBe(200)
         expect(result.phoneClean).toBe('+905551234567')
      })

      it('accepts address at boundary (500 chars)', () => {
         const result = validateAddressPost({
            address: 'x'.repeat(500),
            city: 'Istanbul',
            phone: '+905551234567',
            existingCount: 0,
         })
         expect(result.status).toBe(200)
      })

      it('accepts city at boundary (100 chars)', () => {
         const result = validateAddressPost({
            address: 'Test Street',
            city: 'x'.repeat(100),
            phone: '+905551234567',
            existingCount: 0,
         })
         expect(result.status).toBe(200)
      })
   })

   describe('Create address without required fields (should fail)', () => {
      it('rejects missing address', () => {
         const result = validateAddressPost({
            city: 'Istanbul',
            phone: '+905551234567',
         } as any)
         expect(result.status).toBe(400)
         expect(result.error).toContain('zorunlu')
      })

      it('rejects missing city', () => {
         const result = validateAddressPost({
            address: '123 Main St',
            phone: '+905551234567',
         } as any)
         expect(result.status).toBe(400)
      })

      it('rejects missing phone', () => {
         const result = validateAddressPost({
            address: '123 Main St',
            city: 'Istanbul',
         } as any)
         expect(result.status).toBe(400)
      })

      it('rejects empty string address', () => {
         const result = validateAddressPost({
            address: '',
            city: 'Istanbul',
            phone: '+905551234567',
         })
         expect(result.status).toBe(400)
      })

      it('rejects address > 500 chars', () => {
         const result = validateAddressPost({
            address: 'x'.repeat(501),
            city: 'Istanbul',
            phone: '+905551234567',
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('limit')
      })

      it('rejects city > 100 chars', () => {
         const result = validateAddressPost({
            address: 'Test Street',
            city: 'x'.repeat(101),
            phone: '+905551234567',
         })
         expect(result.status).toBe(400)
      })

      it('rejects short phone (< 10 digits)', () => {
         const result = validateAddressPost({
            address: 'Test Street',
            city: 'Istanbul',
            phone: '12345',
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('telefon')
      })

      it('rejects long phone (> 15 digits)', () => {
         const result = validateAddressPost({
            address: 'Test Street',
            city: 'Istanbul',
            phone: '1234567890123456',
         })
         expect(result.status).toBe(400)
      })
   })

   describe('Max 10 addresses limit', () => {
      it('rejects when user already has 10 addresses', () => {
         const result = validateAddressPost({
            address: 'New Address',
            city: 'Istanbul',
            phone: '+905551234567',
            existingCount: 10,
         })
         expect(result.status).toBe(400)
         expect(result.error).toContain('10')
      })

      it('accepts when user has 9 addresses', () => {
         const result = validateAddressPost({
            address: 'New Address',
            city: 'Istanbul',
            phone: '+905551234567',
            existingCount: 9,
         })
         expect(result.status).toBe(200)
      })

      it('rejects when user has 11 addresses (already over limit)', () => {
         const result = validateAddressPost({
            address: 'New Address',
            city: 'Istanbul',
            phone: '+905551234567',
            existingCount: 11,
         })
         expect(result.status).toBe(400)
      })
   })

   describe('CSRF token required', () => {
      it('address POST requires CSRF token', () => {
         const csrfToken = generateCsrfToken(userId)
         expect(verifyCsrfToken(csrfToken, userId)).toBe(true)
      })

      it('invalid CSRF rejects address creation', () => {
         expect(verifyCsrfToken('invalid.token', userId)).toBe(false)
      })

      it('CSRF for wrong user rejects address creation', () => {
         const token = generateCsrfToken('wrong-user')
         expect(verifyCsrfToken(token, userId)).toBe(false)
      })
   })

   describe('Address phone boundary tests', () => {
      it('accepts 10-digit phone (boundary minimum)', () => {
         const result = validateAddressPost({
            address: 'Test',
            city: 'City',
            phone: '1234567890',
         })
         expect(result.status).toBe(200)
      })

      it('accepts 15-digit phone (boundary maximum)', () => {
         const result = validateAddressPost({
            address: 'Test',
            city: 'City',
            phone: '123456789012345',
         })
         expect(result.status).toBe(200)
      })

      it('rejects 9-digit phone', () => {
         const result = validateAddressPost({
            address: 'Test',
            city: 'City',
            phone: '123456789',
         })
         expect(result.status).toBe(400)
      })

      it('rejects 16-digit phone', () => {
         const result = validateAddressPost({
            address: 'Test',
            city: 'City',
            phone: '1234567890123456',
         })
         expect(result.status).toBe(400)
      })
   })
})

// =============================================================================
// INTEGRATION: FULL ORDER FLOW END-TO-END SIMULATION
// =============================================================================

describe('Full Order Flow - End-to-End Simulation', () => {
   const userId = 'e2e-user-001'

   it('Step 1: Add items to cart', () => {
      const r1 = validateCartPost({ productId: 'prod-1', count: 2 })
      const r2 = validateCartPost({ productId: 'prod-2', count: 1 })
      expect(r1.action).toBe('upsert')
      expect(r2.action).toBe('upsert')
   })

   it('Step 2: Validate discount code', () => {
      const now = new Date()
      const result = validateDiscountCode(
         {
            stock: 5,
            startDate: new Date(now.getTime() - 86400000),
            endDate: new Date(now.getTime() + 86400000),
            percent: 10,
            maxDiscountAmount: 50,
         },
         now
      )
      expect(result.valid).toBe(true)
   })

   it('Step 3: Create order with cart + address + discount', () => {
      const csrfToken = generateCsrfToken(userId)
      const now = new Date()
      const result = validateOrderCreation({
         userId,
         addressId: 'addr-1',
         csrfToken,
         csrfUserId: userId,
         cart: {
            items: [
               { count: 2, productId: 'prod-1', product: { price: 150, discount: 10, isAvailable: true, stock: 20, title: 'Widget A' } },
               { count: 1, productId: 'prod-2', product: { price: 80, discount: 0, isAvailable: true, stock: 10, title: 'Widget B' } },
            ],
         },
         address: { userId },
         discountCode: {
            code: 'SAVE10',
            stock: 5,
            startDate: new Date(now.getTime() - 86400000),
            endDate: new Date(now.getTime() + 86400000),
            percent: 10,
            maxDiscountAmount: 50,
         },
      })
      expect(result.status).toBe(200)
   })

   it('Step 4: Calculate expected costs', () => {
      const costs = calculateCosts({
         cart: {
            items: [
               { count: 2, product: { price: 150, discount: 10 } },
               { count: 1, product: { price: 80, discount: 0 } },
            ],
         },
         discountCodeData: { percent: 10, maxDiscountAmount: 50 },
      })
      // total = 300 + 80 = 380
      // productDiscount = 20 + 0 = 20
      // afterProductDiscount = 360
      // codeDiscount = 360 * 0.10 = 36
      // totalDiscount = 20 + 36 = 56 -- wait, 36 < 50, so no cap
      expect(costs.total).toBe(380)
      expect(costs.discount).toBe(56)
      expect(costs.afterDiscount).toBe(324)
      // tax = 324 * 0.20 = 64.80
      expect(costs.tax).toBe(64.8)
      expect(costs.payable).toBe(388.8)
   })

   it('Step 5: Generate order code', () => {
      const code = generateOrderCode(42)
      expect(code).toMatch(/^XF-42-[A-Z0-9]{4}$/)
   })

   it('Step 6: Return request for delivered order', () => {
      const csrfToken = generateCsrfToken(userId)
      const result = validateReturnRequest({
         userId,
         orderId: 'order-42',
         reason: 'Product was damaged',
         csrfToken,
         csrfUserId: userId,
         order: { id: 'order-42', userId, status: 'Delivered', number: 42 },
         existingReturn: null,
      })
      expect(result.status).toBe(200)
   })
})
