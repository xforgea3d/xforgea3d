'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, DownloadIcon, EditIcon, Loader2Icon, PackageIcon, TruckIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export type OrderColumn = {
   id: string
   isPaid: boolean
   payable: string
   number: string
   status: string
   statusLabel: string
   createdAt: string
   date: string
   trackingNumber: string | null
   shippingCompany: string | null
   itemCount: number
}

interface OrdersClientProps {
   data: OrderColumn[]
}

type TabKey = 'yeni' | 'hazirlanan' | 'kargoda' | 'teslim' | 'iptal' | 'tumu'

const TAB_FILTERS: Record<TabKey, (order: OrderColumn) => boolean> = {
   yeni: (o) => o.status === 'OnayBekleniyor' && !o.isPaid,
   hazirlanan: (o) => ['Uretimde', 'Processing'].includes(o.status),
   kargoda: (o) => o.status === 'Shipped' && !!o.trackingNumber,
   teslim: (o) => o.status === 'Delivered',
   iptal: (o) =>
      ['Cancelled', 'Denied', 'ReturnProcessing', 'ReturnCompleted', 'RefundProcessing', 'RefundCompleted'].includes(o.status),
   tumu: () => true,
}

const STATUS_COLORS: Record<string, string> = {
   OnayBekleniyor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
   Hazirlaniyor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
   Uretimde: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
   Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
   KargoyaVerildi: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
   Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
   TeslimEdildi: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
   Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
   IptalEdildi: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
   Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
   Denied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
   IadeEdildi: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
   ReturnProcessing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
   ReturnCompleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
   RefundProcessing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
   RefundCompleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const STATUS_OPTIONS = [
   { value: 'OnayBekleniyor', label: 'Onay Bekliyor' },
   { value: 'Uretimde', label: 'Üretimde' },
   { value: 'Shipped', label: 'Kargoda' },
   { value: 'Delivered', label: 'Teslim Edildi' },
   { value: 'Cancelled', label: 'İptal' },
]

function StatusCell({ order, onStatusChange }: { order: OrderColumn; onStatusChange: (id: string, status: string) => Promise<void> }) {
   const [loading, setLoading] = useState(false)

   const handleChange = async (newStatus: string) => {
      if (newStatus === order.status) return
      setLoading(true)
      try {
         await onStatusChange(order.id, newStatus)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="flex items-center gap-1.5">
         {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
         ) : (
            <select
               value={order.status}
               onChange={(e) => handleChange(e.target.value)}
               className="text-xs border rounded-md px-1.5 py-1 bg-background cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
               {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
               ))}
               {/* Show current status if not in the list */}
               {!STATUS_OPTIONS.find((o) => o.value === order.status) && (
                  <option value={order.status}>{order.statusLabel}</option>
               )}
            </select>
         )}
         {order.status === 'OnayBekleniyor' && !loading && (
            <Button
               size="sm"
               variant="outline"
               className="h-6 px-2 text-[10px] font-semibold border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
               onClick={() => handleChange('Uretimde')}
            >
               Onayla
            </Button>
         )}
      </div>
   )
}

function getOrderColumns(onStatusChange: (id: string, status: string) => Promise<void>): ColumnDef<OrderColumn>[] {
   return [
      {
         accessorKey: 'number',
         header: 'Sipariş No',
      },
      {
         accessorKey: 'statusLabel',
         header: 'Durum',
         cell: ({ row }) => <StatusCell order={row.original} onStatusChange={onStatusChange} />,
      },
      {
         accessorKey: 'createdAt',
         header: 'Tarih',
      },
      {
         accessorKey: 'payable',
         header: 'Tutar',
      },
      {
         accessorKey: 'isPaid',
         header: 'Ödeme',
         cell: (props) =>
            props.cell.getValue() ? (
               <Badge variant="default" className="text-xs">
                  <CheckIcon className="h-3 w-3 mr-1" /> Ödendi
               </Badge>
            ) : (
               <Badge variant="destructive" className="text-xs">
                  <XIcon className="h-3 w-3 mr-1" /> Ödenmedi
               </Badge>
            ),
      },
      {
         id: 'tracking',
         header: 'Kargo',
         cell: ({ row }) => {
            const { trackingNumber, shippingCompany } = row.original
            if (!trackingNumber) return <span className="text-muted-foreground text-xs">-</span>
            return (
               <div className="flex items-center gap-1.5">
                  <TruckIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="text-xs">
                     <p className="font-medium">{trackingNumber}</p>
                     {shippingCompany && <p className="text-muted-foreground">{shippingCompany}</p>}
                  </div>
               </div>
            )
         },
      },
      {
         id: 'actions',
         cell: ({ row }) => (
            <Link href={`/orders/${row.original.id}`}>
               <Button size="icon" variant="outline">
                  <EditIcon className="h-4" />
               </Button>
            </Link>
         ),
      },
   ]
}

// Keep backward compat — static columns without inline status change
export const OrderColumns: ColumnDef<OrderColumn>[] = getOrderColumns(async () => {})

export const OrdersClient: React.FC<OrdersClientProps> = ({ data }) => {
   const router = useRouter()
   const [search, setSearch] = useState('')
   const [activeTab, setActiveTab] = useState<TabKey>('tumu')

   const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
      try {
         const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
         })
         if (!res.ok) throw new Error('Durum güncellenemedi')
         toast.success('Sipariş durumu güncellendi')
         router.refresh()
      } catch (err: any) {
         toast.error(err?.message || 'Bir hata oluştu')
      }
   }, [router])

   const columns = useMemo(() => getOrderColumns(handleStatusChange), [handleStatusChange])

   const counts = useMemo(() => {
      return {
         yeni: data.filter(TAB_FILTERS.yeni).length,
         hazirlanan: data.filter(TAB_FILTERS.hazirlanan).length,
         kargoda: data.filter(TAB_FILTERS.kargoda).length,
         teslim: data.filter(TAB_FILTERS.teslim).length,
         iptal: data.filter(TAB_FILTERS.iptal).length,
         tumu: data.length,
      }
   }, [data])

   const filteredData = useMemo(() => {
      const tabFilter = TAB_FILTERS[activeTab]
      return data.filter((order) => {
         const matchesSearch =
            search === '' || order.number.toLowerCase().includes(search.toLowerCase())
         return matchesSearch && tabFilter(order)
      })
   }, [data, search, activeTab])

   const exportCSV = () => {
      const BOM = '\uFEFF'
      const headers = ['Sipariş No', 'Durum', 'Toplam', 'Ödeme', 'Kargo Takip', 'Kargo Firması', 'Tarih']
      const rows = filteredData.map((order) => [
         order.number,
         order.statusLabel,
         order.payable,
         order.isPaid ? 'Ödendi' : 'Ödenmedi',
         order.trackingNumber ?? '',
         order.shippingCompany ?? '',
         order.createdAt,
      ])
      const csv =
         BOM +
         [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'siparisler.csv'
      link.click()
      URL.revokeObjectURL(url)
   }

   const tabs: { key: TabKey; label: string }[] = [
      { key: 'yeni', label: 'Yeni Siparişler' },
      { key: 'hazirlanan', label: 'Hazırlanan' },
      { key: 'kargoda', label: 'Kargoda' },
      { key: 'teslim', label: 'Teslim Edildi' },
      { key: 'iptal', label: 'İptal / İade' },
      { key: 'tumu', label: 'Tümü' },
   ]

   return (
      <div>
         <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
               {tabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
                     {tab.label}
                     <Badge
                        variant={activeTab === tab.key ? 'default' : 'secondary'}
                        className="text-[10px] h-5 min-w-[20px] px-1.5"
                     >
                        {counts[tab.key]}
                     </Badge>
                  </TabsTrigger>
               ))}
            </TabsList>

            <div className="flex items-center gap-3 py-4">
               <Input
                  placeholder="Sipariş numarası ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
               />
               <div className="ml-auto">
                  <Button variant="outline" size="sm" onClick={exportCSV}>
                     <DownloadIcon className="h-4 w-4 mr-2" />
                     Excel&apos;e Aktar
                  </Button>
               </div>
            </div>

            {tabs.map((tab) => (
               <TabsContent key={tab.key} value={tab.key}>
                  <DataTable columns={columns} data={filteredData} />
               </TabsContent>
            ))}
         </Tabs>
      </div>
   )
}

// Keep backward compat export
export const OrderTable = OrdersClient
