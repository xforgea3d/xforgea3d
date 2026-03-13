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
import ImageUpload from '@/components/ui/image-upload'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   name: z.string().min(1, 'Marka adı zorunlu'),
   slug: z.string().min(1, 'Slug zorunlu'),
   logoUrl: z.string().optional(),
   sortOrder: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof formSchema>

interface BrandFormProps {
   initialData: {
      id: string
      name: string
      slug: string
      logoUrl: string | null
      sortOrder: number
   } | null
}

function slugify(text: string) {
   return text
      .toLowerCase()
      .replace(/[çÇ]/g, 'c')
      .replace(/[şŞ]/g, 's')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[öÖ]/g, 'o')
      .replace(/[ıİ]/g, 'i')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
}

export const BrandForm: React.FC<BrandFormProps> = ({ initialData }) => {
   const router = useRouter()
   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData
         ? {
              name: initialData.name,
              slug: initialData.slug,
              logoUrl: initialData.logoUrl || '',
              sortOrder: initialData.sortOrder,
           }
         : {
              name: '',
              slug: '',
              logoUrl: '',
              sortOrder: 0,
           },
   })

   const onSubmit = async (data: FormValues) => {
      try {
         setLoading(true)
         const url = initialData ? `/api/car-brands/${initialData.id}` : '/api/car-brands'
         const method = initialData ? 'PATCH' : 'POST'
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
         })
         if (!res.ok) throw new Error(await res.text())
         router.refresh()
         if (!initialData) router.push('/car-brands')
         toast.success(initialData ? 'Marka güncellendi.' : 'Marka oluşturuldu.')
      } catch (e: any) {
         toast.error('Hata: ' + (e?.message || 'Bilinmeyen'))
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)
         const res = await fetch(`/api/car-brands/${initialData!.id}`, { method: 'DELETE' })
         if (!res.ok) throw new Error(await res.text())
         router.refresh()
         router.push('/car-brands')
         toast.success('Marka silindi.')
      } catch (e: any) {
         toast.error('Hata: ' + (e?.message || 'Bilinmeyen'))
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value
      form.setValue('name', name)
      if (!initialData) {
         form.setValue('slug', slugify(name))
      }
   }

   const logoUrl = form.watch('logoUrl')

   return (
      <>
         <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />

         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
               <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-start gap-5">
                     {/* Logo preview / upload */}
                     <div className="shrink-0">
                        {logoUrl ? (
                           <div className="w-16 h-16 rounded-xl bg-white border-2 flex items-center justify-center overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                 src={logoUrl}
                                 alt="Logo"
                                 className="w-12 h-12 object-contain"
                              />
                           </div>
                        ) : (
                           <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-2 border-dashed flex items-center justify-center">
                              <span className="text-xl font-bold text-orange-600">
                                 {form.watch('name')?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                           </div>
                        )}
                     </div>

                     {/* Fields inline */}
                     <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <FormField
                           control={form.control}
                           name="name"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel className="text-xs">Marka Adı</FormLabel>
                                 <FormControl>
                                    <Input
                                       disabled={loading}
                                       placeholder="BMW"
                                       {...field}
                                       onChange={handleNameChange}
                                       className="h-9"
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={form.control}
                           name="slug"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel className="text-xs">Slug</FormLabel>
                                 <FormControl>
                                    <Input
                                       disabled={loading}
                                       placeholder="bmw"
                                       {...field}
                                       className="h-9 font-mono text-sm"
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                        <FormField
                           control={form.control}
                           name="sortOrder"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel className="text-xs">Sıralama</FormLabel>
                                 <FormControl>
                                    <Input type="number" disabled={loading} placeholder="0" {...field} className="h-9" />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        {/* Logo upload inline */}
                        <FormField
                           control={form.control}
                           name="logoUrl"
                           render={({ field }) => (
                              <FormItem>
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
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                     <Button disabled={loading} type="submit" size="sm" className="gap-2">
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Kaydet
                     </Button>
                     {initialData && (
                        <Button
                           type="button"
                           disabled={loading}
                           variant="destructive"
                           size="sm"
                           onClick={() => setOpen(true)}
                           className="ml-auto gap-2"
                        >
                           <Trash2 className="h-3.5 w-3.5" />
                           Markayı Sil
                        </Button>
                     )}
                  </div>
               </div>
            </form>
         </Form>
      </>
   )
}
