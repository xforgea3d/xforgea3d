import prisma from '@/lib/prisma'

export const getStockCount = async () => {
   return await prisma.product.count({
      where: {
         isAvailable: true,
         id: { not: 'quote-request-product' },
      },
   })
}
