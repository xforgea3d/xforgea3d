'use client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, EditIcon, ImageIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { AlertModal } from '@/components/modals/alert-modal'

interface ProductsTableProps {
   data: ProductColumn[]
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ data }) => {
   const router = useRouter()
   const [deleteId, setDeleteId] = useState<string | null>(null)
   const [loading, setLoading] = useState(false)

   // Filter states
   const [search, setSearch] = useState('')
   const [categoryFilter, setCategoryFilter] = useState('')
   const [brandFilter, setBrandFilter] = useState('')
   const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'active' | 'passive'>('all')

   // Extract unique categories and brands
   const categories = useMemo(() => {
      const unique = [...new Set(data.map((p) => p.category))].filter(Boolean).sort()
      return unique
   }, [data])

   const brands = useMemo(() => {
      const unique = [...new Set(data.map((p) => p.brand))].filter((b) => b && b !== '-').sort()
      return unique
   }, [data])

   // Filtered data
   const filteredData = useMemo(() => {
      return data.filter((item) => {
         // Search filter
         if (search && !item.title.toLowerCase().includes(search.toLowerCase())) {
            return false
         }
         // Category filter
         if (categoryFilter && item.category !== categoryFilter) {
            return false
         }
         // Brand filter
         if (brandFilter && item.brand !== brandFilter) {
            return false
         }
         // Availability filter
         if (availabilityFilter === 'active' && !item.isAvailable) return false
         if (availabilityFilter === 'passive' && item.isAvailable) return false

         return true
      })
   }, [data, search, categoryFilter, brandFilter, availabilityFilter])

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

         {/* Filter Controls */}
         <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px] max-w-md">
               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Ürün ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
               />
            </div>

            {/* Category Filter */}
            <select
               value={categoryFilter}
               onChange={(e) => setCategoryFilter(e.target.value)}
               className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
               <option value="">Tüm Kategoriler</option>
               {categories.map((cat) => (
                  <option key={cat} value={cat}>
                     {cat}
                  </option>
               ))}
            </select>

            {/* Brand Filter */}
            <select
               value={brandFilter}
               onChange={(e) => setBrandFilter(e.target.value)}
               className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
               <option value="">Tüm Koleksiyonlar</option>
               {brands.map((brand) => (
                  <option key={brand} value={brand}>
                     {brand}
                  </option>
               ))}
            </select>

            {/* Availability Filter */}
            <div className="flex items-center rounded-md border border-input overflow-hidden">
               <button
                  onClick={() => setAvailabilityFilter('all')}
                  className={`px-3 py-2 text-sm transition-colors ${
                     availabilityFilter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                  }`}
               >
                  Tümü
               </button>
               <button
                  onClick={() => setAvailabilityFilter('active')}
                  className={`px-3 py-2 text-sm transition-colors border-l border-input ${
                     availabilityFilter === 'active'
                        ? 'bg-green-500 text-white'
                        : 'bg-background hover:bg-muted'
                  }`}
               >
                  Aktif
               </button>
               <button
                  onClick={() => setAvailabilityFilter('passive')}
                  className={`px-3 py-2 text-sm transition-colors border-l border-input ${
                     availabilityFilter === 'passive'
                        ? 'bg-red-500 text-white'
                        : 'bg-background hover:bg-muted'
                  }`}
               >
                  Pasif
               </button>
            </div>
         </div>

         <DataTable columns={columns} data={filteredData} />
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
