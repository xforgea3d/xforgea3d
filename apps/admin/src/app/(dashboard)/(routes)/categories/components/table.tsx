'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { EditIcon, EyeIcon, EyeOffIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/alert-modal'

export type CategoryColumn = {
   id: string
   title: string
   products: number
   isVisible: boolean
}

interface CategoriesClientProps {
   data: CategoryColumn[]
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({ data }) => {
   const router = useRouter()
   const [deleteId, setDeleteId] = useState<string | null>(null)
   const [loading, setLoading] = useState(false)
   const [togglingId, setTogglingId] = useState<string | null>(null)

   const onDelete = async () => {
      if (!deleteId) return
      try {
         setLoading(true)
         const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' })
         if (!res.ok) throw new Error('Silme başarısız')
         toast.success('Kategori silindi.')
         router.refresh()
      } catch {
         toast.error('Kategori silinemedi. Önce bu kategoriyi kullanan ürünleri kaldırın.')
      } finally {
         setLoading(false)
         setDeleteId(null)
      }
   }

   const onToggleVisibility = async (id: string, currentValue: boolean) => {
      try {
         setTogglingId(id)
         const res = await fetch(`/api/categories/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isVisible: !currentValue }),
         })
         if (!res.ok) throw new Error('Güncelleme başarısız')
         toast.success(currentValue ? 'Kategori gizlendi.' : 'Kategori görünür yapıldı.')
         router.refresh()
      } catch {
         toast.error('Görünürlük güncellenemedi.')
      } finally {
         setTogglingId(null)
      }
   }

   const columns: ColumnDef<CategoryColumn>[] = [
      {
         accessorKey: 'title',
         header: 'Başlık',
      },
      {
         accessorKey: 'products',
         header: 'Ürün Sayısı',
      },
      {
         accessorKey: 'isVisible',
         header: 'Durum',
         cell: ({ row }) => {
            const isVisible = row.original.isVisible
            const isToggling = togglingId === row.original.id

            return (
               <button
                  onClick={() => onToggleVisibility(row.original.id, isVisible)}
                  disabled={isToggling}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                     isVisible
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
               >
                  {isToggling ? (
                     <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                  ) : isVisible ? (
                     <EyeIcon className="h-3.5 w-3.5" />
                  ) : (
                     <EyeOffIcon className="h-3.5 w-3.5" />
                  )}
                  {isVisible ? 'Görünür' : 'Gizli'}
               </button>
            )
         },
      },
      {
         id: 'actions',
         cell: ({ row }) => (
            <div className="flex items-center gap-1">
               <Link href={`/categories/${row.original.id}`}>
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
