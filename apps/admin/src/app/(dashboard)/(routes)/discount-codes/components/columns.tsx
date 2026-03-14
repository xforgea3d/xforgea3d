'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { EditIcon } from 'lucide-react'
import Link from 'next/link'

export type DiscountCodeColumn = {
   id: string
   code: string
   percent: number
   maxDiscountAmount: number
   stock: number
   usageCount: number
   startDate: string
   endDate: string
   isActive: boolean
}

export const columns: ColumnDef<DiscountCodeColumn>[] = [
   {
      accessorKey: 'code',
      header: 'Kupon Kodu',
      cell: ({ row }) => (
         <span className="font-mono font-semibold">{row.original.code}</span>
      ),
   },
   {
      accessorKey: 'percent',
      header: 'Indirim %',
      cell: ({ row }) => `%${row.original.percent}`,
   },
   {
      accessorKey: 'maxDiscountAmount',
      header: 'Maks. Indirim',
      cell: ({ row }) =>
         row.original.maxDiscountAmount.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
         }),
   },
   {
      accessorKey: 'stock',
      header: 'Stok',
   },
   {
      accessorKey: 'usageCount',
      header: 'Kullanim',
   },
   {
      accessorKey: 'startDate',
      header: 'Baslangic',
   },
   {
      accessorKey: 'endDate',
      header: 'Bitis',
   },
   {
      accessorKey: 'isActive',
      header: 'Durum',
      cell: ({ row }) => (
         <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'Aktif' : 'Pasif'}
         </Badge>
      ),
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/discount-codes/${row.original.id}`}>
            <Button size="icon" variant="outline">
               <EditIcon className="h-4" />
            </Button>
         </Link>
      ),
   },
]
