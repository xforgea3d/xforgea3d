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
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const PAYMENT_STATUSES = [
   { value: 'Processing', label: 'İşlemde' },
   { value: 'Paid', label: 'Ödendi' },
   { value: 'Failed', label: 'Başarısız' },
   { value: 'Denied', label: 'Reddedildi' },
]

const formSchema = z.object({
   status: z.string().min(1),
   payable: z.coerce.number().min(1),
   fee: z.coerce.number().optional(),
   isSuccessful: z.boolean().default(false).optional(),
})

type PaymentFormValues = z.infer<typeof formSchema>

interface PaymentFormProps {
   initialData: any | null
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [loading, setLoading] = useState(false)

   const toastMessage = 'Payment updated.'
   const action = 'Kaydet'

   const defaultValues = initialData
      ? {
         ...initialData,
      }
      : {
         status: 'Processing',
         payable: 0,
         fee: 0,
         isSuccessful: false,
      }

   const form = useForm<PaymentFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: PaymentFormValues) => {
      try {
         setLoading(true)

         if (initialData) {
            const res = await fetch(`/api/payments/${params.paymentId}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error(await res.text())
         } else {
            const res = await fetch(`/api/payments`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error(await res.text())
         }

         router.refresh()
         toast.success(toastMessage)
         router.push(`/payments`)
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
         >
            <FormField
               control={form.control}
               name="status"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Ödeme Durumu</FormLabel>
                     <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger>
                              <SelectValue placeholder="Durum seçin" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {PAYMENT_STATUSES.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="payable"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Ödenecek Tutar (₺)</FormLabel>
                        <FormControl>
                           <Input
                              type="number"
                              disabled={loading}
                              placeholder="9.99"
                              {...field}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Komisyon (Fee)</FormLabel>
                        <FormControl>
                           <Input
                              type="number"
                              disabled={loading}
                              placeholder="0.00"
                              {...field}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

            <FormField
               control={form.control}
               name="isSuccessful"
               render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                     <FormControl>
                        <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                        />
                     </FormControl>
                     <div className="space-y-1 leading-none">
                        <FormLabel>Başarılı (isSuccessful)</FormLabel>
                        <FormDescription>
                           Ödeme başarıyla tamamlandı olarak işaretle.
                        </FormDescription>
                     </div>
                  </FormItem>
               )}
            />
            <Button disabled={loading} type="submit">
               {action}
            </Button>
         </form>
      </Form>
   )
}
