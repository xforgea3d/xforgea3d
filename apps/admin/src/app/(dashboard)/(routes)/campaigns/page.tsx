export const revalidate = 0

import prisma from '@/lib/prisma'
import Link from 'next/link'
import {
   Calendar,
   Clock,
   CheckCircle2,
   AlertCircle,
   Timer,
   Plus,
   ShoppingBag,
   DollarSign,
   Eye,
   MousePointer,
} from 'lucide-react'
import { CampaignCardActions } from './components/campaign-card-actions'

const STOREFRONT_URL = process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://xforgea3d.com'

// ── Suggested campaign templates (TR holidays for reference) ──
const SUGGESTED_CAMPAIGNS = [
   { id: 'yilbasi', name: 'Yeni Yil Indirimleri', emoji: '\uD83C\uDF84', months: 'Aralik-Ocak', discount: 20 },
   { id: 'sevgililer', name: 'Sevgililer Gunu', emoji: '\u2764\uFE0F', months: 'Subat', discount: 15 },
   { id: 'kadinlar', name: '8 Mart Kadinlar Gunu', emoji: '\uD83D\uDC90', months: 'Mart', discount: 10 },
   { id: 'ramazan', name: 'Ramazan Bayrami', emoji: '\uD83C\uDF19', months: 'Degisken', discount: 15 },
   { id: '23nisan', name: '23 Nisan Cocuk Bayrami', emoji: '\uD83C\uDF88', months: 'Nisan', discount: 15 },
   { id: 'anneler', name: 'Anneler Gunu', emoji: '\uD83C\uDF38', months: 'Mayis', discount: 15 },
   { id: 'kurban', name: 'Kurban Bayrami', emoji: '\uD83D\uDD4C', months: 'Degisken', discount: 15 },
   { id: 'babalar', name: 'Babalar Gunu', emoji: '\uD83D\uDC54', months: 'Haziran', discount: 15 },
   { id: 'yaz', name: 'Yaz Indirimleri', emoji: '\u2600\uFE0F', months: 'Temmuz-Agustos', discount: 25 },
   { id: 'okul', name: 'Okula Donus', emoji: '\uD83D\uDCDA', months: 'Eylul', discount: 10 },
   { id: '29ekim', name: '29 Ekim Cumhuriyet Bayrami', emoji: '\uD83C\uDDF9\uD83C\uDDF7', months: 'Ekim', discount: 29 },
   { id: 'blackfriday', name: 'Efsane Cuma / Kasim Indirimleri', emoji: '\uD83C\uDFF7\uFE0F', months: 'Kasim', discount: 40 },
]

function getCampaignStatus(startDate: Date, endDate: Date, isActive: boolean): 'aktif' | 'yaklasıyor' | 'planlandı' | 'bitti' {
   if (!isActive) return 'bitti'
   const now = new Date()
   if (now >= startDate && now <= endDate) return 'aktif'
   const daysUntil = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
   if (daysUntil > 0 && daysUntil <= 14) return 'yaklasıyor'
   if (now < startDate) return 'planlandı'
   return 'bitti'
}

function formatDateRange(start: Date, end: Date): string {
   const months = [
      'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
      'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik',
   ]
   return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`
}

export default async function CampaignsPage() {
   const campaigns = await prisma.campaign.findMany({
      include: {
         _count: { select: { products: true } },
         discountCode: { select: { code: true, percent: true } },
      },
      orderBy: [{ startDate: 'desc' }],
   })

   const withStatus = campaigns.map((c) => ({
      ...c,
      status: getCampaignStatus(c.startDate, c.endDate, c.isActive),
   }))

   // Sort: active first, then approaching, planned, ended
   const sortOrder = { 'aktif': 0, 'yaklasıyor': 1, 'planlandı': 2, 'bitti': 3 }
   withStatus.sort((a, b) => sortOrder[a.status] - sortOrder[b.status])

   const activeCampaigns = withStatus.filter((c) => c.status === 'aktif')
   const approachingCampaigns = withStatus.filter((c) => c.status === 'yaklasıyor')

   const statusConfig = {
      'aktif': {
         label: 'Aktif',
         className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
         icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      },
      'yaklasıyor': {
         label: 'Yaklasıyor',
         className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
         icon: <AlertCircle className="h-3.5 w-3.5" />,
      },
      'planlandı': {
         label: 'Planlandı',
         className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
         icon: <Clock className="h-3.5 w-3.5" />,
      },
      'bitti': {
         label: 'Bitti',
         className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
         icon: <Clock className="h-3.5 w-3.5" />,
      },
   }

   return (
      <div className="flex-1 space-y-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Kampanyalar</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Kampanya takvimi ve yonetimi - veritabanından
               </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  {new Date().toLocaleDateString('tr-TR', {
                     day: 'numeric',
                     month: 'long',
                     year: 'numeric',
                  })}
               </div>
               <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
               >
                  <Plus className="h-4 w-4" />
                  Yeni Kampanya
               </Link>
            </div>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Aktif
               </div>
               <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            </div>
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Timer className="h-4 w-4 text-amber-500" />
                  Yaklasan
               </div>
               <div className="text-2xl font-bold">{approachingCampaigns.length}</div>
            </div>
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                  Toplam Siparis
               </div>
               <div className="text-2xl font-bold">
                  {withStatus.reduce((sum, c) => sum + c.orders, 0)}
               </div>
            </div>
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Toplam Gelir
               </div>
               <div className="text-2xl font-bold">
                  {withStatus.reduce((sum, c) => sum + c.revenue, 0).toLocaleString('tr-TR')} TL
               </div>
            </div>
         </div>

         {/* Campaign Cards */}
         {withStatus.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
               <Calendar className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
               <h3 className="text-lg font-semibold mb-1">Henuz kampanya yok</h3>
               <p className="text-sm text-muted-foreground mb-4">
                  Ilk kampanyanizi olusturun veya asagidaki onerilerden birini kullanin.
               </p>
               <Link
                  href="/campaigns/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
               >
                  <Plus className="h-4 w-4" />
                  Yeni Kampanya
               </Link>
            </div>
         ) : (
            <div className="space-y-4">
               {withStatus.map((c) => {
                  const status = statusConfig[c.status]
                  return (
                     <div
                        key={c.id}
                        className={`group rounded-xl border transition-all hover:shadow-lg ${
                           c.status === 'aktif'
                              ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10'
                              : c.status === 'yaklasıyor'
                                ? 'border-amber-200 dark:border-amber-800/50'
                                : ''
                        }`}
                     >
                        <div className="flex flex-col md:flex-row">
                           {/* Left: campaign info */}
                           <Link href={`/campaigns/${c.id}`} className="flex-1 p-5">
                              <div className="flex items-start gap-4">
                                 <div
                                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ background: `linear-gradient(135deg, ${c.primaryColor}20, ${c.secondaryColor}20)` }}
                                 >
                                    {c.emoji}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                       <h3 className="font-semibold truncate group-hover:text-orange-500 transition-colors">{c.name}</h3>
                                       <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold flex-shrink-0 ${status.className}`}>
                                          {status.icon} {status.label}
                                       </span>
                                    </div>
                                    {c.description && <p className="text-sm text-muted-foreground truncate">{c.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                       <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateRange(c.startDate, c.endDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                       <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" />{c._count.products} ürün</span>
                                       <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{c.views} görüntülenme</span>
                                       <span className="flex items-center gap-1"><MousePointer className="h-3 w-3" />{c.clicks} tıklama</span>
                                       <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{c.orders} sipariş</span>
                                    </div>
                                    {c.discountCode && (
                                       <div className="mt-2">
                                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 text-[11px] font-medium">
                                             %{c.discountCode.percent} - {c.discountCode.code}
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </Link>

                           {/* Right: actions + warnings */}
                           <div className="flex flex-col justify-center gap-2 p-4 md:p-5 md:pl-0 md:border-l md:border-border/50 md:min-w-[180px]">
                              <CampaignCardActions campaignId={c.id} isActive={c.isActive} storefrontUrl={STOREFRONT_URL} />
                              {c._count.products === 0 && (
                                 <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-2 py-1">
                                    ⚠️ Ürün eklenmemiş
                                 </div>
                              )}
                              {!c.discountCode && (
                                 <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-md px-2 py-1">
                                    💡 Kupon kodu bağlayın
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         )}

         {/* Suggested Campaigns (TR Holidays) */}
         <div className="mt-8">
            <h2 className="text-lg font-semibold mb-1">Onerilen Kampanyalar</h2>
            <p className="text-sm text-muted-foreground mb-4">
               Turkiye tatil takvimine gore onerilen kampanya sablonlari. Tiklayarak hizlica olusturabilirsiniz.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
               {SUGGESTED_CAMPAIGNS.map((s) => (
                  <Link
                     key={s.id}
                     href={`/campaigns/new?template=${s.id}`}
                     className="rounded-xl border p-4 text-center hover:border-orange-500/40 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-all group"
                  >
                     <div className="text-2xl mb-2">{s.emoji}</div>
                     <div className="text-xs font-semibold truncate group-hover:text-orange-500 transition-colors">
                        {s.name}
                     </div>
                     <div className="text-[10px] text-muted-foreground mt-1">
                        {s.months} | %{s.discount}
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
   )
}
