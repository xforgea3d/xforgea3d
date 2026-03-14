'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, EditIcon, ImageIcon, Trash2Icon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/alert-modal'

interface ProductsTableProps {
   data: ProductColumn[]
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ data }) => {
   const router = useRouter()
   const [deleteId, setDeleteId] = useState<string | null>(null)
   const [loading, setLoading] = useState(false)

   const onDelete = async () => {
      if (!deleteId) return
      try {
         setLoading(true)
         const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
         if (!res.ok) throw new Error('Silme başarısız')
         toast.success('Ürün silindi.')
         router.refresh()
      } catch {
         toast.error('Ürün silinemedi. Önce ilişkili siparişleri kontrol edin.')
      } finally {
         setLoading(false)
         setDeleteId(null)
      }
   }

   const columns: ColumnDef<ProductColumn>[] = [
      {
         accessorKey: 'image',
         header: '',
         cell: ({ row }) => (
            row.original.image ? (
               <img
                  src={row.original.image}
                  alt={row.original.title}
                  className="h-10 w-10 rounded-md object-cover border"
               />
            ) : (
               <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
               </div>
            )
         ),
         enableSorting: false,
      },
      {
         accessorKey: 'title',
         header: 'Başlık',
      },
      {
         accessorKey: 'price',
         header: 'Fiyat',
      },
      {
         accessorKey: 'discount',
         header: 'İndirim',
      },
      {
         accessorKey: 'category',
         header: 'Kategori',
      },
      {
         accessorKey: 'brand',
         header: 'Koleksiyon',
         cell: ({ row }) => (
            <span className={row.original.brand === '-' ? 'text-muted-foreground' : ''}>
               {row.original.brand}
            </span>
         ),
      },
      {
         accessorKey: 'sales',
         header: 'Satış',
      },
      {
         accessorKey: 'isAvailable',
         header: 'Durum',
         cell: (props) => (props.cell.getValue() ? <CheckIcon /> : <XIcon />),
      },
      {
         id: 'actions',
         cell: ({ row }) => (
            <div className="flex items-center gap-1">
               <Link href={`/products/${row.original.id}`}>
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

export type ProductColumn = {
   id: string
   image: string | null
   title: string
   price: string
   discount: string
   category: string
   brand: string
   sales: number
   isAvailable: boolean
}
