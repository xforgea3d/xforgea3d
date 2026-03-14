'use client'

import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCsrf } from '@/hooks/useCsrf'
import { useCartContext } from '@/state/Cart'
import { CheckCircle2Icon, ChevronRightIcon, Loader2, MapPin, Plus, Tag, Truck, XCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface Address {
   id: string
   address: string
   city: string
   phone: string
   postalCode: string
}

interface DiscountInfo {
   valid: boolean
   percent: number
   discountAmount: number
}

function getEstimatedDeliveryRange(): string {
   const today = new Date()
   let minDays = 0
   let maxDays = 0
   let d = new Date(today)
   // Calculate 3 business days for min
   while (minDays < 3) {
      d.setDate(d.getDate() + 1)
      const day = d.getDay()
      if (day !== 0 && day !== 6) minDays++
   }
   const minDate = new Date(d)
   // Continue to 5 business days for max
   while (maxDays < 2) {
      d.setDate(d.getDate() + 1)
      const day = d.getDay()
      if (day !== 0 && day !== 6) maxDays++
   }
   const maxDate = new Date(d)
   const fmt = (date: Date) =>
      date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
   return `${fmt(minDate)} - ${fmt(maxDate)}`
}

export default function CheckoutPage() {
   const router = useRouter()
   const csrfToken = useCsrf()
   const { cart, refreshCart } = useCartContext()

   const [addresses, setAddresses] = useState<Address[]>([])
   const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
   const [discountCode, setDiscountCode] = useState('')
   const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null)
   const [discountError, setDiscountError] = useState<string | null>(null)
   const [validatingDiscount, setValidatingDiscount] = useState(false)
   const [loading, setLoading] = useState(false)
   const [loadingAddresses, setLoadingAddresses] = useState(true)
   const [showNewAddress, setShowNewAddress] = useState(false)
   const [newAddress, setNewAddress] = useState({ address: '', city: '', phone: '', postalCode: '' })
   const [taxRate, setTaxRate] = useState(20)
   const searchParams = useSearchParams()
   const discountAppliedFromUrl = useRef(false)

   // Task 3: Auto-fill discount code from URL param
   useEffect(() => {
      const urlDiscount = searchParams.get('discount')
      if (urlDiscount && !discountAppliedFromUrl.current) {
         discountAppliedFromUrl.current = true
         setDiscountCode(urlDiscount.toUpperCase())
      }
   }, [searchParams])

   useEffect(() => {
      fetch('/api/maintenance-status')
         .then((r) => r.json())
         .then((data) => {
            if (data.tax_rate != null) setTaxRate(data.tax_rate)
         })
         .catch(() => {})
   }, [])

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

   // Task 3: Auto-validate discount code from URL after it's been set
   useEffect(() => {
      const urlDiscount = searchParams.get('discount')
      if (urlDiscount && discountCode === urlDiscount.toUpperCase() && !discountInfo && !validatingDiscount && !discountError) {
         handleValidateDiscount()
      }
   }, [discountCode, searchParams])

   const costs = useMemo(() => {
      let total = 0, productDiscount = 0
      if (cart?.items) {
         for (const item of cart.items) {
            total += item.count * item.product.price
            productDiscount += item.count * item.product.discount
         }
      }
      const couponDiscount = discountInfo?.discountAmount ?? 0
      const totalDiscount = productDiscount + couponDiscount
      const afterDiscount = Math.max(total - totalDiscount, 0)
      const tax = afterDiscount * (taxRate / 100)
      const payable = afterDiscount + tax
      return {
         total: total.toFixed(2),
         productDiscount: productDiscount.toFixed(2),
         couponDiscount: couponDiscount.toFixed(2),
         tax: tax.toFixed(2),
         payable: payable.toFixed(2),
      }
   }, [cart?.items, taxRate, discountInfo])

   const handleValidateDiscount = useCallback(async () => {
      if (!discountCode.trim()) {
         setDiscountError('Lütfen bir indirim kodu girin')
         return
      }

      setValidatingDiscount(true)
      setDiscountError(null)
      setDiscountInfo(null)

      try {
         const res = await fetch('/api/discount-validate', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(csrfToken && { 'x-csrf-token': csrfToken }),
            },
            body: JSON.stringify({ code: discountCode.trim(), csrfToken }),
         })
         if (!res.ok) { setDiscountError('Doğrulama başarısız'); setValidatingDiscount(false); return; }
         const data = await res.json()

         if (data.valid) {
            setDiscountInfo(data)
            setDiscountError(null)
            toast.success('Kod uygulandı!')
         } else {
            setDiscountInfo(null)
            setDiscountError(data.error || 'Geçersiz indirim kodu')
         }
      } catch {
         setDiscountError('Kod doğrulanırken hata oluştu')
      } finally {
         setValidatingDiscount(false)
      }
   }, [discountCode])

   const handleClearDiscount = useCallback(() => {
      setDiscountCode('')
      setDiscountInfo(null)
      setDiscountError(null)
   }, [])

   const handleNewAddress = useCallback(async () => {
      if (!newAddress.address || !newAddress.city || !newAddress.phone || !newAddress.postalCode) {
         toast.error('Tüm adres alanlarını doldurun')
         return
      }
      if (!csrfToken) {
         toast.error('Sayfa yükleniyor, lütfen birkaç saniye bekleyin.')
         return
      }
      try {
         const res = await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
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
            headers: { 'Content-Type': 'application/json', ...(csrfToken && { 'x-csrf-token': csrfToken }) },
            body: JSON.stringify({
               addressId: selectedAddress,
               ...(discountCode && discountInfo?.valid && { discountCode }),
               csrfToken,
            }),
         })

         if (!res.ok) {
            const text = await res.text()
            throw new Error(text)
         }

         const order = await res.json()
         await refreshCart()
         toast.success('Ödeme sayfasına yönlendiriliyorsunuz...')
         router.push(`/payment/${order.id}`)
      } catch (err: any) {
         const msg = err.message || ''
         // Parse specific error messages from API and show user-friendly Turkish messages
         if (msg.includes('indirim kodu') || msg.includes('INVALID_DISCOUNT')) {
            toast.error('Geçersiz veya süresi dolmuş indirim kodu')
            setDiscountError('Geçersiz veya süresi dolmuş indirim kodu')
            setDiscountInfo(null)
         } else if (msg.includes('Sepet bos') || msg.includes('EMPTY_CART')) {
            toast.error('Sepetiniz boş')
         } else if (msg.includes('mevcut degil')) {
            toast.error(msg)
         } else if (msg.includes('stok yok')) {
            toast.error(msg)
         } else if (msg.includes('Siparis tutari')) {
            toast.error('Sipariş tutarı geçersiz. İndirim kodunu kontrol edin.')
         } else {
            toast.error(msg || 'Sipariş oluşturulamadı')
         }
         // DO NOT call refreshCart() on error — this prevents the cart from being cleared
         // when the order fails (e.g., invalid discount code)
      } finally {
         setLoading(false)
      }
   }, [selectedAddress, discountCode, discountInfo, cart, refreshCart, router])

   return (
      <div className="flex flex-col border-neutral-200 dark:border-neutral-700 pb-24">
         <nav className="flex text-muted-foreground mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-2">
               <li className="inline-flex items-center">
                  <Link className="text-sm font-medium hover:text-foreground transition-colors" href="/">
                     Ana Sayfa
                  </Link>
               </li>
               <li>
                  <div className="flex items-center gap-2">
                     <ChevronRightIcon className="h-4" />
                     <Link className="text-sm font-medium hover:text-foreground transition-colors" href="/cart">
                        Sepet
                     </Link>
                  </div>
               </li>
               <li aria-current="page">
                  <div className="flex items-center gap-2">
                     <ChevronRightIcon className="h-4" />
                     <span className="text-sm font-medium text-foreground">Siparisi Tamamla</span>
                  </div>
               </li>
            </ol>
         </nav>
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
                        <Tag className="text-primary h-5 w-5" />
                        İndirim Kodu
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     {discountInfo?.valid ? (
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-3">
                           <CheckCircle2Icon className="h-5 w-5 text-green-600 flex-shrink-0" />
                           <div className="flex-1">
                              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                 Kod uygulandı! %{discountInfo.percent} indirim
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-500">
                                 {discountInfo.discountAmount.toFixed(2)} TL indirim uygulanacak
                              </p>
                           </div>
                           <Button variant="ghost" size="sm" onClick={handleClearDiscount} className="text-green-700 hover:text-red-600">
                              <XCircle className="h-4 w-4" />
                           </Button>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           <div className="flex gap-2">
                              <Input
                                 placeholder="İndirim kodunuz varsa girin"
                                 value={discountCode}
                                 onChange={(e) => {
                                    setDiscountCode(e.target.value.toUpperCase())
                                    setDiscountError(null)
                                 }}
                                 onKeyDown={(e) => e.key === 'Enter' && handleValidateDiscount()}
                                 className={discountError ? 'border-red-400' : ''}
                              />
                              <Button
                                 variant="outline"
                                 onClick={handleValidateDiscount}
                                 disabled={validatingDiscount || !discountCode.trim()}
                              >
                                 {validatingDiscount ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                 ) : (
                                    'Kodu Uygula'
                                 )}
                              </Button>
                           </div>
                           {discountError && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                 <XCircle className="h-3.5 w-3.5" />
                                 {discountError}
                              </p>
                           )}
                        </div>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* Sipariş Özeti */}
            <div className="lg:col-span-1">
               <Card className="sticky top-24">
                  <CardHeader className="pb-4">
                     <CardTitle>Sipariş Özeti</CardTitle>
                     <CardDescription>{cart?.items?.length ?? 0} ürün</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                     {/* Item list with thumbnails */}
                     <div className="space-y-3">
                        {cart?.items?.map((item: any, i: number) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                 {item.product.images?.[0] ? (
                                    <Image
                                       src={item.product.images[0]}
                                       alt={item.product.title}
                                       fill
                                       className="object-cover"
                                       sizes="48px"
                                    />
                                 ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">--</div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="truncate font-medium text-sm">{item.product.title}</p>
                                 <p className="text-xs text-muted-foreground">
                                    {item.count} x {item.product.price.toFixed(2)} TL
                                 </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                 <p className="font-semibold text-sm">
                                    {(item.product.price * item.count).toFixed(2)} TL
                                 </p>
                                 {item.product.discount > 0 && (
                                    <p className="text-xs text-green-600">
                                       -{(item.product.discount * item.count).toFixed(2)} TL
                                    </p>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>

                     <Separator className="my-4" />

                     {/* Cost breakdown */}
                     <div className="space-y-2.5 text-muted-foreground">
                        <div className="flex justify-between">
                           <span>Ara Toplam</span>
                           <span>{costs.total} TL</span>
                        </div>
                        {parseFloat(costs.productDiscount) > 0 && (
                           <div className="flex justify-between text-green-600">
                              <span>Ürün İndirimi</span>
                              <span>-{costs.productDiscount} TL</span>
                           </div>
                        )}
                        {discountInfo?.valid && parseFloat(costs.couponDiscount) > 0 && (
                           <div className="flex justify-between text-green-600">
                              <span className="flex items-center gap-1">
                                 <Tag className="h-3 w-3" />
                                 Kupon ({discountCode})
                              </span>
                              <span>-{costs.couponDiscount} TL</span>
                           </div>
                        )}
                        <div className="flex justify-between">
                           <span>KDV (%{taxRate})</span>
                           <span>{costs.tax} TL</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Kargo</span>
                           <span className="text-green-600 font-medium">Ücretsiz</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-3 py-2 mt-1">
                           <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                           <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              Tahmini Teslimat: {getEstimatedDeliveryRange()}
                           </span>
                        </div>
                     </div>

                     <Separator className="my-4" />

                     <div className="flex justify-between font-bold text-lg">
                        <span>Toplam</span>
                        <span>{costs.payable} TL</span>
                     </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                     <p className="text-xs text-muted-foreground text-center w-full">
                        🛡️ 14 Gün İade Garantisi | 🔒 Güvenli Ödeme
                     </p>
                     <Button
                        className="w-full"
                        size="lg"
                        onClick={handleOrder}
                        disabled={loading || !selectedAddress || !cart?.items?.length}
                     >
                        {loading ? (
                           <><Loader2 className="h-4 w-4 animate-spin mr-2" /> İşleniyor...</>
                        ) : (
                           'Siparişi Onayla ve Öde'
                        )}
                     </Button>
                  </CardFooter>
               </Card>
            </div>
         </div>
      </div>
   )
}
