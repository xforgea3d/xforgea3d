export const revalidate = 30

import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'

import type { QuoteColumn } from './components/table'
import { QuoteTable } from './components/table'

const statusLabels: Record<string, string> = {
   Pending: 'Beklemede',
   Priced: 'Fiyatlandırıldı',
   Accepted: 'Kabul Edildi',
   Rejected: 'Reddedildi',
   Completed: 'Tamamlandı',
}

export default async function QuoteRequestsPage({
   searchParams,
}: {
   searchParams: { status?: string }
}) {
   const { status } = searchParams ?? {}

   let requests: any[] = []
   try {
      requests = await prisma.quoteRequest.findMany({
         where: {
            ...(status && { status: status as any }),
         },
         include: {
            user: { select: { name: true, email: true } },
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 100,
      })
   } catch (error) {
      console.warn('[QuoteRequestsPage] Failed to fetch:', error)
   }

   const formatted: QuoteColumn[] = requests.map((r) => ({
      id: r.id,
      number: `#${r.number}`,
      email: r.email,
      name: r.name || r.user?.name || '-',
      partDescription:
         r.partDescription.length > 60
            ? r.partDescription.slice(0, 60) + '...'
            : r.partDescription,
      carBrand: r.carBrand?.name || '-',
      status: statusLabels[r.status] || r.status,
      statusRaw: r.status,
      quotedPrice: r.quotedPrice ? `${r.quotedPrice.toFixed(2)} TL` : '-',
      createdAt: format(r.createdAt, 'dd.MM.yyyy HH:mm'),
   }))

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Parça Talepleri (${requests.length})`}
            description="Müşteri parça taleplerini yönetin"
         />
         <Separator />
         <QuoteTable data={formatted} />
      </div>
   )
}
