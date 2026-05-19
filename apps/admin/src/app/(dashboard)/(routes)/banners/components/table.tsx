'use client'

import { adminPath } from '@/lib/base-path'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/modals/alert-modal'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { EditIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export type BannersColumn = {
   id: string
   label: string
   createdAt: string
}

interface BannerClientProps {
   data: BannersColumn[]
}

export const BannersClient: React.FC<BannerClientProps> = ({ data }) => {
   const router = useRouter()
   const [deleteId, setDeleteId] = useState<string | null>(null)
   const [loading, setLoading] = useState(false)

   const onDelete = async () => {
      if (!deleteId) return
      try {
         setLoading(true)
         const res = await fetch(adminPath(`/api/banners/${deleteId}`), { method: 'DELETE' })
         if (!res.ok) throw new Error('Silme basarisiz')
         toast.success('Banner silindi.')
         router.refresh()
      } catch {
         toast.error('Banner silinemedi.')
      } finally {
         setLoading(false)
         setDeleteId(null)
      }
   }

   const columns: ColumnDef<BannersColumn>[] = [
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
            <div className="flex items-center gap-1">
               <Link href={`/banners/${row.original.id}`}>
                  <Button size="icon" variant="outline">
                     <EditIcon className="h-4" />
                  </Button>
               </Link>
               <Button
                  size="icon"
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setDeleteId(row.original.id)}
               >
                  <Trash2Icon className="h-4" />
               </Button>
            </div>
         ),
      },
   ]

   return (
      <>
         <AlertModal
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={onDelete}
            loading={loading}
         />
         <DataTable searchKey="label" columns={columns} data={data} />
      </>
   )
}
