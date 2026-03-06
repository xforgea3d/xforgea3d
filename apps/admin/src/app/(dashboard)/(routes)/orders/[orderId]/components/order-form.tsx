'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import type { OrderWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const ORDER_STATUSES = [
   { value: 'OnayBekleniyor', label: 'Onay Bekleniyor' },
   { value: 'Uretimde', label: 'Üretimde' },
   { value: 'Processing', label: 'İşlemde' },
   { value: 'Shipped', label: 'Kargoya Verildi' },
   { value: 'Delivered', label: 'Teslim Edildi' },
   { value: 'ReturnProcessing', label: 'İade İşlemde' },
   { value: 'ReturnCompleted', label: 'İade Tamamlandı' },
   { value: 'Cancelled', label: 'İptal Edildi' },
   { value: 'RefundProcessing', label: 'Para İadesi İşlemde' },
   { value: 'RefundCompleted', label: 'Para İadesi Tamamlandı' },
   { value: 'Denied', label: 'Reddedildi' },
]

const formSchema = z.object({
   status: z.string().min(1),
   shipping: z.coerce.number().min(0),
   payable: z.coerce.number().min(0),
   discount: z.coerce.number().min(0),
   isPaid: z.boolean().default(false).optional(),
   isCompleted: z.boolean().default(false).optional(),
})

type OrderFormValues = z.infer<typeof formSchema>

interface OrderFormProps {
   initialData: OrderWithIncludes | null
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()
   const [loading, setLoading] = useState(false)

   const defaultValues = initialData
      ? { ...initialData }
      : { status: 'Processing', shipping: 0, payable: 0, discount: 0, isPaid: false, isCompleted: false }

   const form = useForm<OrderFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: OrderFormValues) => {
      try {
         const res = await fetch(`/api/orders/${params.orderId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
         })
         if (!res.ok) throw new Error('Güncelleme başarısız')
         router.refresh()
         toast.success('Sipariş güncellendi.')
      } catch {
         toast.error('Değişiklik kaydedilemedi.')
         router.refresh()
      }
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="block space-y-4 w-full pt-2">

            {/* Status */}
            <FormField
               control={form.control}
               name="status"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Sipariş Durumu</FormLabel>
                     <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger>
                              <SelectValue placeholder="Durum seçin" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {ORDER_STATUSES.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <div className="grid grid-cols-3 gap-4">
               {/* Shipping */}
               <FormField
                  control={form.control}
                  name="shipping"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Kargo Ücreti (₺)</FormLabel>
                        <FormControl>
                           <Input type="number" disabled={loading} placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               {/* Payable */}
               <FormField
                  control={form.control}
                  name="payable"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Ödenecek (₺)</FormLabel>
                        <FormControl>
                           <Input type="number" disabled={loading} placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               {/* Discount */}
               <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>İndirim (₺)</FormLabel>
                        <FormControl>
                           <Input type="number" disabled={loading} placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* isPaid */}
               <FormField
                  control={form.control}
                  name="isPaid"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                           <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                           <FormLabel>Ödendi</FormLabel>
                           <FormDescription>Ödeme alındı olarak işaretle.</FormDescription>
                        </div>
                     </FormItem>
                  )}
               />

               {/* isCompleted */}
               <FormField
                  control={form.control}
                  name="isCompleted"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                           <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                           <FormLabel>Tamamlandı</FormLabel>
                           <FormDescription>Sipariş tamamlandı olarak işaretle.</FormDescription>
                        </div>
                     </FormItem>
                  )}
               />
            </div>

            <Button disabled={loading} type="submit">
               Değişiklikleri Kaydet
            </Button>
         </form>
      </Form>
   )
}
