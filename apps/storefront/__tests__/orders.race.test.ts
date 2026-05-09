import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import prisma from '@/lib/prisma'
import { POST as createOrder } from '@/app/api/orders/route'

describe('Order Creation - Stock Race Condition Prevention', () => {
  const testUserId = 'race-test-user'
  const testAddressId = 'race-test-address'
  const testProductId = 'race-test-product'

  beforeEach(async () => {
    // Create test user profile
    await prisma.profile.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: `race-${Date.now()}@test.com`,
        role: 'customer',
      },
    })

    // Create test address
    await prisma.address.create({
      data: {
        id: testAddressId,
        userId: testUserId,
        address: 'Test Address',
        city: 'Test City',
        phone: '0555555555',
        postalCode: '12345',
      },
    })

    // Create cart for user
    await prisma.cart.upsert({
      where: { userId: testUserId },
      update: {},
      create: { userId: testUserId },
    })

    // Create product with stock=2
    await prisma.product.upsert({
      where: { id: testProductId },
      update: {},
      create: {
        id: testProductId,
        title: `Race Test Product ${Date.now()}`,
        price: 100,
        discount: 0,
        stock: 2,
        isAvailable: true,
        isPhysical: true,
      },
    })

    // Add product to cart (qty=1)
    await prisma.cartItem.upsert({
      where: {
        UniqueCartItem: {
          cartId: testUserId,
          productId: testProductId,
        },
      },
      update: { count: 1 },
      create: {
        cartId: testUserId,
        productId: testProductId,
        count: 1,
      },
    })
  })

  afterEach(async () => {
    // Cleanup
    await prisma.cartItem.deleteMany({
      where: { cartId: testUserId },
    })
    await prisma.cart.deleteMany({
      where: { userId: testUserId },
    })
    await prisma.product.deleteMany({
      where: { id: testProductId },
    })
    await prisma.address.deleteMany({
      where: { id: testAddressId },
    })
    await prisma.profile.deleteMany({
      where: { id: testUserId },
    })
  })

  it('should prevent overselling with Serializable isolation', async () => {
    // Simulate 3 concurrent order creation attempts
    // Each tries to order the same product (stock=2)
    // Expected: 2 succeed, 1 fails due to stock exhaustion

    const requestPromises = [1, 2, 3].map((i) => {
      const req = new Request('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'X-USER-ID': testUserId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: testAddressId,
          discountCode: null,
          csrfToken: 'test-csrf-token', // Would be verified in real env
        }),
      })

      return createOrder(req)
        .then((response) => ({
          status: response.status,
          ok: response.ok,
          body: response.status === 200 ? response.json() : null,
        }))
        .catch((error) => ({
          status: 500,
          ok: false,
          error: error.message,
        }))
    })

    const results = await Promise.allSettled(requestPromises)

    // Check results
    const successes = results.filter(
      (r) => r.status === 'fulfilled' && r.value.ok && r.value.status === 200
    )
    const failures = results.filter(
      (r) => r.status === 'rejected' || !r.value.ok || r.value.status !== 200
    )

    // With Serializable isolation and stock=2, only 2 orders should succeed
    // (3rd hits stock limit during transaction)
    expect(successes.length).toBeLessThanOrEqual(2)
    expect(failures.length).toBeGreaterThanOrEqual(1)

    // Verify stock is now 0 (2 items sold)
    const product = await prisma.product.findUnique({
      where: { id: testProductId },
    })
    expect(product?.stock).toBeLessThanOrEqual(0)
  })

  it('should atomically roll back entire order on stock exhaustion', async () => {
    // Manually set stock to 0 to force failure
    await prisma.product.update({
      where: { id: testProductId },
      data: { stock: 0 },
    })

    const req = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'X-USER-ID': testUserId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addressId: testAddressId,
        discountCode: null,
        csrfToken: 'test-csrf-token',
      }),
    })

    const response = await createOrder(req)

    // Should fail with OUT_OF_STOCK
    expect(response.status).toBe(400)
    const text = await response.text()
    expect(text).toContain('yeterli stok')

    // Verify no partial order was created
    const orders = await prisma.order.findMany({
      where: { userId: testUserId },
    })
    expect(orders).toHaveLength(0)

    // Verify cart still has item (not cleared)
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        UniqueCartItem: {
          cartId: testUserId,
          productId: testProductId,
        },
      },
    })
    expect(cartItem).toBeDefined()
  })

  it('should maintain referential integrity on order deletion', async () => {
    // Create order successfully
    const req = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'X-USER-ID': testUserId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addressId: testAddressId,
        discountCode: null,
        csrfToken: 'test-csrf-token',
      }),
    })

    const response = await createOrder(req)
    expect(response.ok).toBe(true)

    const order = await response.json()
    expect(order.id).toBeDefined()

    // Verify order items exist
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })
    expect(orderItems.length).toBeGreaterThan(0)

    // Delete order (should cascade delete orderItems via schema)
    await prisma.order.delete({
      where: { id: order.id },
    })

    // Verify orderItems are gone (cascade delete worked)
    const orphanedItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })
    expect(orphanedItems).toHaveLength(0)
  })
})
