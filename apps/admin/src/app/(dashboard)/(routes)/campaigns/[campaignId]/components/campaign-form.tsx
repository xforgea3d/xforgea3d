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
import { Campaign, DiscountCode, Product } from '@prisma/client'
import {
   Loader2,
   Trash,
   Eye,
   MousePointer,
   ShoppingBag,
   DollarSign,
   Check,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z
   .object({
      name: z.string().min(1, 'Kampanya adi zorunlu'),
      description: z.string().optional(),
      emoji: z.string().min(1, 'Emoji zorunlu'),
      startDate: z.string().min(1, 'Baslangic tarihi zorunlu'),
      endDate: z.string().min(1, 'Bitis tarihi zorunlu'),
      isActive: z.boolean(),
      priority: z.coerce.number().min(0),
      primaryColor: z.string().min(1),
      secondaryColor: z.string().min(1),
      gradientFrom: z.string(),
      gradientTo: z.string(),
      bannerTitle: z.string().min(1, 'Banner basligi zorunlu'),
      bannerSubtitle: z.string().optional(),
      bannerCtaText: z.string().min(1),
      bannerCtaLink: z.string().min(1),
      bannerImageUrl: z.string().optional(),
      discountPercent: z.coerce.number().min(0).max(100),
      discountCodeId: z.string().optional(),
      productIds: z.array(z.string()),
   })
   .refine(
      (data) => {
         if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate)
         }
         return true
      },
      {
         message: 'Bitis tarihi baslangic tarihinden sonra olmalidir',
         path: ['endDate'],
      }
   )

type CampaignFormValues = z.infer<typeof formSchema>

type CampaignWithRelations = Campaign & {
   products: { id: string; title: string; price: number; images: string[] }[]
   discountCode: DiscountCode | null
}

function toDateInputValue(date: Date | string): string {
   const d = new Date(date)
   return d.toISOString().split('T')[0]
}

interface CampaignFormProps {
   initialData: CampaignWithRelations | null
   products: { id: string; title: string; price: number; images: string[] }[]
   discountCodes: DiscountCode[]
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
   initialData,
   products,
   discountCodes,
}) => {
   const params = useParams()
   const router = useRouter()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)
   const [productSearch, setProductSearch] = useState('')

   const title = initialData ? 'Kampanya Duzenle' : 'Yeni Kampanya'
   const description = initialData
      ? 'Kampanya bilgilerini guncelleyin.'
      : 'Yeni bir kampanya olusturun.'
   const toastMessage = initialData ? 'Kampanya guncellendi.' : 'Kampanya olusturuldu.'
   const action = initialData ? 'Kaydet' : 'Olustur'

   const form = useForm<CampaignFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData
         ? {
              name: initialData.name,
              description: initialData.description ?? '',
              emoji: initialData.emoji,
              startDate: toDateInputValue(initialData.startDate),
              endDate: toDateInputValue(initialData.endDate),
              isActive: initialData.isActive,
              priority: initialData.priority,
              primaryColor: initialData.primaryColor,
              secondaryColor: initialData.secondaryColor,
              gradientFrom: initialData.gradientFrom,
              gradientTo: initialData.gradientTo,
              bannerTitle: initialData.bannerTitle,
              bannerSubtitle: initialData.bannerSubtitle ?? '',
              bannerCtaText: initialData.bannerCtaText,
              bannerCtaLink: initialData.bannerCtaLink,
              bannerImageUrl: initialData.bannerImageUrl ?? '',
              discountPercent: initialData.discountPercent,
              discountCodeId: initialData.discountCodeId ?? '',
              productIds: initialData.products.map((p) => p.id),
           }
         : {
              name: '',
              description: '',
              emoji: '\uD83C\uDFF7\uFE0F',
              startDate: toDateInputValue(new Date()),
              endDate: '',
              isActive: true,
              priority: 0,
              primaryColor: '#f97316',
              secondaryColor: '#f59e0b',
              gradientFrom: 'from-orange-500/10',
              gradientTo: 'to-amber-500/10',
              bannerTitle: '',
              bannerSubtitle: '',
              bannerCtaText: 'Kampanyayi Gor',
              bannerCtaLink: '/products',
              bannerImageUrl: '',
              discountPercent: 0,
              discountCodeId: '',
              productIds: [],
           },
   })

   const selectedProductIds = form.watch('productIds')

   const toggleProduct = (productId: string) => {
      const current = form.getValues('productIds')
      if (current.includes(productId)) {
         form.setValue(
            'productIds',
            current.filter((id) => id !== productId)
         )
      } else {
         form.setValue('productIds', [...current, productId])
      }
   }

   const filteredProducts = products.filter((p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase())
   )

   const onSubmit = async (data: CampaignFormValues) => {
      try {
         setLoading(true)
         const url = initialData
            ? `/api/campaigns/${params.campaignId}`
            : `/api/campaigns`
         const method = initialData ? 'PATCH' : 'POST'
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...data,
               discountCodeId: data.discountCodeId || null,
               bannerImageUrl: data.bannerImageUrl || null,
            }),
         })
         if (!res.ok) throw new Error(await res.text())
         toast.success(toastMessage)
         window.location.href = '/campaigns'
      } catch (error: any) {
         toast.error('Bir hata olustu: ' + (error?.message || ''))
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)
         const res = await fetch(`/api/campaigns/${params.campaignId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         if (!res.ok) throw new Error('Silme basarisiz')
         router.refresh()
         router.push('/campaigns')
         toast.success('Kampanya silindi.')
      } catch (error: any) {
         toast.error('Kampanya silinemedi.')
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

         {/* Stats (read-only, only for existing campaigns) */}
         {initialData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
               <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                     <Eye className="h-4 w-4" />
                     Goruntulenme
                  </div>
                  <div className="text-2xl font-bold">{initialData.views}</div>
               </div>
               <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                     <MousePointer className="h-4 w-4" />
                     Tiklama
                  </div>
                  <div className="text-2xl font-bold">{initialData.clicks}</div>
               </div>
               <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                     <ShoppingBag className="h-4 w-4" />
                     Siparis
                  </div>
                  <div className="text-2xl font-bold">{initialData.orders}</div>
               </div>
               <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                     <DollarSign className="h-4 w-4" />
                     Gelir
                  </div>
                  <div className="text-2xl font-bold">
                     {initialData.revenue.toLocaleString('tr-TR')} TL
                  </div>
               </div>
            </div>
         )}

         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full mt-4">
               {/* Basic Info */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
                  <div className="md:grid md:grid-cols-3 gap-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Kampanya Adi</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="Yaz Indirimleri" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="emoji"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Emoji</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="\uD83C\uDFF7\uFE0F" {...field} />
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
                              <FormLabel>Aciklama</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="Kampanya aciklamasi..." {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <Separator />

               {/* Dates & Status */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Tarih ve Durum</h3>
                  <div className="md:grid md:grid-cols-4 gap-6">
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
                     <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Aktif</FormLabel>
                              <FormControl>
                                 <div className="flex items-center gap-3 pt-2">
                                    <button
                                       type="button"
                                       onClick={() => field.onChange(!field.value)}
                                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                          field.value ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'
                                       }`}
                                    >
                                       <span
                                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                             field.value ? 'translate-x-6' : 'translate-x-1'
                                          }`}
                                       />
                                    </button>
                                    <span className="text-sm">{field.value ? 'Evet' : 'Hayir'}</span>
                                 </div>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Oncelik</FormLabel>
                              <FormControl>
                                 <Input type="number" min={0} disabled={loading} placeholder="0" {...field} />
                              </FormControl>
                              <FormDescription>Yuksek = once gosterilir</FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <Separator />

               {/* Theme Colors */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Tema Renkleri</h3>
                  <div className="md:grid md:grid-cols-4 gap-6">
                     <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Ana Renk</FormLabel>
                              <FormControl>
                                 <div className="flex items-center gap-2">
                                    <input
                                       type="color"
                                       value={field.value}
                                       onChange={field.onChange}
                                       className="h-10 w-10 rounded border cursor-pointer"
                                    />
                                    <Input disabled={loading} {...field} />
                                 </div>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Ikincil Renk</FormLabel>
                              <FormControl>
                                 <div className="flex items-center gap-2">
                                    <input
                                       type="color"
                                       value={field.value}
                                       onChange={field.onChange}
                                       className="h-10 w-10 rounded border cursor-pointer"
                                    />
                                    <Input disabled={loading} {...field} />
                                 </div>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="gradientFrom"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Gradient From</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="from-orange-500/10" {...field} />
                              </FormControl>
                              <FormDescription>Tailwind sinifi</FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="gradientTo"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Gradient To</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="to-amber-500/10" {...field} />
                              </FormControl>
                              <FormDescription>Tailwind sinifi</FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <Separator />

               {/* Banner */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Banner</h3>
                  <div className="md:grid md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="bannerTitle"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Banner Basligi</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="Kampanya Basladi!" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="bannerSubtitle"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Banner Alt Basligi</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="Ozel firsatlari kacirmayin" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="bannerCtaText"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>CTA Buton Metni</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="Kampanyayi Gor" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="bannerCtaLink"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>CTA Link</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="/products" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
                  <div className="mt-4">
                     <FormField
                        control={form.control}
                        name="bannerImageUrl"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Banner Gorsel URL (Opsiyonel)</FormLabel>
                              <FormControl>
                                 <Input disabled={loading} placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
                  {/* Live preview */}
                  <div className="mt-4 rounded-xl border p-4">
                     <p className="text-xs text-muted-foreground mb-2">Onizleme:</p>
                     <div
                        className="rounded-lg p-4 flex items-center gap-3"
                        style={{
                           background: `linear-gradient(135deg, ${form.watch('primaryColor')}18, ${form.watch('secondaryColor')}18)`,
                        }}
                     >
                        <span className="text-xl">{form.watch('emoji')}</span>
                        <div>
                           <span
                              className="text-sm font-bold"
                              style={{ color: form.watch('primaryColor') }}
                           >
                              {form.watch('bannerTitle') || 'Banner basligi'}
                           </span>
                           <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                              {form.watch('bannerSubtitle') || 'Alt baslik'}
                           </span>
                        </div>
                        <span
                           className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-white"
                           style={{ backgroundColor: form.watch('primaryColor') }}
                        >
                           {form.watch('bannerCtaText') || 'CTA'}
                        </span>
                     </div>
                  </div>
               </div>

               <Separator />

               {/* Discount */}
               <div>
                  <h3 className="text-lg font-semibold mb-4">Indirim</h3>
                  <div className="md:grid md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="discountPercent"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Indirim Yuzdesi (%)</FormLabel>
                              <FormControl>
                                 <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    disabled={loading}
                                    placeholder="0"
                                    {...field}
                                 />
                              </FormControl>
                              <FormDescription>
                                 Bu kampanya icin genel indirim yuzdesi
                              </FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="discountCodeId"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Indirim Kodu Baglantisi</FormLabel>
                              <FormControl>
                                 <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    disabled={loading}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                 >
                                    <option value="">Indirim kodu secin (opsiyonel)</option>
                                    {discountCodes.map((dc) => (
                                       <option key={dc.id} value={dc.id}>
                                          {dc.code} - %{dc.percent} (Stok: {dc.stock})
                                       </option>
                                    ))}
                                 </select>
                              </FormControl>
                              <FormDescription>
                                 Mevcut bir indirim kodunu bu kampanyaya baglayabilirsiniz
                              </FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>

               <Separator />

               {/* Products */}
               <div>
                  <h3 className="text-lg font-semibold mb-2">Kampanya Urunleri</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Bu kampanyaya dahil edilecek urunleri secin ({selectedProductIds.length} secili)
                  </p>
                  {selectedProductIds.length === 0 && (
                     <div className="mb-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                        Kampanyaya henuz urun eklenmedi. Urun eklemeden kampanya aktif olmaz.
                     </div>
                  )}
                  <Input
                     placeholder="Urun ara..."
                     value={productSearch}
                     onChange={(e) => setProductSearch(e.target.value)}
                     className="mb-3 max-w-md"
                  />
                  <div className="max-h-[400px] overflow-y-auto rounded-xl border p-2 space-y-1">
                     {filteredProducts.map((product) => {
                        const isSelected = selectedProductIds.includes(product.id)
                        return (
                           <button
                              key={product.id}
                              type="button"
                              onClick={() => toggleProduct(product.id)}
                              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                                 isSelected
                                    ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
                                    : 'hover:bg-muted/50 border border-transparent'
                              }`}
                           >
                              <div
                                 className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                       ? 'bg-orange-500 border-orange-500 text-white'
                                       : 'border-muted-foreground/30'
                                 }`}
                              >
                                 {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              {product.images[0] && (
                                 <img
                                    src={product.images[0]}
                                    alt=""
                                    className="w-8 h-8 rounded object-cover"
                                 />
                              )}
                              <span className="text-sm font-medium truncate flex-1">
                                 {product.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                 {product.price.toLocaleString('tr-TR')} TL
                              </span>
                           </button>
                        )
                     })}
                     {filteredProducts.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                           Urun bulunamadi
                        </p>
                     )}
                  </div>
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
