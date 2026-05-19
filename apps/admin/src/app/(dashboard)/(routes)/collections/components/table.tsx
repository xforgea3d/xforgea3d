'use client'

import { adminPath } from '@/lib/base-path'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { EditIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/alert-modal'

export type BrandColumn = {
   id: string
   title: string
   products: number
}

interface BrandsClientProps {
   data: BrandColumn[]
}

export const BrandsClient: React.FC<BrandsClientProps> = ({ data }) => {
   const router = useRouter()
   const [deleteId, setDeleteId] = useState<string | null>(null)
   const [loading, setLoading] = useState(false)

   const onDelete = async () => {
      if (!deleteId) return
      try {
         setLoading(true)
         const res = await fetch(adminPath(`/api/collections/${deleteId}`), { method: 'DELETE' })
         if (!res.ok) throw new Error('Silme başarısız')
         toast.success('Koleksiyon silindi.')
         router.refresh()
      } catch {
         toast.error('Koleksiyon silinemedi. Önce bu koleksiyona ait ürünleri kaldırın.')
      } finally {
         setLoading(false)
         setDeleteId(null)
      }
   }

   const columns: ColumnDef<BrandColumn>[] = [
      {
         accessorKey: 'title',
         header: 'Başlık',
      },
      {
         accessorKey: 'products',
         header: 'Ürün Sayısı',
      },
      {
         id: 'actions',
         cell: ({ row }) => (
            <div className="flex items-center gap-1">
               <Link href={`/collections/${row.original.id}`}>
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
         <DataTable searchKey="title" columns={columns} data={data} />
      </>
   )
}
