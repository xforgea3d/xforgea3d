'use client'

import { AlertModal } from '@/components/modals/alert-modal'
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
import { Heading } from '@/components/ui/heading'
import ImageUpload from '@/components/ui/image-upload'
import { CustomOptionsEditor } from './custom-options-editor'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { ProductWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { Category } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   title: z.string().min(1),
   images: z.string().array(),
   price: z.coerce.number().min(1),
   discount: z.coerce.number().min(0),
   stock: z.coerce.number().min(0),
   brandId: z.string().min(1),
   categoryId: z.string().min(1),
   productType: z.string().default('READY'),
   customOptions: z.string().optional(),
   isFeatured: z.boolean().default(false).optional(),
   isAvailable: z.boolean().default(false).optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
   initialData: ProductWithIncludes | null
   categories: Category[]
   brands: { id: string; title: string }[]
}

export const ProductForm: React.FC<ProductFormProps> = ({
   initialData,
   categories,
   brands,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Ürün Düzenle' : 'Yeni Ürün'
   const description = initialData ? 'Ürün bilgilerini güncelleyin.' : 'Yeni bir ürün ekleyin.'
   const toastMessage = initialData ? 'Ürün güncellendi.' : 'Ürün oluşturuldu.'
   const action = initialData ? 'Kaydet' : 'Oluştur'

   const defaultValues = initialData
      ? {
         ...initialData,
         price: parseFloat(String(initialData?.price.toFixed(2))),
         discount: parseFloat(String(initialData?.discount.toFixed(2))),
         brandId: (initialData as any)?.brandId ?? '',
         categoryId: (initialData as any)?.categories?.[0]?.id ?? '',
         productType: (initialData as any)?.productType ?? 'READY',
         customOptions: (initialData as any)?.customOptions
            ? JSON.stringify((initialData as any).customOptions, null, 2)
            : '',
      }
      : {
         title: '',
         images: [],
         price: 0,
         discount: 0,
         stock: 0,
         brandId: '',
         categoryId: '',
         productType: 'READY',
         customOptions: '',
         isFeatured: false,
         isAvailable: false,
      }

   const form = useForm<ProductFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (formData: ProductFormValues) => {
      try {
         setLoading(true)
         const payload = {
            ...formData,
            categoryIds: [formData.categoryId],
            customOptions: formData.customOptions
               ? JSON.parse(formData.customOptions)
               : null,
         }
         if (initialData) {
            const res = await fetch(`/api/products/${params.productId}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error(await res.text())
         } else {
            const res = await fetch(`/api/products`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error(await res.text())
         }
         router.refresh()
         router.push(`/products`)
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

         const res = await fetch(`/api/products/${params.productId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme başarısız')

         router.refresh()
         router.push(`/products`)
         toast.success('Ürün silindi.')
      } catch (error: any) {
         toast.error('Bir hata oluştu.')
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
                  name="images"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Görseller*</FormLabel>
                        <FormControl>
                           <ImageUpload
                              value={field.value}
                              disabled={loading}
                              onChange={(url) =>
                                 field.onChange([...field.value, url])
                              }
                              onRemove={(url) =>
                                 field.onChange(
                                    field.value.filter(
                                       (current) => current !== url
                                    )
                                 )
                              }
                           />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Önerilen boyut: 800×800px (kare format)</p>
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
                           <FormLabel>Ürün Adı*</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Ürün başlığı"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="price"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Fiyat*</FormLabel>
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
                     name="discount"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>İndirim (opsiyonel)</FormLabel>
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
                     name="stock"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Stok (opsiyonel)</FormLabel>
                           <FormControl>
                              <Input
                                 type="number"
                                 disabled={loading}
                                 placeholder="10"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  {/* Product Type */}
                  <FormField
                     control={form.control}
                     name="productType"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Ürün Tipi (opsiyonel)</FormLabel>
                           <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Ürün tipi seçin" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 <SelectItem value="READY">HAZIR — Standart Ürün</SelectItem>
                                 <SelectItem value="CUSTOM">KİŞİYE ÖZEL — Özelleştirilebilir</SelectItem>
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Custom Options JSON Editor (Shown only if productType is CUSTOM) */}
                  {form.watch('productType') === 'CUSTOM' && (
                     <div className="col-span-1 md:col-span-3">
                        <FormField
                           control={form.control}
                           name="customOptions"
                           render={({ field }) => (
                              <FormItem>
                                 <FormControl>
                                    <CustomOptionsEditor
                                       disabled={loading}
                                       value={field.value || ''}
                                       onChange={field.onChange}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>
                  )}

                  {/* Brand */}
                  <FormField
                     control={form.control}
                     name="brandId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Koleksiyon*</FormLabel>
                           <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Marka seçin" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                       {brand.title}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Category */}
                  <FormField
                     control={form.control}
                     name="categoryId"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Kategori*</FormLabel>
                           <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue defaultValue={field.value} placeholder="Kategori seçin" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                       {category.title}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* isFeatured */}
                  <FormField
                     control={form.control}
                     name="isFeatured"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                           <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                              <FormLabel>Öne Çıkan</FormLabel>
                              <FormDescription>Ana sayfada göster.</FormDescription>
                           </div>
                        </FormItem>
                     )}
                  />

                  {/* isAvailable */}
                  <FormField
                     control={form.control}
                     name="isAvailable"
                     render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                           <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                           </FormControl>
                           <div className="space-y-1 leading-none">
                              <FormLabel>Satışta</FormLabel>
                              <FormDescription>Mağazada görüntülensin.</FormDescription>
                           </div>
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
