'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, DownloadIcon, EditIcon, XIcon } from 'lucide-react'
import Link from 'next/link'

interface OrderTableProps {
   data: OrderColumn[]
}

export const OrderTable: React.FC<OrderTableProps> = ({ data }) => {
   const [search, setSearch] = useState('')
   const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

   const filteredData = useMemo(() => {
      return data.filter((order) => {
         const matchesSearch =
            search === '' || order.number.toLowerCase().includes(search.toLowerCase())
         const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'paid' && order.isPaid) ||
            (statusFilter === 'unpaid' && !order.isPaid)
         return matchesSearch && matchesStatus
      })
   }, [data, search, statusFilter])

   const exportCSV = () => {
      const BOM = '\uFEFF'
      const headers = ['Sipariş No', 'Toplam', 'Durum', 'Tarih']
      const rows = filteredData.map((order) => [
         order.number,
         order.payable,
         order.isPaid ? 'Ödendi' : 'Ödenmedi',
         order.createdAt,
      ])
      const csv =
         BOM +
         [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'siparisler.csv'
      link.click()
      URL.revokeObjectURL(url)
   }

   return (
      <div>
         <div className="flex items-center gap-3 py-4">
            <Input
               placeholder="Sipariş numarası ile ara..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="max-w-sm"
            />
            <div className="flex items-center gap-2">
               <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
               >
                  Tümü
               </Button>
               <Button
                  variant={statusFilter === 'paid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('paid')}
               >
                  Ödendi
               </Button>
               <Button
                  variant={statusFilter === 'unpaid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('unpaid')}
               >
                  Ödenmedi
               </Button>
            </div>
            <div className="ml-auto">
               <Button variant="outline" size="sm" onClick={exportCSV}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Excel&apos;e Aktar
               </Button>
            </div>
         </div>
         <DataTable columns={OrderColumns} data={filteredData} />
      </div>
   )
}

export type OrderColumn = {
   id: string
   isPaid: boolean
   payable: string
   number: string
   createdAt: string
}

export const OrderColumns: ColumnDef<OrderColumn>[] = [
   {
      accessorKey: 'number',
      header: 'Sipariş No',
   },
   {
      accessorKey: 'date',
      header: 'Tarih',
   },
   {
      accessorKey: 'payable',
      header: 'Tutar',
   },
   {
      accessorKey: 'isPaid',
      header: 'Ödendi',
      cell: (props) => (props.cell.getValue() ? <CheckIcon /> : <XIcon />),
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/orders/${row.original.id}`}>
            <Button size="icon" variant="outline">
               <EditIcon className="h-4" />
            </Button>
         </Link>
      ),
   },
]
