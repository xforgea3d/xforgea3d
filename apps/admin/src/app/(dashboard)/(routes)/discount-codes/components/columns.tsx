'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/modals/alert-modal'
import { ColumnDef } from '@tanstack/react-table'
import { Copy, EditIcon, Trash } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

const CopyableCode = ({ code }: { code: string }) => {
   const handleCopy = () => {
      navigator.clipboard.writeText(code)
      toast.success('Kod kopyalandı!')
   }

   return (
      <button
         onClick={handleCopy}
         className="flex items-center gap-1.5 font-mono font-semibold hover:text-primary transition-colors cursor-pointer group"
         title="Kopyalamak için tıklayın"
      >
         {code}
         <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
      </button>
   )
}

const DeleteAction = ({ id }: { id: string }) => {
   const router = useRouter()
   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const onDelete = async () => {
      try {
         setLoading(true)
         const res = await fetch(`/api/discount-codes/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme başarısız')
         toast.success('Kupon silindi.')
         window.location.reload()
      } catch {
         toast.error('Kupon silinemedi.')
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
         />
         <Button
            size="icon"
            variant="destructive"
            disabled={loading}
            onClick={() => setOpen(true)}
         >
            <Trash className="h-4" />
         </Button>
      </>
   )
}

export const columns: ColumnDef<DiscountCodeColumn>[] = [
   {
      accessorKey: 'code',
      header: 'Kupon Kodu',
      cell: ({ row }) => <CopyableCode code={row.original.code} />,
   },
   {
      accessorKey: 'percent',
      header: 'İndirim %',
      cell: ({ row }) => `%${row.original.percent}`,
   },
   {
      accessorKey: 'maxDiscountAmount',
      header: 'Maks. İndirim',
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
      header: 'Kullanım',
   },
   {
      accessorKey: 'startDate',
      header: 'Başlangıç',
   },
   {
      accessorKey: 'endDate',
      header: 'Bitiş',
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
         <div className="flex items-center gap-2">
            <Link href={`/discount-codes/${row.original.id}`}>
               <Button size="icon" variant="outline">
                  <EditIcon className="h-4" />
               </Button>
            </Link>
            <DeleteAction id={row.original.id} />
         </div>
      ),
   },
]
