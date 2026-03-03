'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
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
   Pending: 'bg-yellow-100 text-yellow-800',
   Priced: 'bg-blue-100 text-blue-800',
   Accepted: 'bg-green-100 text-green-800',
   Rejected: 'bg-red-100 text-red-800',
   Completed: 'bg-gray-100 text-gray-800',
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
      header: 'Parça',
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

interface QuoteTableProps {
   data: QuoteColumn[]
}

export const QuoteTable: React.FC<QuoteTableProps> = ({ data }) => {
   return <DataTable searchKey="email" columns={QuoteColumns} data={data} />
}
