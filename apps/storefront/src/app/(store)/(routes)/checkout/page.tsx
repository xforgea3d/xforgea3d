'use client'

import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCsrf } from '@/hooks/useCsrf'
import { useCartContext } from '@/state/Cart'
import { CheckCircle2Icon, Loader2, MapPin, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface Address {
   id: string
   address: string
   city: string
   phone: string
   postalCode: string
}

export default function CheckoutPage() {
   const router = useRouter()
   const csrfToken = useCsrf()
   const { cart, refreshCart } = useCartContext()

   const [addresses, setAddresses] = useState<Address[]>([])
   const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
   const [discountCode, setDiscountCode] = useState('')
   const [loading, setLoading] = useState(false)
   const [loadingAddresses, setLoadingAddresses] = useState(true)
   const [showNewAddress, setShowNewAddress] = useState(false)
   const [newAddress, setNewAddress] = useState({ address: '', city: '', phone: '', postalCode: '' })

   useEffect(() => {
      fetch('/api/addresses')
         .then((r) => r.json())
         .then((data) => {
            setAddresses(data)
            if (data.length > 0) setSelectedAddress(data[0].id)
         })
         .catch(() => toast.error('Adresler yüklenemedi'))
         .finally(() => setLoadingAddresses(false))
   }, [])

   const costs = useMemo(() => {
      let total = 0, discount = 0
      if (cart?.items) {
         for (const item of cart.items) {
            total += item.count * item.product.price
            discount += item.count * item.product.discount
         }
      }
      const afterDiscount = total - discount
      const tax = afterDiscount * 0.09
      const payable = afterDiscount + tax
      return {
         total: total.toFixed(2),
         discount: discount.toFixed(2),
         tax: tax.toFixed(2),
         payable: payable.toFixed(2),
      }
   }, [cart?.items])

   const handleNewAddress = useCallback(async () => {
      if (!newAddress.address || !newAddress.city || !newAddress.phone || !newAddress.postalCode) {
         toast.error('Tüm adres alanlarını doldurun')
         return
      }
      try {
         const res = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newAddress, csrfToken }),
         })
         if (!res.ok) throw new Error()
         const created = await res.json()
         setAddresses((prev) => [...prev, created])
         setSelectedAddress(created.id)
         setShowNewAddress(false)
         setNewAddress({ address: '', city: '', phone: '', postalCode: '' })
         toast.success('Adres eklendi')
      } catch {
         toast.error('Adres eklenirken hata oluştu')
      }
   }, [newAddress])

   const handleOrder = useCallback(async () => {
      if (!selectedAddress) {
         toast.error('Lütfen bir teslimat adresi seçin')
         return
      }
      if (!cart?.items?.length) {
         toast.error('Sepetiniz boş')
         return
      }

      setLoading(true)
      try {
         const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               addressId: selectedAddress,
               ...(discountCode && { discountCode }),
               csrfToken,
            }),
         })

         if (!res.ok) {
            const text = await res.text()
            throw new Error(text)
         }

         const order = await res.json()
         await refreshCart()
         toast.success(`Sipariş #${order.number} başarıyla oluşturuldu!`)
         router.push(`/profile/orders/${order.id}`)
      } catch (err: any) {
         toast.error(err.message || 'Sipariş oluşturulamadı')
      } finally {
         setLoading(false)
      }
   }, [selectedAddress, discountCode, cart, refreshCart, router])

   return (
      <div className="flex flex-col border-neutral-200 dark:border-neutral-700 pb-24">
         <Heading
            title="Siparişi Tamamla"
            description="Teslimat adresinizi seçin ve siparişinizi onaylayın."
         />
         <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
               {/* Teslimat Adresi */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <MapPin className="text-primary h-5 w-5" />
                        Teslimat Adresi
                     </CardTitle>
                     <CardDescription>Siparişinizin gönderileceği adresi seçin.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     {loadingAddresses ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                           <Loader2 className="h-4 w-4 animate-spin" />
                           Adresler yükleniyor...
                        </div>
                     ) : addresses.length === 0 && !showNewAddress ? (
                        <p className="text-muted-foreground text-sm">
                           Kayıtlı adresiniz yok. Yeni bir adres ekleyin.
                        </p>
                     ) : (
                        addresses.map((addr) => (
                           <div
                              key={addr.id}
                              onClick={() => setSelectedAddress(addr.id)}
                              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                                 selectedAddress === addr.id
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:border-muted-foreground/30'
                              }`}
                           >
                              <p className="font-medium">{addr.address}</p>
                              <p className="text-sm text-muted-foreground">
                                 {addr.city} - {addr.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">{addr.phone}</p>
                           </div>
                        ))
                     )}

                     {showNewAddress ? (
                        <div className="space-y-3 rounded-lg border p-4">
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <Label>Şehir</Label>
                                 <Input
                                    placeholder="İstanbul"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                                 />
                              </div>
                              <div>
                                 <Label>Posta Kodu</Label>
                                 <Input
                                    placeholder="34000"
                                    value={newAddress.postalCode}
                                    onChange={(e) => setNewAddress((p) => ({ ...p, postalCode: e.target.value }))}
                                 />
                              </div>
                           </div>
                           <div>
                              <Label>Adres</Label>
                              <Input
                                 placeholder="Mahalle, Sokak, Bina No, Daire No"
                                 value={newAddress.address}
                                 onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
                              />
                           </div>
                           <div>
                              <Label>Telefon</Label>
                              <Input
                                 placeholder="05XX XXX XX XX"
                                 value={newAddress.phone}
                                 onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))}
                              />
                           </div>
                           <div className="flex gap-2">
                              <Button onClick={handleNewAddress} size="sm">Kaydet</Button>
                              <Button variant="outline" size="sm" onClick={() => setShowNewAddress(false)}>İptal</Button>
                           </div>
                        </div>
                     ) : (
                        <Button variant="outline" size="sm" onClick={() => setShowNewAddress(true)}>
                           <Plus className="h-4 w-4 mr-1" /> Yeni Adres Ekle
                        </Button>
                     )}
                  </CardContent>
               </Card>

               {/* İndirim Kodu */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <CheckCircle2Icon className="text-primary h-5 w-5" />
                        İndirim Kodu
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="flex gap-2">
                        <Input
                           placeholder="İndirim kodunuz varsa girin"
                           value={discountCode}
                           onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        />
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Sipariş Özeti */}
            <div className="lg:col-span-1">
               <Card className="sticky top-24">
                  <CardHeader className="pb-4">
                     <CardTitle>Sipariş Özeti</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                     <div className="space-y-3">
                        {cart?.items?.map((item, i) => (
                           <div key={i} className="flex justify-between items-center gap-4">
                              <span className="truncate">{item.count}x {item.product.title}</span>
                              <span className="font-semibold whitespace-nowrap">
                                 {(item.product.price * item.count).toFixed(2)} ₺
                              </span>
                           </div>
                        ))}
                     </div>
                     <Separator className="my-4" />
                     <div className="space-y-2 text-muted-foreground">
                        <div className="flex justify-between">
                           <span>Toplam</span>
                           <span>{costs.total} ₺</span>
                        </div>
                        <div className="flex justify-between">
                           <span>İndirim</span>
                           <span>-{costs.discount} ₺</span>
                        </div>
                        <div className="flex justify-between">
                           <span>KDV (%9)</span>
                           <span>{costs.tax} ₺</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Kargo</span>
                           <span className="text-green-600">Ücretsiz</span>
                        </div>
                     </div>
                     <Separator className="my-4" />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Toplam</span>
                        <span>{costs.payable} ₺</span>
                     </div>
                  </CardContent>
                  <CardFooter>
                     <Button
                        className="w-full"
                        size="lg"
                        onClick={handleOrder}
                        disabled={loading || !selectedAddress || !cart?.items?.length}
                     >
                        {loading ? (
                           <><Loader2 className="h-4 w-4 animate-spin mr-2" /> İşleniyor...</>
                        ) : (
                           'Siparişi Onayla'
                        )}
                     </Button>
                  </CardFooter>
               </Card>
            </div>
         </div>
      </div>
   )
}
