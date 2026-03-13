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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banner, Category } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
   title: z.string().min(2),
   description: z.string().optional(),
   imageUrl: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
   initialData: Category | null
   banners: Banner[]
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
   initialData,
   banners,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Kategori Düzenle' : 'Yeni Kategori'
   const description = initialData ? 'Kategori bilgilerini güncelleyin.' : 'Yeni bir kategori ekleyin.'
   const toastMessage = initialData ? 'Kategori güncellendi.' : 'Kategori oluşturuldu.'
   const action = initialData ? 'Kaydet' : 'Oluştur'

   const form = useForm<CategoryFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: initialData?.title || '',
         description: initialData?.description || '',
         imageUrl: initialData?.imageUrl || '',
      }
   })

   const onSubmit = async (data: CategoryFormValues) => {
      try {
         setLoading(true)
         const url = initialData ? `/api/categories/${params.categoryId}` : `/api/categories`
         const method = initialData ? 'PATCH' : 'POST'
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
         })
         if (!res.ok) throw new Error(await res.text())
         router.refresh()
         router.push(`/categories`)
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

         const res = await fetch(`/api/categories/${params.categoryId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme başarısız')

         router.refresh()
         router.push(`/categories`)
         toast.success('Kategori silindi.')
      } catch (error: any) {
         toast.error(
            'Önce bu kategoriyi kullanan tüm ürünleri kaldırın.'
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
               <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Arkaplan Görseli</FormLabel>
                        <FormControl>
                           <ImageUpload
                              value={field.value ? [field.value] : []}
                              disabled={loading}
                              onChange={(url) => field.onChange(url)}
                              onRemove={() => field.onChange('')}
                           />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Önerilen boyut: 800×400px (2:1 en-boy oranı)</p>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Kategori Adı</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Kategori adı"
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
                              <Textarea
                                 disabled={loading}
                                 placeholder="Kategori hakkında kısa açıklama..."
                                 {...field}
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
