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
import { Trash } from 'lucide-react'
import Image from 'next/image'
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

   const title = initialData ? 'Markayı Düzenle' : 'Yeni Marka Ekle'
   const description = initialData ? 'Araç markası bilgilerini güncelleyin.' : 'Yeni bir araç markası ekleyin.'
   const toastMessage = initialData ? 'Marka güncellendi.' : 'Marka oluşturuldu.'
   const action = initialData ? 'Kaydet' : 'Oluştur'

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
         router.push('/car-brands')
         toast.success(toastMessage)
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
         <div className="flex items-center justify-between">
            <Heading title={title} description={description} />
            {initialData && (
               <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
                  <Trash className="h-4" />
               </Button>
            )}
         </div>
         <Separator />
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
               {/* Logo Upload */}
               <div className="space-y-3">
                  <FormField
                     control={form.control}
                     name="logoUrl"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Marka Logosu</FormLabel>
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
                  {logoUrl && (
                     <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                        <div className="relative w-16 h-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                           <Image
                              src={logoUrl}
                              alt="Logo preview"
                              width={56}
                              height={56}
                              className="object-contain"
                           />
                        </div>
                        <span className="text-xs text-muted-foreground truncate flex-1">{logoUrl}</span>
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                     control={form.control}
                     name="name"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Marka Adı</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="BMW"
                                 {...field}
                                 onChange={handleNameChange}
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
                           <FormLabel>Slug</FormLabel>
                           <FormControl>
                              <Input disabled={loading} placeholder="bmw" {...field} />
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
                           <FormLabel>Sıralama</FormLabel>
                           <FormControl>
                              <Input type="number" disabled={loading} placeholder="0" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
