'use client'

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
import { Input } from '@/components/ui/input'
import type { ProfileWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   name: z.string().min(1),
   email: z.string().min(1),
   phone: z.string().min(1),
})

type UserFormValues = z.infer<typeof formSchema>

interface UserFormProps {
   initialData: ProfileWithIncludes | null
}

export const UserForm: React.FC<UserFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()

   const [loading, setLoading] = useState(false)

   const toastMessage = 'Kullanıcı güncellendi.'
   const action = 'Kaydet'

   const defaultValues = initialData
      ? {
         ...initialData,
      }
      : {
         name: '---',
         phone: '---',
         email: '---',
      }

   const form = useForm<UserFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
   })

   const onSubmit = async (data: UserFormValues) => {
      try {
         setLoading(true)

         if (initialData) {
            const res = await fetch(`/api/users/${params.userId}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error(await res.text())
         } else {
            const res = await fetch(`/api/users`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error(await res.text())
         }

         router.refresh()
         router.push(`/users`)
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Bir hata oluştu.')
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
                     <FormLabel>Name</FormLabel>
                     <FormControl>
                        <Input
                           disabled={loading}
                           placeholder="Full Name"
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
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                        <Input
                           disabled={loading}
                           placeholder="Email"
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />
            <FormField
               control={form.control}
               name="phone"
               render={({ field }) => (
                  <FormItem>
                     <FormLabel>Phone</FormLabel>
                     <FormControl>
                        <Input
                           disabled={loading}
                           placeholder="Phone"
                           {...field}
                        />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <Button disabled={loading} className="ml-auto" type="submit">
               {action}
            </Button>
         </form>
      </Form>
   )
}
