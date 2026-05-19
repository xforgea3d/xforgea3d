'use client'

import { adminPath } from '@/lib/base-path'
import * as z from 'zod'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Loader2, Trash } from 'lucide-react'
import { Banner } from '@prisma/client'
import { useParams, useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import { AlertModal } from '@/components/modals/alert-modal'
import ImageUpload from '@/components/ui/image-upload'

const formSchema = z.object({
   label: z.string().min(1),
   image: z.string().min(1),
   link: z.string().optional().or(z.literal('')).refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      { message: 'Geçersiz URL formatı. URL "/" veya "http(s)://" ile başlamalıdır' }
   ),
   altText: z.string().optional().or(z.literal('')),
   displayOrder: z.coerce.number().int().min(0).default(0),
   isActive: z.boolean().default(true),
   startDate: z.string().optional().or(z.literal('')),
   endDate: z.string().optional().or(z.literal('')),
})

type BannerFormValues = z.infer<typeof formSchema>

interface BannerFormProps {
   initialData: Banner | null
}

export const BannerForm: React.FC<BannerFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Banner Düzenle' : 'Yeni Banner'
   const description = initialData ? 'Banner bilgilerini güncelleyin.' : 'Yeni bir banner ekleyin.'
   const toastMessage = initialData ? 'Banner güncellendi.' : 'Banner oluşturuldu.'
   const action = initialData ? 'Kaydet' : 'Oluştur'

   const form = useForm<BannerFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData ? {
         label: initialData.label,
         image: initialData.image,
         link: initialData.link || '',
         altText: initialData.altText || '',
         displayOrder: initialData.displayOrder ?? 0,
         isActive: initialData.isActive ?? true,
         startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 10) : '',
         endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 10) : '',
      } : {
         label: '',
         image: '',
         link: '',
         altText: '',
         displayOrder: 0,
         isActive: true,
         startDate: '',
         endDate: '',
      },
   })

   const onSubmit = async (data: BannerFormValues) => {
      try {
         setLoading(true)
         const url = initialData ? `/api/banners/${params.bannerId}` : `/api/banners`
         const method = initialData ? 'PATCH' : 'POST'
         const res = await fetch(adminPath(url), {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
         })
         if (!res.ok) throw new Error(await res.text())
         router.refresh()
         window.location.href = adminPath('/banners')
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

         const res = await fetch(adminPath(`/api/banners/${params.bannerId}`), {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme başarısız')

         router.refresh()
         window.location.href = adminPath('/banners')
         toast.success('Banner silindi.')
      } catch {
         toast.error(
            'Önce bu banneri kullanan tüm kategorileri kaldırın.'
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
                  name="image"
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
                        <p className="text-xs text-muted-foreground mt-2 space-y-1">
                           <span className="font-medium text-foreground block">📸 Banner Görseli:</span>
                           <span className="block">• Boyut: 1920×600px (geniş banner)</span>
                           <span className="block">• Format: JPG (daha küçük dosya boyutu)</span>
                           <span className="block">• Yüksek kalite, dikkat çekici görsel</span>
                           <span className="block">• Ana sayfada carousel olarak gösterilir</span>
                           <span className="block">• Maks. 5MB</span>
                        </p>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="label"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Baslik</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Banner basligi"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="link"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Baglanti URL</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="/products veya https://..."
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="altText"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Alt Metin (SEO)</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Gorsel aciklamasi"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="displayOrder"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Siralama</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="0"
                                 {...field}
                              />
                           </FormControl>
                           <p className="text-xs text-muted-foreground">Kucuk sayi once gosterilir.</p>
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
                              <Input type="date" disabled={loading} {...field} />
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
                              <Input type="date" disabled={loading} {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <div className="flex items-center gap-2">
                  <FormField
                     control={form.control}
                     name="isActive"
                     render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                           <FormControl>
                              <input
                                 type="checkbox"
                                 checked={field.value}
                                 onChange={field.onChange}
                                 disabled={loading}
                                 className="h-4 w-4 rounded border-input"
                              />
                           </FormControl>
                           <FormLabel className="font-normal">Aktif</FormLabel>
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Kaydediliyor...' : action}
               </Button>
            </form>
         </Form>
      </>
   )
}
