'use client'

import { adminPath } from '@/lib/base-path'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'
import { CheckCircle, XCircle, AlertTriangle, AlertCircle, Info, Monitor, Server, Shield, CreditCard, Globe, ChevronDown, ChevronUp, Trash2, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

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
   high: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100', darkBg: 'dark:bg-orange-950', icon: AlertTriangle, label: 'Yüksek' },
   medium: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-950', icon: AlertCircle, label: 'Orta' },
   low: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100', darkBg: 'dark:bg-green-950', icon: Info, label: 'Düşük' },
}

const sourceConfig: Record<string, { icon: any; label: string }> = {
   frontend: { icon: Monitor, label: 'Frontend' },
   backend: { icon: Server, label: 'Backend' },
   middleware: { icon: Shield, label: 'Middleware' },
   payment: { icon: CreditCard, label: 'Ödeme' },
   external: { icon: Globe, label: 'Harici' },
}

function ExpandableDetails({ row, onRefresh }: { row: ErrorLogColumn; onRefresh: () => void }) {
   const toggleResolved = async () => {
      try {
         await fetch(adminPath(`/api/error-logs/${row.id}`), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolved: !row.resolved }),
         })
         toast.success(row.resolved ? 'Tekrar açıldı' : 'Çözüldü olarak işaretlendi')
         onRefresh()
      } catch {
         toast.error('İşlem başarısız')
      }
   }

   const deleteError = async () => {
      if (!confirm('Bu hatayı silmek istediğinize emin misiniz?')) return
      try {
         await fetch(adminPath(`/api/error-logs/${row.id}`), { method: 'DELETE' })
         toast.success('Hata silindi')
         onRefresh()
      } catch {
         toast.error('Silme başarısız')
      }
   }

   return (
      <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-2">
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
               {row.resolved ? 'Tekrar Aç' : 'Çözüldü'}
            </button>
            <button onClick={deleteError} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-90">
               <Trash2 className="h-3 w-3" />
               Sil
            </button>
         </div>
      </div>
   )
}

interface ErrorLogsTableProps {
   data: ErrorLogColumn[]
}

export const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ data }) => {
   const router = useRouter()
   const [selected, setSelected] = useState<Set<string>>(new Set())
   const [expandedId, setExpandedId] = useState<string | null>(null)
   const [loading, setLoading] = useState(false)

   const unresolvedIds = data.filter(d => !d.resolved).map(d => d.id)
   const allSelected = unresolvedIds.length > 0 && unresolvedIds.every(id => selected.has(id))

   const toggleSelect = (id: string) => {
      setSelected(prev => {
         const next = new Set(prev)
         if (next.has(id)) next.delete(id)
         else next.add(id)
         return next
      })
   }

   const toggleSelectAll = () => {
      if (allSelected) {
         setSelected(new Set())
      } else {
         setSelected(new Set(unresolvedIds))
      }
   }

   const bulkResolve = async (ids: string[]) => {
      if (ids.length === 0) return
      try {
         setLoading(true)
         const res = await fetch(adminPath('/api/error-logs/bulk'), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, resolved: true }),
         })
         if (!res.ok) throw new Error()
         toast.success(`${ids.length} hata çözüldü olarak işaretlendi`)
         setSelected(new Set())
         router.refresh()
      } catch {
         toast.error('Toplu işlem başarısız')
      } finally {
         setLoading(false)
      }
   }

   const bulkDelete = async (ids: string[]) => {
      if (ids.length === 0) return
      if (!confirm(`${ids.length} hatayı silmek istediğinize emin misiniz?`)) return
      try {
         setLoading(true)
         const res = await fetch(adminPath('/api/error-logs/bulk'), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
         })
         if (!res.ok) throw new Error()
         toast.success(`${ids.length} hata silindi`)
         setSelected(new Set())
         router.refresh()
      } catch {
         toast.error('Toplu silme başarısız')
      } finally {
         setLoading(false)
      }
   }

   const deleteAll = async () => {
      if (data.length === 0) return
      if (!confirm('Tüm hata logları kalıcı olarak silinecek. Devam etmek istiyorsanız onaylayın.')) return
      try {
         setLoading(true)
         const res = await fetch(adminPath('/api/error-logs/bulk'), {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ all: true }),
         })
         if (!res.ok) throw new Error()
         const result = await res.json()
         toast.success(`${result.deleted ?? 0} hata logu silindi`)
         setSelected(new Set())
         router.refresh()
      } catch {
         toast.error('Tüm loglar silinemedi')
      } finally {
         setLoading(false)
      }
   }

   const resolveAll = () => bulkResolve(unresolvedIds)
   const resolveSelected = () => bulkResolve(Array.from(selected))
   const deleteSelected = () => bulkDelete(Array.from(selected))

   return (
      <div className="space-y-3">
         {/* Bulk action bar */}
         <div className="flex items-center gap-2 flex-wrap">
            {unresolvedIds.length > 0 && (
               <Button
                  variant="outline"
                  size="sm"
                  onClick={resolveAll}
                  disabled={loading}
                  className="gap-1.5"
               >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tümünü Çözüldü Yap ({unresolvedIds.length})
               </Button>
            )}
            {selected.size > 0 && (
               <>
                  <Button
                     variant="default"
                     size="sm"
                     onClick={resolveSelected}
                     disabled={loading}
                     className="gap-1.5"
                  >
                     <CheckCircle className="h-3.5 w-3.5" />
                     Seçilenleri Çözüldü Yap ({selected.size})
                  </Button>
                  <Button
                     variant="destructive"
                     size="sm"
                     onClick={deleteSelected}
                     disabled={loading}
                     className="gap-1.5"
                  >
                     <Trash2 className="h-3.5 w-3.5" />
                     Seçilenleri Sil ({selected.size})
                  </Button>
               </>
            )}
            {selected.size > 0 && (
               <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
               >
                  Seçimi Temizle
               </button>
            )}
            {data.length > 0 && (
               <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteAll}
                  disabled={loading}
                  className="gap-1.5"
               >
                  <Trash2 className="h-3.5 w-3.5" />
                  Tüm Logları Sil
               </Button>
            )}
         </div>

         {/* Table */}
         <div className="rounded-md border">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-10">
                        <Checkbox
                           checked={allSelected}
                           onCheckedChange={toggleSelectAll}
                           aria-label="Tümünü seç"
                        />
                     </TableHead>
                     <TableHead className="w-24">Seviye</TableHead>
                     <TableHead>Hata</TableHead>
                     <TableHead className="w-28">Kaynak</TableHead>
                     <TableHead className="w-28">Kullanıcı</TableHead>
                     <TableHead className="w-24">Durum</TableHead>
                     <TableHead className="w-32">Tarih</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {data.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                           Hata kaydı bulunamadı.
                        </TableCell>
                     </TableRow>
                  ) : (
                     data.map((row) => {
                        const sev = severityConfig[row.severity] || severityConfig.medium
                        const src = sourceConfig[row.source] || sourceConfig.backend
                        const SevIcon = sev.icon
                        const SrcIcon = src.icon
                        const isExpanded = expandedId === row.id

                        return (
                           <TableRow key={row.id} className={selected.has(row.id) ? 'bg-muted/30' : ''}>
                              <TableCell>
                                 <Checkbox
                                    checked={selected.has(row.id)}
                                    onCheckedChange={() => toggleSelect(row.id)}
                                    aria-label={`Seç: ${row.message}`}
                                 />
                              </TableCell>
                              <TableCell>
                                 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${sev.bg} ${sev.darkBg} ${sev.color}`}>
                                    <SevIcon className="h-3.5 w-3.5" />
                                    {sev.label}
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div>
                                    <div className="flex items-start gap-2">
                                       <button
                                          onClick={() => setExpandedId(isExpanded ? null : row.id)}
                                          className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
                                       >
                                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                       </button>
                                       <div className="min-w-0">
                                          <p className="text-sm font-medium truncate max-w-md">{row.message}</p>
                                          {row.path && (
                                             <p className="text-xs text-muted-foreground">
                                                {row.method && `${row.method} `}{row.path}
                                             </p>
                                          )}
                                       </div>
                                    </div>
                                    {isExpanded && (
                                       <div className="mt-2 ml-6">
                                          <ExpandableDetails row={row} onRefresh={() => router.refresh()} />
                                       </div>
                                    )}
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <SrcIcon className="h-3.5 w-3.5" />
                                    {src.label}
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <span className="text-xs text-muted-foreground">
                                    {row.userName || <span className="italic">Anonim</span>}
                                 </span>
                              </TableCell>
                              <TableCell>
                                 {row.resolved ? (
                                    <Badge variant="outline" className="text-green-600 border-green-300 dark:border-green-800">
                                       <CheckCircle className="h-3 w-3 mr-1" /> Çözüldü
                                    </Badge>
                                 ) : (
                                    <Badge variant="outline" className="text-red-600 border-red-300 dark:border-red-800">
                                       <XCircle className="h-3 w-3 mr-1" /> Açık
                                    </Badge>
                                 )}
                              </TableCell>
                              <TableCell>
                                 <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {(() => {
                                       try {
                                          return formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: tr })
                                       } catch {
                                          return row.createdAt
                                       }
                                    })()}
                                 </span>
                              </TableCell>
                           </TableRow>
                        )
                     })
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   )
}
