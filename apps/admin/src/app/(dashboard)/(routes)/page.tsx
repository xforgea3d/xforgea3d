export const revalidate = 0

import { getGraphRevenue } from '@/actions/get-graph-revenue'
import { getSalesCount } from '@/actions/get-sales-count'
import { getStockCount } from '@/actions/get-stock-count'
import { getTotalRevenue } from '@/actions/get-total-revenue'
import { Overview } from '@/components/overview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { formatter } from '@/lib/utils'
import prisma from '@/lib/prisma'
import {
   Activity, AlertTriangle, CheckCircle2, ClipboardList, CreditCard,
   Database, FileText, Package, PlusCircle, ShoppingCart, TrendingUp,
   Users, XCircle, Lightbulb, Camera, Archive, Target, Tag, Image as ImageIcon, Clock,
} from 'lucide-react'
import Link from 'next/link'

async function getSystemHealth() {
   try {
      const start = Date.now()
      const [
         errorCount,
         pendingOrders,
         pendingQuotes,
         pendingReturns,
         totalUsers,
         totalProducts,
         totalOrders,
         lowStockProducts,
      ] = await Promise.all([
         prisma.error.count({ where: { resolved: false, severity: { in: ['critical', 'high'] } } }),
         prisma.order.count({ where: { status: 'OnayBekleniyor', isPaid: true } }),
         prisma.quoteRequest.count({ where: { status: 'Pending' } }),
         prisma.returnRequest.count({ where: { status: 'Pending' } }),
         prisma.profile.count({ where: { role: 'customer' } }),
         prisma.product.count({ where: { id: { not: 'quote-request-product' } } }),
         prisma.order.count(),
         prisma.product.count({ where: { stock: { lte: 5 }, isAvailable: true, id: { not: 'quote-request-product' } } }),
      ])
      const dbLatency = Date.now() - start

      return {
         dbLatency,
         errorCount,
         pendingOrders,
         pendingQuotes,
         pendingReturns,
         totalUsers,
         totalProducts,
         totalOrders,
         lowStockProducts,
         dbStatus: dbLatency < 3000 ? 'healthy' : dbLatency < 5000 ? 'slow' : 'critical',
      }
   } catch {
      return {
         dbLatency: -1,
         errorCount: -1,
         pendingOrders: 0,
         pendingQuotes: 0,
         pendingReturns: 0,
         totalUsers: 0,
         totalProducts: 0,
         totalOrders: 0,
         lowStockProducts: 0,
         dbStatus: 'down' as const,
      }
   }
}

async function getGuidanceTips() {
   try {
      const [
         productsWithoutImages,
         productsWithLowStock,
         campaignsWithoutProducts,
         campaignsWithoutDiscount,
         noBanners,
         pendingQuotes,
      ] = await Promise.all([
         prisma.product.count({ where: { images: { isEmpty: true }, id: { not: 'quote-request-product' } } }),
         prisma.product.count({ where: { stock: { lte: 3 }, isAvailable: true, id: { not: 'quote-request-product' } } }),
         prisma.campaign.count({ where: { isActive: true, products: { none: {} } } }),
         prisma.campaign.count({ where: { isActive: true, discountCodeId: null } }),
         prisma.banner.count(),
         prisma.quoteRequest.count({ where: { status: 'Pending' } }),
      ])

      return {
         productsWithoutImages,
         productsWithLowStock,
         campaignsWithoutProducts,
         campaignsWithoutDiscount,
         noBanners,
         pendingQuotes,
      }
   } catch {
      return {
         productsWithoutImages: 0,
         productsWithLowStock: 0,
         campaignsWithoutProducts: 0,
         campaignsWithoutDiscount: 0,
         noBanners: 0,
         pendingQuotes: 0,
      }
   }
}

export default async function DashboardPage() {
   const [totalRevenue, graphRevenue, salesCount, stockCount, health, tips] = await Promise.all([
      getTotalRevenue(),
      getGraphRevenue(),
      getSalesCount(),
      getStockCount(),
      getSystemHealth(),
      getGuidanceTips(),
   ])

   const statusColor = {
      healthy: 'text-emerald-500',
      slow: 'text-yellow-500',
      critical: 'text-red-500',
      down: 'text-red-500',
   }
   const statusText = {
      healthy: 'Saglikli',
      slow: 'Yavas',
      critical: 'Kritik',
      down: 'Baglanti Yok',
   }

   const guidanceItems: {
      show: boolean
      icon: React.ReactNode
      text: string
      borderColor: string
      bgColor: string
      textColor: string
      link: string
      linkText: string
   }[] = [
      {
         show: tips.productsWithoutImages > 0,
         icon: <Camera className="h-4 w-4 text-orange-500 flex-shrink-0" />,
         text: `${tips.productsWithoutImages} urunun gorseli eksik. Gorselsiz urunler %40 daha az satilir.`,
         borderColor: 'border-l-orange-500',
         bgColor: 'bg-orange-50 dark:bg-orange-950/20',
         textColor: 'text-orange-800 dark:text-orange-300',
         link: '/products',
         linkText: 'Urunleri Gor',
      },
      {
         show: tips.productsWithLowStock > 0,
         icon: <Archive className="h-4 w-4 text-orange-500 flex-shrink-0" />,
         text: `${tips.productsWithLowStock} urunun stogu 3'un altinda. Stok guncellemesi yapin.`,
         borderColor: 'border-l-orange-500',
         bgColor: 'bg-orange-50 dark:bg-orange-950/20',
         textColor: 'text-orange-800 dark:text-orange-300',
         link: '/products',
         linkText: 'Urunleri Gor',
      },
      {
         show: tips.campaignsWithoutProducts > 0,
         icon: <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />,
         text: `${tips.campaignsWithoutProducts} aktif kampanyaya urun eklenmemis. Kampanyalara urun baglayarak donusumu artirin.`,
         borderColor: 'border-l-blue-500',
         bgColor: 'bg-blue-50 dark:bg-blue-950/20',
         textColor: 'text-blue-800 dark:text-blue-300',
         link: '/campaigns',
         linkText: 'Kampanyalara Git',
      },
      {
         show: tips.campaignsWithoutDiscount > 0,
         icon: <Tag className="h-4 w-4 text-blue-500 flex-shrink-0" />,
         text: `${tips.campaignsWithoutDiscount} kampanyada kupon kodu yok. Kupon kodu baglayarak musteri sadakati olusturun.`,
         borderColor: 'border-l-blue-500',
         bgColor: 'bg-blue-50 dark:bg-blue-950/20',
         textColor: 'text-blue-800 dark:text-blue-300',
         link: '/campaigns',
         linkText: 'Kampanyalara Git',
      },
      {
         show: tips.noBanners === 0,
         icon: <ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />,
         text: 'Henuz banner eklenmemis. Ana sayfada dikkat cekici bannerlar satisi %25 artirir.',
         borderColor: 'border-l-blue-500',
         bgColor: 'bg-blue-50 dark:bg-blue-950/20',
         textColor: 'text-blue-800 dark:text-blue-300',
         link: '/banners',
         linkText: 'Banner Ekle',
      },
      {
         show: tips.pendingQuotes > 0,
         icon: <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />,
         text: `${tips.pendingQuotes} parca talebi yanit bekliyor. Hizli yanit musteri memnuniyetini artirir.`,
         borderColor: 'border-l-orange-500',
         bgColor: 'bg-orange-50 dark:bg-orange-950/20',
         textColor: 'text-orange-800 dark:text-orange-300',
         link: '/quote-requests',
         linkText: 'Talepleri Gor',
      },
   ]

   const visibleGuidance = guidanceItems.filter((item) => item.show)

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 pt-4">
            <Heading title="Kontrol Paneli" description="Magaza genel bakisi" />
            <Separator />

            {/* Revenue + Sales + Stock */}
            <div className="grid gap-4 grid-cols-3">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                     <TrendingUp className="h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Satislar</CardTitle>
                     <CreditCard className="h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">+{salesCount}</div>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Stokta Urun</CardTitle>
                     <Package className="h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{stockCount}</div>
                  </CardContent>
               </Card>
            </div>

            {/* System Health Card */}
            <Card>
               <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                     <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Sistem Sagligi
                     </CardTitle>
                     <div className={`flex items-center gap-1.5 text-sm font-semibold ${statusColor[health.dbStatus]}`}>
                        {health.dbStatus === 'healthy' ? (
                           <CheckCircle2 className="h-4 w-4" />
                        ) : health.dbStatus === 'down' ? (
                           <XCircle className="h-4 w-4" />
                        ) : (
                           <AlertTriangle className="h-4 w-4" />
                        )}
                        {statusText[health.dbStatus]}
                     </div>
                  </div>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {/* DB Latency */}
                     <div className="rounded-lg border p-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <Database className="h-3.5 w-3.5" />
                           Veritabani
                        </div>
                        <div className={`text-lg font-bold ${health.dbLatency < 1000 ? 'text-emerald-500' : health.dbLatency < 3000 ? 'text-yellow-500' : 'text-red-500'}`}>
                           {health.dbLatency > 0 ? `${health.dbLatency}ms` : 'Baglanti Yok'}
                        </div>
                     </div>

                     {/* Error Count */}
                     <div className="rounded-lg border p-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <AlertTriangle className="h-3.5 w-3.5" />
                           Hatalar
                        </div>
                        <div className={`text-lg font-bold ${health.errorCount === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                           {health.errorCount >= 0 ? health.errorCount : '?'}
                        </div>
                        {health.errorCount > 0 && (
                           <Link href="/error-logs" className="text-xs text-red-500 hover:underline">
                              Incele
                           </Link>
                        )}
                     </div>

                     {/* Total Users */}
                     <div className="rounded-lg border p-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <Users className="h-3.5 w-3.5" />
                           Kullanicilar
                        </div>
                        <div className="text-lg font-bold">{health.totalUsers}</div>
                     </div>

                     {/* Low Stock */}
                     <div className="rounded-lg border p-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <Package className="h-3.5 w-3.5" />
                           Dusuk Stok
                        </div>
                        <div className={`text-lg font-bold ${health.lowStockProducts === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                           {health.lowStockProducts}
                        </div>
                        {health.lowStockProducts > 0 && (
                           <Link href="/products" className="text-xs text-orange-500 hover:underline">
                              Urunleri gor
                           </Link>
                        )}
                     </div>
                  </div>

                  {/* Pending Actions */}
                  {(health.pendingOrders > 0 || health.pendingQuotes > 0 || health.pendingReturns > 0) && (
                     <div className="mt-4 flex flex-wrap gap-2">
                        {health.pendingOrders > 0 && (
                           <Link href="/orders">
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                                 <ShoppingCart className="h-3 w-3" />
                                 {health.pendingOrders} bekleyen siparis
                              </div>
                           </Link>
                        )}
                        {health.pendingQuotes > 0 && (
                           <Link href="/quote-requests">
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-400">
                                 <ClipboardList className="h-3 w-3" />
                                 {health.pendingQuotes} bekleyen talep
                              </div>
                           </Link>
                        )}
                        {health.pendingReturns > 0 && (
                           <Link href="/returns">
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-400">
                                 <Package className="h-3 w-3" />
                                 {health.pendingReturns} bekleyen iade
                              </div>
                           </Link>
                        )}
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Guidance Tips Card */}
            <Card>
               <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                     <Lightbulb className="h-5 w-5 text-amber-500" />
                     Yapilacaklar ve Oneriler
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  {visibleGuidance.map((item, i) => (
                     <div
                        key={i}
                        className={`flex items-start gap-3 rounded-lg border-l-4 ${item.borderColor} ${item.bgColor} p-3`}
                     >
                        {item.icon}
                        <div className="flex-1 min-w-0">
                           <p className={`text-sm ${item.textColor}`}>{item.text}</p>
                        </div>
                        <Link
                           href={item.link}
                           className={`text-xs font-semibold whitespace-nowrap ${item.textColor} hover:underline flex-shrink-0`}
                        >
                           {item.linkText} &rarr;
                        </Link>
                     </div>
                  ))}

                  {/* General tip - always shown */}
                  <div className="flex items-start gap-3 rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                     <Lightbulb className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                     <div className="flex-1 min-w-0">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                           Duzenli blog yazilari SEO&apos;nuzu guclendirir ve organik trafigi artirir.
                        </p>
                     </div>
                     <Link
                        href="/content/blog/new"
                        className="text-xs font-semibold whitespace-nowrap text-emerald-800 dark:text-emerald-300 hover:underline flex-shrink-0"
                     >
                        Blog Yaz &rarr;
                     </Link>
                  </div>

                  {visibleGuidance.length === 0 && (
                     <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Harika! Tum onemli aksiyonlar tamamlanmis gorunuyor.
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="col-span-4">
               <CardHeader>
                  <CardTitle>Genel Bakis</CardTitle>
               </CardHeader>
               <CardContent className="pl-2">
                  <Overview data={graphRevenue} />
               </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
               <CardHeader>
                  <CardTitle>Hizli Islemler</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                     <Link href="/products/new">
                        <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                           <PlusCircle className="h-5 w-5" />
                           <span className="text-sm">Yeni Urun Ekle</span>
                        </Button>
                     </Link>
                     <Link href="/orders">
                        <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                           <ShoppingCart className="h-5 w-5" />
                           <span className="text-sm">Siparisleri Gor</span>
                        </Button>
                     </Link>
                     <Link href="/quote-requests">
                        <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                           <ClipboardList className="h-5 w-5" />
                           <span className="text-sm">Bekleyen Talepler</span>
                        </Button>
                     </Link>
                     <Link href="/content/blog/new">
                        <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                           <FileText className="h-5 w-5" />
                           <span className="text-sm">Blog Yazisi Ekle</span>
                        </Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   )
}
