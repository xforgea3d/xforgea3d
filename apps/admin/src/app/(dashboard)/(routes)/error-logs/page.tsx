export const revalidate = 0
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'

import { ErrorLogsTable, type ErrorLogColumn } from './components/table'

export default async function ErrorLogsPage() {
   const [errors, stats] = await Promise.all([
      prisma.error.findMany({
         include: { user: { select: { name: true, email: true } } },
         orderBy: { createdAt: 'desc' },
         take: 200,
      }),
      prisma.error.groupBy({
         by: ['severity'],
         _count: true,
         where: { resolved: false },
      }),
   ])

   const criticalCount = stats.find(s => s.severity === 'critical')?._count ?? 0
   const highCount = stats.find(s => s.severity === 'high')?._count ?? 0
   const mediumCount = stats.find(s => s.severity === 'medium')?._count ?? 0
   const lowCount = stats.find(s => s.severity === 'low')?._count ?? 0

   const formatted: ErrorLogColumn[] = errors.map((e) => ({
      id: e.id,
      message: e.message,
      stack: e.stack,
      severity: e.severity,
      source: e.source,
      path: e.path,
      method: e.method,
      statusCode: e.statusCode,
      userAgent: e.userAgent,
      ip: e.ip,
      resolved: e.resolved,
      userName: e.user?.name || e.user?.email || null,
      userId: e.userId,
      createdAt: e.createdAt.toISOString(),
      metadata: e.metadata as any,
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading
               title={`Hata Loglari (${errors.length})`}
               description="Tum frontend ve backend hatalarini izle"
            />
            <div className="flex items-center gap-3 text-sm">
               {criticalCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 font-medium">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     {criticalCount} Kritik
                  </span>
               )}
               {highCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 font-medium">
                     <span className="w-2 h-2 rounded-full bg-orange-500" />
                     {highCount} Yuksek
                  </span>
               )}
               {mediumCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 font-medium">
                     {mediumCount} Orta
                  </span>
               )}
               {lowCount > 0 && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 font-medium">
                     {lowCount} Dusuk
                  </span>
               )}
            </div>
         </div>
         <Separator />
         <ErrorLogsTable data={formatted} />
      </div>
   )
}
