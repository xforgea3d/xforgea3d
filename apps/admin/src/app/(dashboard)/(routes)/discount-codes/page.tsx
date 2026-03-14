export const revalidate = 0
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { columns, type DiscountCodeColumn } from './components/columns'

export default async function DiscountCodesPage() {
   let codes: any[] = []
   try {
      codes = await prisma.discountCode.findMany({
         include: {
            _count: { select: { order: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 200,
      })
   } catch (error) {
      console.warn('[DiscountCodesPage] Failed to fetch codes:', error)
   }

   const now = new Date()

   const formattedCodes: DiscountCodeColumn[] = codes.map((code) => {
      const isActive = now >= code.startDate && now <= code.endDate && code.stock > 0
      return {
         id: code.id,
         code: code.code,
         percent: code.percent,
         maxDiscountAmount: code.maxDiscountAmount,
         stock: code.stock,
         usageCount: code._count.order,
         startDate: format(code.startDate, 'dd.MM.yyyy'),
         endDate: format(code.endDate, 'dd.MM.yyyy'),
         isActive,
      }
   })

   return (
      <div className="my-6 block space-y-4">
         <div className="flex items-center justify-between">
            <Heading
               title={`Kupon Kodlari (${codes.length})`}
               description="Indirim kuponlarini yonetin."
            />
            <Link href="/discount-codes/new">
               <Button>
                  <Plus className="mr-2 h-4" /> Yeni Kupon
               </Button>
            </Link>
         </div>
         <Separator />
         <DataTable searchKey="code" columns={columns} data={formattedCodes} />
      </div>
   )
}
