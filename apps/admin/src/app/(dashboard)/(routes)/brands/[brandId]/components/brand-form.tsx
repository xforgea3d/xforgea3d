'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import ImageUpload from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Brand } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   title: z.string().min(2),
   description: z.string().min(1).optional(),
   logo: z.string().optional(),
})

type BrandFormValues = z.infer<typeof formSchema>

interface BrandFormProps {
   initialData: Brand | null
}

export const BrandForm: React.FC<BrandFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Koleksiyon Düzenle' : 'Yeni Koleksiyon'
   const description = initialData ? 'Koleksiyon bilgilerini güncelleyin.' : 'Yeni bir koleksiyon ekleyin.'
   const toastMessage = initialData ? 'Koleksiyon güncellendi.' : 'Koleksiyon oluşturuldu.'
   const action = initialData ? 'Kaydet' : 'Oluştur'

   const form = useForm<BrandFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData || {
         title: '',
         description: '',
         logo: '',
      },
   })

   const onSubmit = async (data: BrandFormValues) => {
      try {
         setLoading(true)
         const url = initialData ? `/api/brands/${params.brandId}` : `/api/brands`
         const method = initialData ? 'PATCH' : 'POST'
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
         })
         if (!res.ok) throw new Error(await res.text())
         router.refresh()
         router.push(`/brands`)
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Bir hata oluştu: ' + (error?.message || ''))
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)

         const res = await fetch(`/api/brands/${params.brandId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme başarısız')

         router.refresh()
         router.push(`/brands`)
         toast.success('Koleksiyon silindi.')
      } catch (error: any) {
         toast.error(
            'Önce bu koleksiyonu kullanan tüm ürünleri kaldırın.'
         )
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
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Koleksiyon Adı</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Koleksiyon adı"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Açıklama</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Koleksiyon açıklaması"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="logo"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Logo</FormLabel>
                           <FormControl>
                              <ImageUpload
                                 value={field.value ? [field.value] : []}
                                 disabled={loading}
                                 onChange={(url) => field.onChange(url)}
                                 onRemove={() => field.onChange('')}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
