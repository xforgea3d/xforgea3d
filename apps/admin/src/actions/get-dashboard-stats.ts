import prisma from '@/lib/prisma'

const SYSTEM_PRODUCT_ID = 'quote-request-product'

export async function getDashboardStats() {
   const start = Date.now()

   try {
      const [
         revenueResult,
         salesCount,
         stockCount,
         errorCount,
         pendingOrders,
         pendingQuotes,
         pendingReturns,
         totalUsers,
         totalProducts,
         totalOrders,
         lowStockProducts,
         productsWithoutImages,
         productsWithLowStock,
         campaignsWithoutProducts,
         campaignsWithoutDiscount,
         bannerCount,
      ] = await Promise.all([
         prisma.order.aggregate({ where: { isPaid: true }, _sum: { payable: true } }),
         prisma.order.count({ where: { isPaid: true } }),
         prisma.product.count({ where: { isAvailable: true, id: { not: SYSTEM_PRODUCT_ID } } }),
         prisma.error.count({ where: { resolved: false, severity: { in: ['critical', 'high'] } } }),
         prisma.order.count({ where: { status: 'OnayBekleniyor', isPaid: true } }),
         prisma.quoteRequest.count({ where: { status: 'Pending' } }),
         prisma.returnRequest.count({ where: { status: 'Pending' } }),
         prisma.profile.count(),
         prisma.product.count({ where: { id: { not: SYSTEM_PRODUCT_ID } } }),
         prisma.order.count(),
         prisma.product.count({ where: { stock: { lte: 5 }, isAvailable: true, id: { not: SYSTEM_PRODUCT_ID } } }),
         prisma.product.count({ where: { images: { isEmpty: true }, id: { not: SYSTEM_PRODUCT_ID } } }),
         prisma.product.count({ where: { stock: { lte: 3 }, isAvailable: true, id: { not: SYSTEM_PRODUCT_ID } } }),
         prisma.campaign.count({ where: { isActive: true, products: { none: {} } } }),
         prisma.campaign.count({ where: { isActive: true, discountCodeId: null } }),
         prisma.banner.count(),
      ])

      const dbLatency = Date.now() - start

      return {
         totalRevenue: revenueResult._sum.payable || 0,
         salesCount,
         stockCount,
         dbLatency,
         errorCount,
         pendingOrders,
         pendingQuotes,
         pendingReturns,
         totalUsers,
         totalProducts,
         totalOrders,
         lowStockProducts,
         productsWithoutImages,
         productsWithLowStock,
         campaignsWithoutProducts,
         campaignsWithoutDiscount,
         noBanners: bannerCount === 0,
         dbStatus: (dbLatency < 3000 ? 'healthy' : dbLatency < 5000 ? 'slow' : 'critical') as 'healthy' | 'slow' | 'critical',
      }
   } catch {
      return {
         totalRevenue: 0,
         salesCount: 0,
         stockCount: 0,
         dbLatency: -1,
         errorCount: -1,
         pendingOrders: 0,
         pendingQuotes: 0,
         pendingReturns: 0,
         totalUsers: 0,
         totalProducts: 0,
         totalOrders: 0,
         lowStockProducts: 0,
         productsWithoutImages: 0,
         productsWithLowStock: 0,
         campaignsWithoutProducts: 0,
         campaignsWithoutDiscount: 0,
         noBanners: false,
         dbStatus: 'down' as const,
      }
   }
}
