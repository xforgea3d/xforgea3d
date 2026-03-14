'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { DiscountCode } from '@prisma/client'
import { Loader2, RefreshCw, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   code: z.string().min(2, 'Kupon kodu en az 2 karakter olmali'),
   percent: z.coerce.number().min(1, 'En az %1').max(100, 'En fazla %100'),
   maxDiscountAmount: z.coerce.number().min(0, 'Negatif olamaz'),
   stock: z.coerce.number().min(0, 'Negatif olamaz'),
   description: z.string().optional(),
   startDate: z.string().min(1, 'Baslangic tarihi zorunlu'),
   endDate: z.string().min(1, 'Bitis tarihi zorunlu'),
})

type DiscountFormValues = z.infer<typeof formSchema>

function generateCode(): string {
   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
   let result = 'XF'
   for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
   }
   return result
}

function toDateInputValue(date: Date | string): string {
   const d = new Date(date)
   return d.toISOString().split('T')[0]
}

interface DiscountFormProps {
   initialData: DiscountCode | null
}

export const DiscountForm: React.FC<DiscountFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Kupon Duzenle' : 'Yeni Kupon'
   const description = initialData
      ? 'Kupon bilgilerini guncelleyin.'
      : 'Yeni bir indirim kuponu olusturun.'
   const toastMessage = initialData ? 'Kupon guncellendi.' : 'Kupon olusturuldu.'
   const action = initialData ? 'Kaydet' : 'Olustur'

   const form = useForm<DiscountFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData
         ? {
              code: initialData.code,
              percent: initialData.percent,
              maxDiscountAmount: initialData.maxDiscountAmount,
              stock: initialData.stock,
              description: initialData.description ?? '',
              startDate: toDateInputValue(initialData.startDate),
              endDate: toDateInputValue(initialData.endDate),
           }
         : {
              code: generateCode(),
              percent: 10,
              maxDiscountAmount: 100,
              stock: 1,
              description: '',
              startDate: toDateInputValue(new Date()),
              endDate: '',
           },
   })

   const onSubmit = async (data: DiscountFormValues) => {
      try {
         setLoading(true)
         const url = initialData
            ? `/api/discount-codes/${params.codeId}`
            : `/api/discount-codes`
         const method = initialData ? 'PATCH' : 'POST'
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
         })
         if (!res.ok) throw new Error(await res.text())
         router.refresh()
         router.push('/discount-codes')
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Bir hata olustu: ' + (error?.message || ''))
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)
         const res = await fetch(`/api/discount-codes/${params.codeId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme basarisiz')
         router.refresh()
         router.push('/discount-codes')
         toast.success('Kupon silindi.')
      } catch (error: any) {
         toast.error('Kupon silinemedi. Bu kuponu kullanan siparisler olabilir.')
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   const handleGenerateCode = () => {
      form.setValue('code', generateCode())
   }

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
         />
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
            {initialData && (
               <Button
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  onClick={() => setOpen(true)}
               >
                  <Trash className="h-4" />
               </Button>
            )}
         </div>
         <Separator />
         <Form {...form}>
            <form
               onSubmit={form.handleSubmit(onSubmit)}
               className="space-y-8 w-full"
            >
               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="code"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Kupon Kodu</FormLabel>
                           <div className="flex gap-2">
                              <FormControl>
                                 <Input
                                    disabled={loading}
                                    placeholder="XF..."
                                    className="font-mono uppercase"
                                    {...field}
                                    onChange={(e) =>
                                       field.onChange(e.target.value.toUpperCase())
                                    }
                                 />
                              </FormControl>
                              <Button
                                 type="button"
                                 variant="outline"
                                 size="icon"
                                 onClick={handleGenerateCode}
                                 disabled={loading}
                                 title="Otomatik kod olustur"
                              >
                                 <RefreshCw className="h-4 w-4" />
                              </Button>
                           </div>
                           <FormDescription>
                              Bos birakirsaniz otomatik olusturulur (XF + 6 karakter).
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="percent"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Indirim Yuzdesi (%)</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min={1}
                                 max={100}
                                 disabled={loading}
                                 placeholder="10"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="maxDiscountAmount"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Maksimum Indirim Tutari (TL)</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min={0}
                                 step="0.01"
                                 disabled={loading}
                                 placeholder="100"
                                 {...field}
                              />
                           </FormControl>
                           <FormDescription>
                              Indirimin uygulanacagi maksimum tutar.
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="stock"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Stok (Kullanim Hakki)</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 min={0}
                                 disabled={loading}
                                 placeholder="1"
                                 {...field}
                              />
                           </FormControl>
                           <FormDescription>
                              Bu kuponun kac kez kullanilabilecegi.
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="startDate"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Baslangic Tarihi</FormLabel>
                           <FormControl>
                              <Input
                                 type="date"
                                 disabled={loading}
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="endDate"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Bitis Tarihi</FormLabel>
                           <FormControl>
                              <Input
                                 type="date"
                                 disabled={loading}
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
                  name="description"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Aciklama (Opsiyonel)</FormLabel>
                        <FormControl>
                           <Input
                              disabled={loading}
                              placeholder="Kupon hakkinda not..."
                              {...field}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <Button disabled={loading} className="ml-auto" type="submit">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Kaydediliyor...' : action}
               </Button>
            </form>
         </Form>
      </>
   )
}
