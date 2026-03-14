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
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'
import { AlertCircle, Loader2 } from 'lucide-react'

const ORDER_STATUSES = [
   { value: 'OnayBekleniyor', label: 'Onay Bekleniyor' },
   { value: 'Uretimde', label: 'Uretimde' },
   { value: 'Processing', label: 'Islemde' },
   { value: 'Shipped', label: 'Kargoya Verildi' },
   { value: 'Delivered', label: 'Teslim Edildi' },
   { value: 'ReturnProcessing', label: 'Iade Islemde' },
   { value: 'ReturnCompleted', label: 'Iade Tamamlandi' },
   { value: 'Cancelled', label: 'Iptal Edildi' },
   { value: 'RefundProcessing', label: 'Para Iadesi Islemde' },
   { value: 'RefundCompleted', label: 'Para Iadesi Tamamlandi' },
   { value: 'Denied', label: 'Reddedildi' },
]

const SHIPPING_COMPANIES = [
   'Yurtici Kargo',
   'Aras Kargo',
   'MNG Kargo',
   'PTT Kargo',
   'Surat Kargo',
   'Trendyol Express',
]

const formSchema = z.object({
   status: z.string().min(1),
   isPaid: z.boolean().default(false).optional(),
   trackingNumber: z.string().optional().nullable(),
   shippingCompany: z.string().optional().nullable(),
})

type OrderFormValues = z.infer<typeof formSchema>

interface OrderFormProps {
   initialData: OrderWithIncludes | null
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [showTrackingWarning, setShowTrackingWarning] = useState(false)

   const defaultValues = initialData
      ? {
           status: initialData.status,
           isPaid: initialData.isPaid,
           trackingNumber: (initialData as any).trackingNumber ?? '',
           shippingCompany: (initialData as any).shippingCompany ?? '',
        }
      : {
           status: 'Processing',
           isPaid: false,
           trackingNumber: '',
           shippingCompany: '',
        }

   const form = useForm<OrderFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const watchedStatus = form.watch('status')
   const watchedTracking = form.watch('trackingNumber')

   useEffect(() => {
      const isShipped = watchedStatus === 'Shipped' || watchedStatus === 'KargoyaVerildi'
      const noTracking = !watchedTracking || watchedTracking.trim() === ''
      setShowTrackingWarning(isShipped && noTracking)
   }, [watchedStatus, watchedTracking])

   const onSubmit = async (data: OrderFormValues) => {
      try {
         setLoading(true)
         const res = await fetch(`/api/orders/${params.orderId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
         })
         if (!res.ok) throw new Error('Guncelleme basarisiz')
         router.refresh()
         toast.success('Siparis guncellendi.')
      } catch {
         toast.error('Degisiklik kaydedilemedi.')
         router.refresh()
      } finally {
         setLoading(false)
      }
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">

            {/* Status */}
            <FormField
               control={form.control}
               name="status"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Siparis Durumu</FormLabel>
                     <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger>
                              <SelectValue placeholder="Durum secin" />
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

            {/* Tracking Warning */}
            {showTrackingWarning && (
               <div className="flex items-center gap-2 rounded-md border border-orange-400/50 bg-orange-50 dark:bg-orange-950/20 p-3 text-sm text-orange-700 dark:text-orange-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Kargo durumuna gectiniz. Lutfen kargo takip numarasini girin.</span>
               </div>
            )}

            {/* Tracking Number & Shipping Company */}
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Kargo Takip Numarasi</FormLabel>
                        <FormControl>
                           <Input
                              disabled={loading}
                              placeholder="Takip numarasini girin"
                              {...field}
                              value={field.value ?? ''}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="shippingCompany"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Kargo Firmasi</FormLabel>
                        <Select
                           disabled={loading}
                           onValueChange={field.onChange}
                           value={field.value ?? ''}
                           defaultValue={field.value ?? ''}
                        >
                           <FormControl>
                              <SelectTrigger>
                                 <SelectValue placeholder="Kargo firmasi secin" />
                              </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {SHIPPING_COMPANIES.map((company) => (
                                 <SelectItem key={company} value={company}>{company}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

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
                        <FormLabel>Odendi</FormLabel>
                        <FormDescription>Odeme alindi olarak isaretle.</FormDescription>
                     </div>
                  </FormItem>
               )}
            />

            <Button disabled={loading} type="submit">
               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {loading ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
            </Button>
         </form>
      </Form>
   )
}
