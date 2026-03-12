export const revalidate = 0
import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
   Card,
   CardContent,
   CardFooter,
} from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { ExternalLinkIcon, WrenchIcon } from 'lucide-react'
import Link from 'next/link'

import { OrderForm } from './components/order-form'

// Turkish labels for order statuses
const STATUS_LABELS: Record<string, string> = {
   OnayBekleniyor: 'Onay Bekleniyor',
   Uretimde: 'Üretimde',
   Processing: 'İşlemde',
   Shipped: 'Kargoya Verildi',
   Delivered: 'Teslim Edildi',
   ReturnProcessing: 'İade İşlemde',
   ReturnCompleted: 'İade Tamamlandı',
   Cancelled: 'İptal Edildi',
   RefundProcessing: 'Para İadesi İşlemde',
   RefundCompleted: 'Para İadesi Tamamlandı',
   Denied: 'Reddedildi',
}

const ProductPage = async ({ params }: { params: { orderId: string } }) => {
   const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
         address: true,
         discountCode: true,
         user: {
            include: {
               addresses: true,
               payments: true,
               orders: true,
            },
         },
         payments: { include: { provider: true } },
         orderItems: { include: { product: true } },
         refund: true,
      },
   })

   // Custom order items
   const customItems = order?.orderItems?.filter((item) => (item as any).isCustom) ?? []

   return (
      <div className="flex-col">
         <div className="flex-1 pt-6 pb-12 space-y-4">
            <div className="flex items-center justify-between">
               <Heading
                  title={`Sipariş #${order?.number}`}
                  description="Sipariş detayları ve müşteri bilgileri."
               />
               <Badge variant={order?.isPaid ? 'default' : 'destructive'} className="text-xs">
                  {order?.isPaid ? 'Ödendi' : 'Ödenmedi'}
               </Badge>
            </div>

            {/* Custom items card */}
            {customItems.length > 0 && (
               <Card className="border-dashed border-orange-400/50 bg-orange-50/30 dark:bg-orange-950/10">
                  <CardContent className="pt-5">
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="custom">
                           <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                 <WrenchIcon className="h-4 w-4 text-orange-500" />
                                 <span className="font-bold tracking-wide">
                                    KİŞİSELLEŞTİRME DETAYLARI
                                 </span>
                                 <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                                    {customItems.length} Ürün
                                 </Badge>
                              </div>
                           </AccordionTrigger>
                           <AccordionContent>
                              <div className="space-y-4 mt-2">
                                 {customItems.map((item) => {
                                    const snapshot = (item as any).customSnapshot as Record<string, any> | null
                                    return (
                                       <div key={(item as any).id ?? item.productId} className="rounded-lg border p-4 space-y-3">
                                          <div className="flex items-center justify-between">
                                             <p className="font-semibold text-sm">{item.product?.title}</p>
                                             <Badge className="text-xs bg-foreground text-background">
                                                KİŞİYE ÖZEL
                                             </Badge>
                                          </div>
                                          <Separator />
                                          <div className="grid grid-cols-2 gap-3 text-sm">
                                             {snapshot?.text && (
                                                <div>
                                                   <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Özel Metin</p>
                                                   <p className="font-medium">{snapshot.text}</p>
                                                </div>
                                             )}
                                             {snapshot?.color && (
                                                <div>
                                                   <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Seçilen Renk</p>
                                                   <div className="flex items-center gap-2">
                                                      <span
                                                         className="h-5 w-5 rounded-full border inline-block"
                                                         style={{ backgroundColor: snapshot.color.hex }}
                                                      />
                                                      <span className="font-medium">{snapshot.color.label}</span>
                                                   </div>
                                                </div>
                                             )}
                                             {snapshot?.size && (
                                                <div>
                                                   <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Seçilen Boyut</p>
                                                   <p className="font-medium">{snapshot.size.label}</p>
                                                </div>
                                             )}
                                             {snapshot?.fileUrl && (
                                                <div>
                                                   <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Yüklenen Dosya</p>
                                                   <a
                                                      href={snapshot.fileUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-1 text-sm font-medium underline underline-offset-4 text-blue-600 dark:text-blue-400"
                                                   >
                                                      Dosyayı Görüntüle
                                                      <ExternalLinkIcon className="h-3 w-3" />
                                                   </a>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })}
                              </div>
                           </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                  </CardContent>
               </Card>
            )}

            {/* User card */}
            <Card className="bg-muted-foreground/5">
               <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                     <AccordionItem value="user">
                        <AccordionTrigger>
                           <div className="block text-left">
                              <h2 className="text-lg font-bold tracking-wider">MÜŞTERİ</h2>
                              <p className="text-sm font-light text-foreground/70">Bu siparişe ait müşteri bilgileri.</p>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="block space-y-4">
                              {[
                                 ['Ad Soyad', order?.user?.name],
                                 ['E-posta', order?.user?.email],
                                 ['Telefon', order?.user?.phone],
                              ].map(([label, value]) => (
                                 <div key={label} className="grid w-full items-center">
                                    <h3>{label}</h3>
                                    <p className="text-muted-foreground">{value ?? '—'}</p>
                                 </div>
                              ))}
                           </div>
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
               </CardContent>
               <CardFooter>
                  <Link
                     href={`/users/${order?.user?.id}`}
                     className="text-sm underline text-muted-foreground transition-colors hover:text-primary"
                  >
                     Kullanıcı profilini görüntüle →
                  </Link>
               </CardFooter>
            </Card>

            {/* Edit order card */}
            <Card>
               <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                     <AccordionItem value="edit">
                        <AccordionTrigger>
                           <div className="block text-left">
                              <h2 className="text-lg font-bold tracking-wider">SİPARİŞİ DÜZENLE</h2>
                              <p className="text-sm font-light text-foreground/70">
                                 Mevcut durum:{' '}
                                 <span className="font-semibold text-foreground">
                                    {STATUS_LABELS[order?.status as keyof typeof STATUS_LABELS] ?? order?.status}
                                 </span>
                              </p>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <OrderForm initialData={order} />
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
               </CardContent>
            </Card>
         </div>
      </div>
   )
}

export default ProductPage
