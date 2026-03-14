'use client'

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
import { Input } from '@/components/ui/input'
import { useCsrf } from '@/hooks/useCsrf'
import type { ProfileWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   name: z.string().min(1),
   email: z.string().optional(),
   phone: z.string().optional(),
})

type UserFormValues = z.infer<typeof formSchema>

interface UserFormProps {
   initialData: ProfileWithIncludes | null
}

export const UserForm: React.FC<UserFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()
   const csrfToken = useCsrf()

   const [loading, setLoading] = useState(false)

   const defaultValues: UserFormValues = initialData
      ? {
           name: initialData.name ?? '',
           phone: initialData.phone ?? '',
           email: initialData.email ?? '',
        }
      : {
           name: '',
           phone: '',
           email: '',
        }

   const form = useForm<UserFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: UserFormValues) => {
      try {
         setLoading(true)

         const { email, ...updateData } = data

         const res = await fetch(`/api/profile`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
            },
            body: JSON.stringify({
               ...updateData,
               csrfToken,
            }),
            cache: 'no-store',
         })

         if (!res.ok) {
            throw new Error('Profile update failed')
         }

         router.refresh()
         router.push(`/profile`)
         toast.success('Profil güncellendi.')
      } catch (error: any) {
         toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
      } finally {
         setLoading(false)
      }
   }

   return (
      <Form {...form}>
         <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 w-full"
         >
            <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Ad Soyad</FormLabel>
                     <FormControl>
                        <Input
                           disabled={loading}
                           placeholder="Adınız Soyadınız"
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="email"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>E-posta</FormLabel>
                     <FormControl>
                        <Input
                           disabled
                           placeholder="E-posta"
                           {...field}
                        />
                     </FormControl>
                     <FormDescription>
                        E-posta adresi değiştirilemez.
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="phone"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Telefon</FormLabel>
                     <FormControl>
                        <Input
                           disabled={loading}
                           placeholder="Telefon"
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <Button disabled={loading} className="ml-auto" type="submit">
               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Değişiklikleri Kaydet
            </Button>
         </form>
      </Form>
   )
}
