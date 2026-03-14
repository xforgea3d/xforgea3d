'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { EditIcon } from 'lucide-react'
import Link from 'next/link'

export type PaymentColumn = {
   id: string
   number: string
   status: string
   refId: string
   cardPan: string
   orderNumber: string
   userEmail: string
   payable: string
   isSuccessful: boolean
   createdAt: string
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
   Paid: { label: 'Basarili', variant: 'default' },
   Failed: { label: 'Basarisiz', variant: 'destructive' },
   Processing: { label: 'Beklemede', variant: 'outline' },
   Denied: { label: 'Reddedildi', variant: 'secondary' },
}

export const columns: ColumnDef<PaymentColumn>[] = [
   {
      accessorKey: 'number',
      header: 'Odeme No',
   },
   {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => {
         const status = row.original.status
         const config = statusConfig[status] || { label: status, variant: 'outline' as const }
         return <Badge variant={config.variant}>{config.label}</Badge>
      },
   },
   {
      accessorKey: 'refId',
      header: 'Ref ID',
      cell: ({ row }) => (
         <span className="font-mono text-xs">{row.original.refId}</span>
      ),
   },
   {
      accessorKey: 'cardPan',
      header: 'Kart',
      cell: ({ row }) => (
         <span className="font-mono text-xs">{row.original.cardPan || '-'}</span>
      ),
   },
   {
      accessorKey: 'orderNumber',
      header: 'Siparis',
   },
   {
      accessorKey: 'userEmail',
      header: 'Kullanici',
      cell: ({ row }) => (
         <span className="text-xs">{row.original.userEmail}</span>
      ),
   },
   {
      accessorKey: 'payable',
      header: 'Tutar',
   },
   {
      accessorKey: 'createdAt',
      header: 'Tarih',
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/payments/${row.original.id}`}>
            <Button size="icon" variant="outline">
               <EditIcon className="h-4" />
            </Button>
         </Link>
      ),
   },
]
