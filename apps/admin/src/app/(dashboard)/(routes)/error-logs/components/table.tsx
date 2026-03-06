'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, Info, Monitor, Server, Shield, CreditCard, Globe, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

export type ErrorLogColumn = {
   id: string
   message: string
   stack: string | null
   severity: string
   source: string
   path: string | null
   method: string | null
   statusCode: number | null
   userAgent: string | null
   ip: string | null
   resolved: boolean
   userName: string | null
   userId: string | null
   createdAt: string
   metadata: any
}

const severityConfig: Record<string, { color: string; bg: string; darkBg: string; icon: any; label: string }> = {
   critical: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100', darkBg: 'dark:bg-red-950', icon: XCircle, label: 'Kritik' },
   high: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100', darkBg: 'dark:bg-orange-950', icon: AlertTriangle, label: 'Yuksek' },
   medium: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-950', icon: AlertCircle, label: 'Orta' },
   low: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100', darkBg: 'dark:bg-green-950', icon: Info, label: 'Dusuk' },
}

const sourceConfig: Record<string, { icon: any; label: string }> = {
   frontend: { icon: Monitor, label: 'Frontend' },
   backend: { icon: Server, label: 'Backend' },
   middleware: { icon: Shield, label: 'Middleware' },
   payment: { icon: CreditCard, label: 'Odeme' },
   external: { icon: Globe, label: 'Harici' },
}

function ExpandableRow({ row }: { row: ErrorLogColumn }) {
   const [expanded, setExpanded] = useState(false)
   const router = useRouter()

   const toggleResolved = async () => {
      try {
         await fetch(`/api/error-logs/${row.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolved: !row.resolved }),
         })
         router.refresh()
      } catch (e) {
         console.error('Failed to toggle resolved:', e)
      }
   }

   const deleteError = async () => {
      if (!confirm('Bu hatayi silmek istediginize emin misiniz?')) return
      try {
         await fetch(`/api/error-logs/${row.id}`, { method: 'DELETE' })
         router.refresh()
      } catch (e) {
         console.error('Failed to delete:', e)
      }
   }

   return (
      <div>
         <div className="flex items-start gap-2">
            <button onClick={() => setExpanded(!expanded)} className="mt-0.5 text-muted-foreground hover:text-foreground">
               {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{row.message}</p>
               {row.path && <p className="text-xs text-muted-foreground">{row.method && `${row.method} `}{row.path}</p>}
            </div>
         </div>
         {expanded && (
            <div className="mt-2 ml-6 p-3 rounded-lg bg-muted/50 text-xs space-y-2">
               {row.stack && (
                  <div>
                     <p className="font-semibold mb-1">Stack Trace:</p>
                     <pre className="whitespace-pre-wrap break-all text-[11px] text-muted-foreground max-h-40 overflow-auto">{row.stack}</pre>
                  </div>
               )}
               {row.userAgent && <p><span className="font-semibold">User Agent:</span> {row.userAgent}</p>}
               {row.ip && <p><span className="font-semibold">IP:</span> {row.ip}</p>}
               {row.statusCode && <p><span className="font-semibold">Status:</span> {row.statusCode}</p>}
               {row.metadata && (
                  <div>
                     <p className="font-semibold mb-1">Metadata:</p>
                     <pre className="whitespace-pre-wrap break-all text-[11px] text-muted-foreground">{JSON.stringify(row.metadata, null, 2)}</pre>
                  </div>
               )}
               <div className="flex gap-2 pt-2">
                  <button onClick={toggleResolved} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90">
                     <CheckCircle className="h-3 w-3" />
                     {row.resolved ? 'Tekrar Ac' : 'Cozuldu'}
                  </button>
                  <button onClick={deleteError} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-90">
                     <Trash2 className="h-3 w-3" />
                     Sil
                  </button>
               </div>
            </div>
         )}
      </div>
   )
}

export const columns: ColumnDef<ErrorLogColumn>[] = [
   {
      accessorKey: 'severity',
      header: 'Seviye',
      cell: ({ row }) => {
         const sev = severityConfig[row.original.severity] || severityConfig.medium
         const Icon = sev.icon
         return (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${sev.bg} ${sev.darkBg} ${sev.color}`}>
               <Icon className="h-3.5 w-3.5" />
               {sev.label}
            </div>
         )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
   },
   {
      accessorKey: 'message',
      header: 'Hata',
      cell: ({ row }) => <ExpandableRow row={row.original} />,
   },
   {
      accessorKey: 'source',
      header: 'Kaynak',
      cell: ({ row }) => {
         const src = sourceConfig[row.original.source] || sourceConfig.backend
         const Icon = src.icon
         return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <Icon className="h-3.5 w-3.5" />
               {src.label}
            </div>
         )
      },
   },
   {
      accessorKey: 'userName',
      header: 'Kullanici',
      cell: ({ row }) => (
         <span className="text-xs text-muted-foreground">
            {row.original.userName || <span className="italic">Anonim</span>}
         </span>
      ),
   },
   {
      accessorKey: 'resolved',
      header: 'Durum',
      cell: ({ row }) => row.original.resolved ? (
         <Badge variant="outline" className="text-green-600 border-green-300 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Cozuldu
         </Badge>
      ) : (
         <Badge variant="outline" className="text-red-600 border-red-300 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" /> Acik
         </Badge>
      ),
   },
   {
      accessorKey: 'createdAt',
      header: 'Tarih',
      cell: ({ row }) => {
         try {
            return (
               <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true, locale: tr })}
               </span>
            )
         } catch {
            return <span className="text-xs text-muted-foreground">{row.original.createdAt}</span>
         }
      },
   },
]

interface ErrorLogsTableProps {
   data: ErrorLogColumn[]
}

export const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ data }) => {
   return <DataTable searchKey="message" columns={columns} data={data} />
}
