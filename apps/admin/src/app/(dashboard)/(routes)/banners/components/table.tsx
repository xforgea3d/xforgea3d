'use client'

import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'

import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { EditIcon } from 'lucide-react'

export type BannersColumn = {
   id: string
   label: string
   createdAt: string
}

export const columns: ColumnDef<BannersColumn>[] = [
   {
      accessorKey: 'label',
      header: 'Etiket',
   },
   {
      accessorKey: 'createdAt',
      header: 'Tarih',
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/banners/${row.original.id}`}>
            <Button size="icon" variant="outline">
               <EditIcon className="h-4" />
            </Button>
         </Link>
      ),
   },
]

interface BannerClientProps {
   data: BannersColumn[]
}

export const BannersClient: React.FC<BannerClientProps> = ({ data }) => {
   return <DataTable searchKey="label" columns={columns} data={data} />
}
