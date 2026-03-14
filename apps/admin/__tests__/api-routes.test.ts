import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Admin API Route Tests — Category, Product, Brand, CarBrand CRUD
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

// Common mocks
vi.mock('next/cache', () => ({
   revalidatePath: vi.fn(),
}))

vi.mock('@admin/lib/revalidate-storefront', () => ({
   revalidateAllStorefront: vi.fn().mockResolvedValue(undefined),
   revalidateStorefront: vi.fn().mockResolvedValue(undefined),
}))

// Also mock the @/ alias version (used by route files directly)
vi.mock('@/lib/revalidate-storefront', () => ({
   revalidateAllStorefront: vi.fn().mockResolvedValue(undefined),
   revalidateStorefront: vi.fn().mockResolvedValue(undefined),
}))

// Prisma mock with configurable return values per test
const prismaCategory = {
   create: vi.fn(),
   findMany: vi.fn(),
   findUnique: vi.fn(),
   update: vi.fn(),
   delete: vi.fn(),
}

const prismaProduct = {
   create: vi.fn(),
   findMany: vi.fn(),
   findUniqueOrThrow: vi.fn(),
   update: vi.fn(),
   delete: vi.fn(),
}

const prismaBrand = {
   create: vi.fn(),
   findMany: vi.fn(),
   findUnique: vi.fn(),
   update: vi.fn(),
   delete: vi.fn(),
}

const prismaCarBrand = {
   create: vi.fn(),
   findMany: vi.fn(),
   findUnique: vi.fn(),
   update: vi.fn(),
   delete: vi.fn(),
}

vi.mock('@admin/lib/prisma', () => ({
   default: {
      category: prismaCategory,
      product: prismaProduct,
      brand: prismaBrand,
      carBrand: prismaCarBrand,
   },
}))

// Alias for @/lib/prisma since admin routes use @/ path alias
vi.mock('@/lib/prisma', () => ({
   default: {
      category: prismaCategory,
      product: prismaProduct,
      brand: prismaBrand,
      carBrand: prismaCarBrand,
   },
}))

function makeRequest(
   url: string,
   options?: { method?: string; body?: any; headers?: Record<string, string> }
): Request {
   const { method = 'GET', body, headers = {} } = options ?? {}
   return new Request(
      url.startsWith('http') ? url : `https://admin.xforgea3d.com${url}`,
      {
         method,
         headers: { 'Content-Type': 'application/json', ...headers },
         ...(body ? { body: JSON.stringify(body) } : {}),
      }
   )
}

async function parseJson(res: Response) {
   const text = await res.text()
   try {
      return JSON.parse(text)
   } catch {
      return text
   }
}

// =========================================================================
// CATEGORY CRUD
// =========================================================================

describe('Category API Routes', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('POST /api/categories', () => {
      it('should create a category with valid title', async () => {
         const mockCategory = { id: 'cat-1', title: 'Engine Parts', description: null, imageUrl: null }
         prismaCategory.create.mockResolvedValue(mockCategory)

         const { POST } = await import('@admin/app/api/categories/route')

         const res = await POST(
            makeRequest('/api/categories', {
               method: 'POST',
               body: { title: 'Engine Parts' },
            })
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.title).toBe('Engine Parts')
         expect(prismaCategory.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({ title: 'Engine Parts' }),
            })
         )
      })

      it('should return 400 when title is missing', async () => {
         const { POST } = await import('@admin/app/api/categories/route')

         const res = await POST(
            makeRequest('/api/categories', {
               method: 'POST',
               body: { description: 'No title' },
            })
         )

         expect(res.status).toBe(400)
      })

      it('should connect banner when bannerId is provided', async () => {
         prismaCategory.create.mockResolvedValue({ id: 'cat-2', title: 'Test' })

         const { POST } = await import('@admin/app/api/categories/route')

         await POST(
            makeRequest('/api/categories', {
               method: 'POST',
               body: { title: 'Test', bannerId: 'banner-1' },
            })
         )

         expect(prismaCategory.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({
                  banners: { connect: { id: 'banner-1' } },
               }),
            })
         )
      })
   })

   describe('GET /api/categories', () => {
      it('should return all categories', async () => {
         const categories = [
            { id: 'c1', title: 'A' },
            { id: 'c2', title: 'B' },
         ]
         prismaCategory.findMany.mockResolvedValue(categories)

         const { GET } = await import('@admin/app/api/categories/route')

         const res = await GET(makeRequest('/api/categories'))

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body).toHaveLength(2)
      })
   })

   describe('GET /api/categories/[categoryId]', () => {
      it('should return a single category', async () => {
         prismaCategory.findUnique.mockResolvedValue({ id: 'cat-1', title: 'Engines' })

         const { GET } = await import('@admin/app/api/categories/[categoryId]/route')

         const res = await GET(
            makeRequest('/api/categories/cat-1'),
            { params: { categoryId: 'cat-1' } }
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.title).toBe('Engines')
      })

      it('should return 400 when categoryId is empty', async () => {
         const { GET } = await import('@admin/app/api/categories/[categoryId]/route')

         const res = await GET(
            makeRequest('/api/categories/'),
            { params: { categoryId: '' } }
         )

         expect(res.status).toBe(400)
      })
   })

   describe('PATCH /api/categories/[categoryId]', () => {
      it('should update a category', async () => {
         prismaCategory.update.mockResolvedValue({ id: 'cat-1', title: 'Updated' })

         const { PATCH } = await import('@admin/app/api/categories/[categoryId]/route')

         const res = await PATCH(
            makeRequest('/api/categories/cat-1', {
               method: 'PATCH',
               body: { title: 'Updated' },
            }),
            { params: { categoryId: 'cat-1' } }
         )

         expect(res.status).toBe(200)
         expect(prismaCategory.update).toHaveBeenCalledWith(
            expect.objectContaining({
               where: { id: 'cat-1' },
            })
         )
      })

      it('should return 400 when title is missing on update', async () => {
         const { PATCH } = await import('@admin/app/api/categories/[categoryId]/route')

         const res = await PATCH(
            makeRequest('/api/categories/cat-1', {
               method: 'PATCH',
               body: { description: 'no title' },
            }),
            { params: { categoryId: 'cat-1' } }
         )

         expect(res.status).toBe(400)
      })
   })

   describe('DELETE /api/categories/[categoryId]', () => {
      it('should delete a category', async () => {
         prismaCategory.delete.mockResolvedValue({ id: 'cat-1', title: 'Deleted' })

         const { DELETE } = await import('@admin/app/api/categories/[categoryId]/route')

         const res = await DELETE(
            makeRequest('/api/categories/cat-1', { method: 'DELETE' }),
            { params: { categoryId: 'cat-1' } }
         )

         expect(res.status).toBe(200)
         expect(prismaCategory.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } })
      })

      it('should return 400 when categoryId is empty', async () => {
         const { DELETE } = await import('@admin/app/api/categories/[categoryId]/route')

         const res = await DELETE(
            makeRequest('/api/categories/', { method: 'DELETE' }),
            { params: { categoryId: '' } }
         )

         expect(res.status).toBe(400)
      })
   })
})

// =========================================================================
// PRODUCT CRUD
// =========================================================================

describe('Product API Routes', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('POST /api/products', () => {
      it('should create a product with required fields', async () => {
         const mockProduct = {
            id: 'p1', title: 'Oil Filter', price: 150,
            brand: { id: 'b1' }, categories: [],
         }
         prismaProduct.create.mockResolvedValue(mockProduct)

         const { POST } = await import('@admin/app/api/products/route')

         const res = await POST(
            makeRequest('/api/products', {
               method: 'POST',
               body: { title: 'Oil Filter', brandId: 'b1', price: 150 },
            })
         )

         expect(res.status).toBe(201)
         const body = await parseJson(res)
         expect(body.title).toBe('Oil Filter')
      })

      it('should return 400 when title is missing', async () => {
         const { POST } = await import('@admin/app/api/products/route')

         const res = await POST(
            makeRequest('/api/products', {
               method: 'POST',
               body: { brandId: 'b1' },
            })
         )

         expect(res.status).toBe(400)
         const body = await parseJson(res)
         expect(body).toContain('Title')
      })

      it('should return 400 when brandId is missing', async () => {
         const { POST } = await import('@admin/app/api/products/route')

         const res = await POST(
            makeRequest('/api/products', {
               method: 'POST',
               body: { title: 'Product' },
            })
         )

         expect(res.status).toBe(400)
         const body = await parseJson(res)
         expect(body).toContain('Brand')
      })

      it('should connect categories when categoryIds provided', async () => {
         prismaProduct.create.mockResolvedValue({
            id: 'p1', title: 'T', brand: {}, categories: [],
         })

         const { POST } = await import('@admin/app/api/products/route')

         await POST(
            makeRequest('/api/products', {
               method: 'POST',
               body: {
                  title: 'Test',
                  brandId: 'b1',
                  categoryIds: ['c1', 'c2'],
               },
            })
         )

         expect(prismaProduct.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({
                  categories: { connect: [{ id: 'c1' }, { id: 'c2' }] },
               }),
            })
         )
      })

      it('should default isFeatured to false', async () => {
         prismaProduct.create.mockResolvedValue({
            id: 'p1', title: 'T', brand: {}, categories: [],
         })

         const { POST } = await import('@admin/app/api/products/route')

         await POST(
            makeRequest('/api/products', {
               method: 'POST',
               body: { title: 'Test', brandId: 'b1' },
            })
         )

         expect(prismaProduct.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({
                  isFeatured: false,
               }),
            })
         )
      })
   })

   describe('GET /api/products', () => {
      it('should return products list', async () => {
         prismaProduct.findMany.mockResolvedValue([
            { id: 'p1', title: 'A' },
            { id: 'p2', title: 'B' },
         ])

         const { GET } = await import('@admin/app/api/products/route')

         const res = await GET(makeRequest('/api/products'))
         const body = await parseJson(res)

         expect(body).toHaveLength(2)
      })

      it('should filter by categoryId', async () => {
         prismaProduct.findMany.mockResolvedValue([])

         const { GET } = await import('@admin/app/api/products/route')

         await GET(makeRequest('/api/products?categoryId=cat-1'))

         expect(prismaProduct.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
               where: expect.objectContaining({
                  categories: { some: { id: 'cat-1' } },
               }),
            })
         )
      })
   })

   describe('PATCH /api/products/[productId]', () => {
      it('should validate price is non-negative', async () => {
         const { PATCH } = await import('@admin/app/api/products/[productId]/route')

         const res = await PATCH(
            makeRequest('/api/products/p1', {
               method: 'PATCH',
               body: { price: -10 },
            }),
            { params: { productId: 'p1' } }
         )

         expect(res.status).toBe(400)
         const body = await parseJson(res)
         expect(body).toContain('price')
      })

      it('should validate stock is a non-negative integer', async () => {
         const { PATCH } = await import('@admin/app/api/products/[productId]/route')

         const res = await PATCH(
            makeRequest('/api/products/p1', {
               method: 'PATCH',
               body: { stock: 2.5 },
            }),
            { params: { productId: 'p1' } }
         )

         expect(res.status).toBe(400)
         const body = await parseJson(res)
         expect(body).toContain('stock')
      })

      it('should validate discount is non-negative', async () => {
         const { PATCH } = await import('@admin/app/api/products/[productId]/route')

         const res = await PATCH(
            makeRequest('/api/products/p1', {
               method: 'PATCH',
               body: { discount: -5 },
            }),
            { params: { productId: 'p1' } }
         )

         expect(res.status).toBe(400)
      })

      it('should update product successfully with valid data', async () => {
         prismaProduct.update.mockResolvedValue({
            id: 'p1', title: 'Updated', price: 200,
            brand: {}, categories: [], carModels: [],
         })

         const { PATCH } = await import('@admin/app/api/products/[productId]/route')

         const res = await PATCH(
            makeRequest('/api/products/p1', {
               method: 'PATCH',
               body: { title: 'Updated', price: 200 },
            }),
            { params: { productId: 'p1' } }
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.title).toBe('Updated')
      })

      it('should return 400 when productId is missing', async () => {
         const { PATCH } = await import('@admin/app/api/products/[productId]/route')

         const res = await PATCH(
            makeRequest('/api/products/', {
               method: 'PATCH',
               body: { title: 'Test' },
            }),
            { params: { productId: '' } }
         )

         expect(res.status).toBe(400)
      })
   })

   describe('DELETE /api/products/[productId]', () => {
      it('should delete a product', async () => {
         prismaProduct.delete.mockResolvedValue({ id: 'p1', title: 'Deleted' })

         const { DELETE } = await import('@admin/app/api/products/[productId]/route')

         const res = await DELETE(
            makeRequest('/api/products/p1', { method: 'DELETE' }),
            { params: { productId: 'p1' } }
         )

         expect(res.status).toBe(200)
         expect(prismaProduct.delete).toHaveBeenCalledWith({ where: { id: 'p1' } })
      })
   })
})

// =========================================================================
// BRAND CRUD
// =========================================================================

describe('Brand API Routes', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('POST /api/brands', () => {
      it('should create a brand with title', async () => {
         prismaBrand.create.mockResolvedValue({ id: 'b1', title: 'Bosch' })

         const { POST } = await import('@admin/app/api/brands/route')

         const res = await POST(
            makeRequest('/api/brands', {
               method: 'POST',
               body: { title: 'Bosch' },
            })
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.title).toBe('Bosch')
      })

      it('should return 400 when title is missing', async () => {
         const { POST } = await import('@admin/app/api/brands/route')

         const res = await POST(
            makeRequest('/api/brands', {
               method: 'POST',
               body: { description: 'no title' },
            })
         )

         expect(res.status).toBe(400)
      })
   })

   describe('GET /api/brands', () => {
      it('should return brands sorted alphabetically', async () => {
         prismaBrand.findMany.mockResolvedValue([
            { id: 'b1', title: 'Bosch' },
            { id: 'b2', title: 'NGK' },
         ])

         const { GET } = await import('@admin/app/api/brands/route')

         const res = await GET(makeRequest('/api/brands'))
         const body = await parseJson(res)

         expect(body).toHaveLength(2)
         expect(prismaBrand.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
               orderBy: { title: 'asc' },
            })
         )
      })
   })

   describe('GET /api/brands/[brandId]', () => {
      it('should return brand with products', async () => {
         prismaBrand.findUnique.mockResolvedValue({
            id: 'b1', title: 'Bosch', products: [],
         })

         const { GET } = await import('@admin/app/api/brands/[brandId]/route')

         const res = await GET(
            makeRequest('/api/brands/b1'),
            { params: { brandId: 'b1' } }
         )

         expect(res.status).toBe(200)
         expect(prismaBrand.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
               include: { products: true },
            })
         )
      })

      it('should return 404 when brand not found', async () => {
         prismaBrand.findUnique.mockResolvedValue(null)

         const { GET } = await import('@admin/app/api/brands/[brandId]/route')

         const res = await GET(
            makeRequest('/api/brands/nonexistent'),
            { params: { brandId: 'nonexistent' } }
         )

         expect(res.status).toBe(404)
      })
   })

   describe('PATCH /api/brands/[brandId]', () => {
      it('should update brand fields', async () => {
         prismaBrand.update.mockResolvedValue({ id: 'b1', title: 'Bosch Pro' })

         const { PATCH } = await import('@admin/app/api/brands/[brandId]/route')

         const res = await PATCH(
            makeRequest('/api/brands/b1', {
               method: 'PATCH',
               body: { title: 'Bosch Pro' },
            }),
            { params: { brandId: 'b1' } }
         )

         expect(res.status).toBe(200)
      })

      it('should return 200 when no fields are provided (no-op update)', async () => {
         const { PATCH } = await import('@admin/app/api/brands/[brandId]/route')

         const res = await PATCH(
            makeRequest('/api/brands/b1', {
               method: 'PATCH',
               body: {},
            }),
            { params: { brandId: 'b1' } }
         )

         expect(res.status).toBe(200)
      })
   })

   describe('DELETE /api/brands/[brandId]', () => {
      it('should delete a brand', async () => {
         prismaBrand.delete.mockResolvedValue({ id: 'b1' })

         const { DELETE } = await import('@admin/app/api/brands/[brandId]/route')

         const res = await DELETE(
            makeRequest('/api/brands/b1', { method: 'DELETE' }),
            { params: { brandId: 'b1' } }
         )

         expect(res.status).toBe(200)
      })

      it('should return 400 when brandId is missing', async () => {
         const { DELETE } = await import('@admin/app/api/brands/[brandId]/route')

         const res = await DELETE(
            makeRequest('/api/brands/', { method: 'DELETE' }),
            { params: { brandId: '' } }
         )

         expect(res.status).toBe(400)
      })
   })
})

// =========================================================================
// CAR BRAND CRUD
// =========================================================================

describe('CarBrand API Routes', () => {
   beforeEach(() => {
      vi.clearAllMocks()
   })

   describe('POST /api/car-brands', () => {
      it('should create a car brand with name and slug', async () => {
         prismaCarBrand.create.mockResolvedValue({
            id: 'cb1', name: 'BMW', slug: 'bmw', sortOrder: 0,
         })

         const { POST } = await import('@admin/app/api/car-brands/route')

         const res = await POST(
            makeRequest('/api/car-brands', {
               method: 'POST',
               body: { name: 'BMW', slug: 'bmw' },
            })
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.name).toBe('BMW')
         expect(body.slug).toBe('bmw')
      })

      it('should return 400 when name is missing', async () => {
         const { POST } = await import('@admin/app/api/car-brands/route')

         const res = await POST(
            makeRequest('/api/car-brands', {
               method: 'POST',
               body: { slug: 'bmw' },
            })
         )

         expect(res.status).toBe(400)
      })

      it('should return 400 when slug is missing', async () => {
         const { POST } = await import('@admin/app/api/car-brands/route')

         const res = await POST(
            makeRequest('/api/car-brands', {
               method: 'POST',
               body: { name: 'BMW' },
            })
         )

         expect(res.status).toBe(400)
      })

      it('should default sortOrder to 0', async () => {
         prismaCarBrand.create.mockResolvedValue({ id: 'cb1', name: 'BMW', slug: 'bmw', sortOrder: 0 })

         const { POST } = await import('@admin/app/api/car-brands/route')

         await POST(
            makeRequest('/api/car-brands', {
               method: 'POST',
               body: { name: 'BMW', slug: 'bmw' },
            })
         )

         expect(prismaCarBrand.create).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({ sortOrder: 0 }),
            })
         )
      })
   })

   describe('GET /api/car-brands', () => {
      it('should return car brands ordered by sortOrder', async () => {
         prismaCarBrand.findMany.mockResolvedValue([
            { id: 'cb1', name: 'Audi', sortOrder: 1 },
            { id: 'cb2', name: 'BMW', sortOrder: 2 },
         ])

         const { GET } = await import('@admin/app/api/car-brands/route')

         const res = await GET()
         const body = await parseJson(res)

         expect(body).toHaveLength(2)
         expect(prismaCarBrand.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
               orderBy: { sortOrder: 'asc' },
            })
         )
      })

      it('should include models in response', async () => {
         prismaCarBrand.findMany.mockResolvedValue([
            { id: 'cb1', name: 'BMW', models: [{ id: 'm1', name: '3 Series' }] },
         ])

         const { GET } = await import('@admin/app/api/car-brands/route')

         await GET()

         expect(prismaCarBrand.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
               include: expect.objectContaining({
                  models: expect.anything(),
               }),
            })
         )
      })
   })

   describe('GET /api/car-brands/[brandId]', () => {
      it('should return a car brand with models', async () => {
         prismaCarBrand.findUnique.mockResolvedValue({
            id: 'cb1', name: 'BMW',
            models: [{ id: 'm1', name: '3 Series' }],
         })

         const { GET } = await import('@admin/app/api/car-brands/[brandId]/route')

         const res = await GET(
            makeRequest('/api/car-brands/cb1'),
            { params: { brandId: 'cb1' } }
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.models).toHaveLength(1)
      })

      it('should return 404 when car brand not found', async () => {
         prismaCarBrand.findUnique.mockResolvedValue(null)

         const { GET } = await import('@admin/app/api/car-brands/[brandId]/route')

         const res = await GET(
            makeRequest('/api/car-brands/nonexistent'),
            { params: { brandId: 'nonexistent' } }
         )

         expect(res.status).toBe(404)
      })
   })

   describe('PATCH /api/car-brands/[brandId]', () => {
      it('should update car brand fields', async () => {
         prismaCarBrand.update.mockResolvedValue({ id: 'cb1', name: 'BMW M', slug: 'bmw-m' })

         const { PATCH } = await import('@admin/app/api/car-brands/[brandId]/route')

         const res = await PATCH(
            makeRequest('/api/car-brands/cb1', {
               method: 'PATCH',
               body: { name: 'BMW M', slug: 'bmw-m' },
            }),
            { params: { brandId: 'cb1' } }
         )

         expect(res.status).toBe(200)
         expect(prismaCarBrand.update).toHaveBeenCalledWith(
            expect.objectContaining({
               where: { id: 'cb1' },
            })
         )
      })

      it('should only update provided fields', async () => {
         prismaCarBrand.update.mockResolvedValue({ id: 'cb1', name: 'BMW', sortOrder: 5 })

         const { PATCH } = await import('@admin/app/api/car-brands/[brandId]/route')

         await PATCH(
            makeRequest('/api/car-brands/cb1', {
               method: 'PATCH',
               body: { sortOrder: 5 },
            }),
            { params: { brandId: 'cb1' } }
         )

         expect(prismaCarBrand.update).toHaveBeenCalledWith(
            expect.objectContaining({
               data: expect.objectContaining({ sortOrder: 5 }),
            })
         )
      })
   })

   describe('DELETE /api/car-brands/[brandId]', () => {
      it('should delete a car brand and return ok', async () => {
         prismaCarBrand.delete.mockResolvedValue({ id: 'cb1' })

         const { DELETE } = await import('@admin/app/api/car-brands/[brandId]/route')

         const res = await DELETE(
            makeRequest('/api/car-brands/cb1', { method: 'DELETE' }),
            { params: { brandId: 'cb1' } }
         )

         expect(res.status).toBe(200)
         const body = await parseJson(res)
         expect(body.ok).toBe(true)
      })

      it('should return 500 on prisma error', async () => {
         prismaCarBrand.delete.mockRejectedValue(new Error('FK constraint'))

         const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

         const { DELETE } = await import('@admin/app/api/car-brands/[brandId]/route')

         const res = await DELETE(
            makeRequest('/api/car-brands/cb1', { method: 'DELETE' }),
            { params: { brandId: 'cb1' } }
         )

         expect(res.status).toBe(500)
         consoleSpy.mockRestore()
      })
   })
})
