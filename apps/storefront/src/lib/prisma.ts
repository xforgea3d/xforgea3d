import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
   globalForPrisma.prisma ??
   new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
   })

// Cache in all environments (Vercel serverless reuses the global scope)
globalForPrisma.prisma = prisma

export default prisma
