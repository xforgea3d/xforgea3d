import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * Prisma singleton with connection pool tuning.
 *
 * The default pool size in Prisma with Supabase is limited.
 * Using connection_limit=5 and pool_timeout=20 prevents the
 * "Timed out fetching a new connection from the connection pool"
 * error when running parallel queries (Promise.all).
 *
 * For Supabase, use the POOLER (port 6543) URL as DATABASE_URL
 * and the DIRECT (port 5432) URL as DIRECT_URL in .env.
 */
export const prisma =
   globalForPrisma.prisma ??
   new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      datasources: {
         db: {
            url: process.env.DATABASE_URL,
         },
      },
   })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
