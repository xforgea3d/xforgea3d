'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ColumnDef } from '@tanstack/react-table'
import { EditIcon } from 'lucide-react'
import Link from 'next/link'

export type QuoteColumn = {
   id: string
   number: string
   email: string
   name: string
   partDescription: string
   carBrand: string
   status: string
   statusRaw: string
   quotedPrice: string
   createdAt: string
}

const statusColors: Record<string, string> = {
   Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
   Priced: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
   Accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
   Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
   Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export const QuoteColumns: ColumnDef<QuoteColumn>[] = [
   {
      accessorKey: 'number',
      header: 'No',
   },
   {
      accessorKey: 'name',
      header: 'Ad',
   },
   {
      accessorKey: 'email',
      header: 'E-posta',
   },
   {
      accessorKey: 'partDescription',
      header: 'Parca',
   },
   {
      accessorKey: 'carBrand',
      header: 'Marka',
   },
   {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => (
         <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[row.original.statusRaw] || 'bg-gray-100 text-gray-800'}`}
         >
            {row.original.status}
         </span>
      ),
   },
   {
      accessorKey: 'quotedPrice',
      header: 'Fiyat',
   },
   {
      accessorKey: 'createdAt',
      header: 'Tarih',
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/quote-requests/${row.original.id}`}>
            <Button size="icon" variant="outline">
               <EditIcon className="h-4" />
            </Button>
         </Link>
      ),
   },
]

type TabKey = 'pending' | 'priced' | 'accepted' | 'rejected' | 'all'

const TAB_FILTERS: Record<TabKey, (r: QuoteColumn) => boolean> = {
   pending: (r) => r.statusRaw === 'Pending',
   priced: (r) => r.statusRaw === 'Priced',
   accepted: (r) => r.statusRaw === 'Accepted',
   rejected: (r) => r.statusRaw === 'Rejected',
   all: () => true,
}

interface QuoteTableWithTabsProps {
   data: QuoteColumn[]
   counts: {
      Pending: number
      Priced: number
      Accepted: number
      Rejected: number
      all: number
   }
}

export const QuoteTableWithTabs: React.FC<QuoteTableWithTabsProps> = ({ data, counts }) => {
   const [search, setSearch] = useState('')
   const [activeTab, setActiveTab] = useState<TabKey>('all')

   const filteredData = useMemo(() => {
      const tabFilter = TAB_FILTERS[activeTab]
      return data.filter((r) => {
         const q = search.toLowerCase()
         const matchesSearch =
            search === '' ||
            r.name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.number.toLowerCase().includes(q) ||
            r.partDescription.toLowerCase().includes(q)
         return matchesSearch && tabFilter(r)
      })
   }, [data, search, activeTab])

   const tabs: { key: TabKey; label: string; count: number }[] = [
      { key: 'pending', label: 'Bekleyen', count: counts.Pending },
      { key: 'priced', label: 'Fiyatlandirilan', count: counts.Priced },
      { key: 'accepted', label: 'Kabul Edilen', count: counts.Accepted },
      { key: 'rejected', label: 'Reddedilen', count: counts.Rejected },
      { key: 'all', label: 'Tumu', count: counts.all },
   ]

   return (
      <div>
         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
               {tabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
                     {tab.label}
                     <Badge
                        variant={activeTab === tab.key ? 'default' : 'secondary'}
                        className="text-[10px] h-5 min-w-[20px] px-1.5"
                     >
                        {tab.count}
                     </Badge>
                  </TabsTrigger>
               ))}
            </TabsList>

            <div className="flex items-center gap-3 py-4">
               <Input
                  placeholder="Ad, e-posta veya parca ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
               />
            </div>

            {tabs.map((tab) => (
               <TabsContent key={tab.key} value={tab.key}>
                  <DataTable columns={QuoteColumns} data={filteredData} />
               </TabsContent>
            ))}
         </Tabs>
      </div>
   )
}

// Keep backward compat export
interface QuoteTableProps {
   data: QuoteColumn[]
}
export const QuoteTable: React.FC<QuoteTableProps> = ({ data }) => {
   return <DataTable searchKey="email" columns={QuoteColumns} data={data} />
}
