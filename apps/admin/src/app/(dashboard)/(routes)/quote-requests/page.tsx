export const revalidate = 0

import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'

import type { QuoteColumn } from './components/table'
import { QuoteTableWithTabs } from './components/table'

const statusLabels: Record<string, string> = {
   Pending: 'Beklemede',
   Priced: 'Fiyatlandirildi',
   Accepted: 'Kabul Edildi',
   Rejected: 'Reddedildi',
   Completed: 'Tamamlandi',
}

export default async function QuoteRequestsPage() {
   let requests: any[] = []
   try {
      requests = await prisma.quoteRequest.findMany({
         include: {
            user: { select: { name: true, email: true } },
            carBrand: { select: { name: true } },
            carModel: { select: { name: true } },
         },
         orderBy: { createdAt: 'desc' },
         take: 200,
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

   // Counts for tabs
   const counts = {
      Pending: formatted.filter((r) => r.statusRaw === 'Pending').length,
      Priced: formatted.filter((r) => r.statusRaw === 'Priced').length,
      Accepted: formatted.filter((r) => r.statusRaw === 'Accepted').length,
      Rejected: formatted.filter((r) => r.statusRaw === 'Rejected').length,
      all: formatted.length,
   }

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Parca Talepleri (${requests.length})`}
            description="Musteri parca taleplerini yonetin"
         />
         <Separator />
         <QuoteTableWithTabs data={formatted} counts={counts} />
      </div>
   )
}
