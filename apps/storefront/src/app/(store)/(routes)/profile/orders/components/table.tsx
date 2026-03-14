'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, XIcon } from 'lucide-react'
import { EditIcon as Icon } from 'lucide-react'
import Link from 'next/link'

const statusMap: Record<string, { label: string; color: string }> = {
   OnayBekleniyor: { label: 'Onay Bekleniyor', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
   Hazirlaniyor: { label: 'Hazırlanıyor', color: 'bg-orange-100 text-orange-800 border-orange-200' },
   Uretimde: { label: 'Üretimde', color: 'bg-blue-100 text-blue-800 border-blue-200' },
   Processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800 border-blue-200' },
   KargoyaVerildi: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800 border-purple-200' },
   Shipped: { label: 'Kargoya Verildi', color: 'bg-purple-100 text-purple-800 border-purple-200' },
   TeslimEdildi: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800 border-green-200' },
   Delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800 border-green-200' },
   IptalEdildi: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800 border-red-200' },
   Cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800 border-red-200' },
   IadeEdildi: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800 border-gray-200' },
   ReturnProcessing: { label: 'İade İşleniyor', color: 'bg-orange-100 text-orange-800 border-orange-200' },
   ReturnCompleted: { label: 'İade Edildi', color: 'bg-gray-100 text-gray-800 border-gray-200' },
   RefundProcessing: { label: 'İade İşleniyor', color: 'bg-orange-100 text-orange-800 border-orange-200' },
   RefundCompleted: { label: 'İade Tamamlandı', color: 'bg-gray-100 text-gray-800 border-gray-200' },
   Denied: { label: 'Reddedildi', color: 'bg-red-100 text-red-800 border-red-200' },
}

export type OrderColumn = {
   id: string
   isPaid: boolean
   payable: string
   number: string
   createdAt: string
   status: string
}

export const columns: ColumnDef<OrderColumn>[] = [
   {
      accessorKey: 'number',
      header: 'Sipariş No',
   },
   {
      accessorKey: 'date',
      header: 'Tarih',
   },
   {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => {
         const status = row.original.status
         const mapped = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' }
         return (
            <Badge className={`${mapped.color} text-xs font-medium border`}>
               {mapped.label}
            </Badge>
         )
      },
   },
   {
      accessorKey: 'payable',
      header: 'Tutar',
   },
   {
      accessorKey: 'isPaid',
      header: 'Ödeme',
      cell: (props) => {
         return props.cell.getValue() ? (
            <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">Ödendi</Badge>
         ) : (
            <Badge className="bg-red-100 text-red-800 border border-red-200 text-xs">Bekleniyor</Badge>
         )
      },
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/profile/orders/${row.original.id}`}>
            <Button size="icon" variant="outline">
               <Icon className="h-4" />
            </Button>
         </Link>
      ),
   },
]

interface OrdersTableProps {
   data: OrderColumn[]
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ data }) => {
   return <DataTable searchKey="number" columns={columns} data={data} />
}
