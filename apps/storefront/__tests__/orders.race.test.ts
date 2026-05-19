import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const routeSource = readFileSync(
   resolve(process.cwd(), 'apps/storefront/src/app/api/orders/route.ts'),
   'utf8'
)

describe('Order route production safeguards', () => {
   it('blocks production order creation before DB side effects when POS config is incomplete', () => {
      const paymentGuardIndex = routeSource.indexOf("process.env.NODE_ENV === 'production' && !hasPaymentProvider")
      const transactionIndex = routeSource.indexOf('prisma.$transaction')

      expect(paymentGuardIndex).toBeGreaterThan(-1)
      expect(transactionIndex).toBeGreaterThan(-1)
      expect(paymentGuardIndex).toBeLessThan(transactionIndex)
      expect(routeSource).toContain('PAYMENT_API_URL')
      expect(routeSource).toContain('Yapı Kredi Sanal POS')
   })

   it('keeps stock validation inside a serializable row-locking transaction', () => {
      expect(routeSource).toContain('FOR UPDATE')
      expect(routeSource).toContain("isolationLevel: 'Serializable'")
      expect(routeSource).toContain('stock: { gte: item.count }')
      expect(routeSource).toContain('OUT_OF_STOCK')
   })

   it('returns the created order object expected by checkout', () => {
      expect(routeSource).toContain('const actualOrder = order.order')
      expect(routeSource).toContain('return NextResponse.json(actualOrder)')
      expect(routeSource).not.toContain('return NextResponse.json(order)')
   })
})
