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
import { BotIcon, ImageIcon } from 'lucide-react'

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

   const [aiPrompt, setAiPrompt] = useState('')
   const [isGenerating, setIsGenerating] = useState(false)

   const onGenerateImage = async () => {
      if (!aiPrompt) {
         toast.error('Lütfen oluşturmak istediğiniz görseli tarif edin.')
         return
      }
      try {
         setIsGenerating(true)
         const res = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt, context: 'category' })
         })
         if (!res.ok) throw new Error(await res.text())
         const data = await res.json()
         form.setValue('imageUrl', data.url, { shouldDirty: true, shouldValidate: true })
         toast.success('Yapay zeka ile görsel oluşturuldu!')
      } catch (error: any) {
         toast.error('Görsel oluşturulamadı: ' + (error?.message || 'Bilinmeyen hata'))
      } finally {
         setIsGenerating(false)
      }
   }

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
                                 placeholder="Category name"
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

               {/* AI Image Generation Section */}
               <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed space-y-6">
                  <div>
                     <h3 className="text-lg font-medium flex items-center gap-2">
                        <BotIcon className="w-5 h-5 text-purple-500" />
                        AI Kategori Arkaplanı Oluşturucu
                     </h3>
                     <p className="text-sm text-muted-foreground mt-1">
                        Bu kategori için açılır menüde (navbar) gösterilecek lüks bir 3D baskı arka plan görseli oluşturun.
                     </p>
                  </div>

                  <div className="flex gap-4 items-end">
                     <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           Oluşturmak istediğiniz görseli tarif edin:
                        </label>
                        <Input
                           placeholder="Örn: Siyah mermer masada duran zarif bir antik yunan heykeli..."
                           value={aiPrompt}
                           onChange={(e) => setAiPrompt(e.target.value)}
                           disabled={isGenerating || loading}
                        />
                     </div>
                     <Button
                        type="button"
                        onClick={onGenerateImage}
                        disabled={isGenerating || loading || !aiPrompt}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                     >
                        {isGenerating ? 'Oluşturuluyor...' : 'Görsel Üret'}
                     </Button>
                  </div>

                  <FormField
                     control={form.control}
                     name="imageUrl"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Arkaplan Görseli URL</FormLabel>
                           <FormControl>
                              <Input disabled={loading} placeholder="/bg-figurler.png veya https://..." {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {form.watch('imageUrl') && (
                     <div className="relative w-full h-[200px] rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                           src={form.watch('imageUrl')!}
                           alt="Category Preview"
                           className="w-full h-full object-cover"
                        />
                     </div>
                  )}
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
