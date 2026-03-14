'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ColumnDef } from '@tanstack/react-table'
import { BellIcon, EditIcon, LinkIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export type UserColumn = {
   id: string
   name: string
   email: string
   phone: string
   orders: number
}

function SendNotificationButton({ userId, userName }: { userId: string; userName: string }) {
   const [open, setOpen] = useState(false)
   const [message, setMessage] = useState('')
   const [loading, setLoading] = useState(false)

   async function handleSend() {
      if (!message.trim()) return
      setLoading(true)
      try {
         const res = await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, content: message.trim() }),
         })
         if (!res.ok) throw new Error('Failed to send')
         toast.success('Bildirim gonderildi')
         setMessage('')
         setOpen(false)
      } catch {
         toast.error('Bildirim gonderilemedi')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Badge className="items-center flex gap-1 w-min cursor-pointer" variant="outline">
               <BellIcon className="h-3" />
               <p className="shrink-0">Bildirim Gonder</p>
            </Badge>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Bildirim Gonder</DialogTitle>
               <DialogDescription>
                  {userName} kullanicisina bildirim gonder
               </DialogDescription>
            </DialogHeader>
            <Textarea
               placeholder="Bildirim mesajinizi yazin..."
               value={message}
               onChange={e => setMessage(e.target.value)}
               rows={4}
            />
            <DialogFooter>
               <Button variant="outline" onClick={() => setOpen(false)}>
                  Iptal
               </Button>
               <Button onClick={handleSend} disabled={loading || !message.trim()}>
                  {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  Gonder
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}

export const columns: ColumnDef<UserColumn>[] = [
   {
      accessorKey: 'name',
      header: 'Ad',
      cell: ({ row, cell }) => (
         <Link href={`/users/${row.original.id}`}>
            <p>{cell?.getValue()?.toString()}</p>
         </Link>
      ),
   },
   {
      accessorKey: 'email',
      header: 'E-posta',
   },
   {
      accessorKey: 'phone',
      header: 'Telefon',
   },
   {
      accessorKey: 'orders',
      header: 'Siparis',
      cell: ({ row, cell }) => (
         <Link href={`/orders?userId=${row.original.id}`}>
            <Badge className="items-center flex gap-1 w-min">
               <LinkIcon className="h-3" />
               <p className="shrink-0">{(cell.getValue() as number).toString()} Siparis</p>
            </Badge>
         </Link>
      ),
   },
   {
      id: 'notify',
      header: '',
      cell: ({ row }) => (
         <SendNotificationButton
            userId={row.original.id}
            userName={row.original.name || row.original.email}
         />
      ),
   },
   {
      id: 'actions',
      cell: ({ row }) => (
         <Link href={`/users/${row.original.id}`}>
            <Badge className="items-center flex gap-1 w-min">
               <EditIcon className="h-3 p-0" />
               <p>Edit</p>
            </Badge>
         </Link>
      ),
   },
]

interface UsersTableProps {
   data: UserColumn[]
}

export const UsersTable: React.FC<UsersTableProps> = ({ data }) => {
   const router = useRouter()

   return <DataTable searchKey="name" columns={columns} data={data} />
}
