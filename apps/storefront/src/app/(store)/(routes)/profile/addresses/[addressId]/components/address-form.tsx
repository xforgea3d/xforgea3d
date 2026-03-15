'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Heading } from '@/components/native/heading'
import { CityDistrictSelector } from '@/components/native/CityDistrictSelector'
import { PhoneInput, validateTurkishPhone } from '@/components/native/PhoneInput'
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
import { Textarea } from '@/components/ui/textarea'
import { useCsrf } from '@/hooks/useCsrf'
import { zodResolver } from '@hookform/resolvers/zod'
import { Address } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
   city: z.string().min(1, 'Şehir seçiniz'),
   district: z.string().min(1, 'İlçe seçiniz'),
   address: z.string().min(1, 'Adres giriniz'),
   phone: z.string().min(1, 'Telefon giriniz').refine(
      (val) => !validateTurkishPhone(val),
      (val) => ({ message: validateTurkishPhone(val) || 'Geçersiz telefon numarası' })
   ),
   postalCode: z.string().min(1, 'Posta kodu giriniz'),
})

type AddressFormValues = z.infer<typeof formSchema>

interface AddressFormProps {
   initialData: (Address & { district?: string }) | null
}

export const AddressForm: React.FC<AddressFormProps> = ({ initialData }) => {
   const params = useParams()
   const router = useRouter()
   const csrfToken = useCsrf()

   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Adresi Düzenle' : 'Yeni Adres'
   const description = initialData ? 'Adres bilgilerinizi güncelleyin.' : 'Yeni bir adres ekleyin.'
   const toastMessage = initialData ? 'Adres güncellendi.' : 'Adres oluşturuldu.'
   const action = initialData ? 'Kaydet' : 'Oluştur'

   const form = useForm<AddressFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: initialData
         ? {
              phone: initialData.phone || '',
              city: initialData.city || '',
              district: (initialData as any).district || '',
              address: initialData.address || '',
              postalCode: initialData.postalCode || '',
           }
         : {
              phone: '',
              city: '',
              district: '',
              address: '',
              postalCode: '',
           },
   })

   const watchCity = form.watch('city')
   const watchDistrict = form.watch('district')
   const watchPostalCode = form.watch('postalCode')

   const onSubmit = async (data: AddressFormValues) => {
      if (!csrfToken) {
         toast.error('Sayfa yükleniyor, lütfen birkaç saniye bekleyin.')
         return
      }
      try {
         setLoading(true)

         const url = initialData ? `/api/addresses/${params.addressId}` : `/api/addresses`
         const method = initialData ? 'PATCH' : 'POST'

         const res = await fetch(url, {
            method,
            headers: {
               'Content-Type': 'application/json',
               'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({ ...data, csrfToken }),
         })

         if (!res.ok) {
            const text = await res.text()
            throw new Error(text || 'İşlem başarısız')
         }

         router.refresh()
         router.push(`/profile/addresses`)
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      if (!csrfToken) {
         toast.error('Sayfa yükleniyor, lütfen birkaç saniye bekleyin.')
         return
      }
      try {
         setLoading(true)

         const res = await fetch(`/api/addresses/${params.addressId}`, {
            method: 'DELETE',
            headers: { 'x-csrf-token': csrfToken },
         })

         if (!res.ok) throw new Error()

         router.refresh()
         router.push(`/profile/addresses`)
         toast.success('Adres silindi.')
      } catch (error: any) {
         toast.error('Adres silinirken bir hata oluştu.')
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
                  {/* City / District / Postal Code row */}
                  <div className="col-span-3">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                           <FormLabel>Şehir</FormLabel>
                           <CityDistrictSelector
                              city={watchCity}
                              district={watchDistrict}
                              postalCode={watchPostalCode}
                              onCityChange={(val) => {
                                 form.setValue('city', val, { shouldValidate: true })
                                 form.setValue('district', '')
                                 form.setValue('postalCode', '')
                              }}
                              onDistrictChange={(val) => form.setValue('district', val, { shouldValidate: true })}
                              onPostalCodeChange={(val) => form.setValue('postalCode', val, { shouldValidate: true })}
                              disabled={loading}
                           />
                           {form.formState.errors.city && (
                              <p className="text-sm font-medium text-destructive">{form.formState.errors.city.message}</p>
                           )}
                           {form.formState.errors.district && (
                              <p className="text-sm font-medium text-destructive">{form.formState.errors.district.message}</p>
                           )}
                           {form.formState.errors.postalCode && (
                              <p className="text-sm font-medium text-destructive">{form.formState.errors.postalCode.message}</p>
                           )}
                        </div>
                     </div>
                  </div>

                  <FormField
                     control={form.control}
                     name="phone"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Telefon</FormLabel>
                           <FormControl>
                              <PhoneInput
                                 value={field.value}
                                 onChange={field.onChange}
                                 disabled={loading}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <div className="col-span-2">
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Adres</FormLabel>
                              <FormControl>
                                 <Textarea
                                    disabled={loading}
                                    placeholder="Mahalle, Cadde, Bina No, Daire No"
                                    {...field}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
