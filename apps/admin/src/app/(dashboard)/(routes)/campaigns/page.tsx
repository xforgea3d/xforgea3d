'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Percent, Bell, Ticket, CheckCircle2, AlertCircle, Timer } from 'lucide-react'

// ── Campaign data (mirrored from storefront) ──────────────────────────
interface Campaign {
   id: string
   name: string
   description: string
   startDate: string
   endDate: string
   theme: {
      primaryColor: string
      secondaryColor: string
      emoji: string
   }
   banner: {
      title: string
      subtitle: string
   }
   discountSuggestion: number
}

const CAMPAIGNS: Campaign[] = [
   {
      id: 'yilbasi',
      name: 'Yeni Yil Indirimleri',
      description: 'Yeni yila ozel firsatlar',
      startDate: '12-25',
      endDate: '01-05',
      theme: { primaryColor: '#dc2626', secondaryColor: '#16a34a', emoji: '\uD83C\uDF84' },
      banner: { title: 'Yeni Yila Ozel %20 Indirim!', subtitle: 'Sevdiklerinize 3D baski hediyeler' },
      discountSuggestion: 20,
   },
   {
      id: 'sevgililer',
      name: 'Sevgililer Gunu',
      description: '14 Subat ozel urunler',
      startDate: '02-07',
      endDate: '02-15',
      theme: { primaryColor: '#ec4899', secondaryColor: '#f43f5e', emoji: '\u2764\uFE0F' },
      banner: { title: 'Sevgililer Gunune Ozel Tasarimlar', subtitle: 'Kisiye ozel 3D baski hediyeler' },
      discountSuggestion: 15,
   },
   {
      id: 'kadinlar',
      name: '8 Mart Dunya Kadinlar Gunu',
      description: 'Kadinlar Gunune ozel firsatlar',
      startDate: '03-05',
      endDate: '03-09',
      theme: { primaryColor: '#a855f7', secondaryColor: '#ec4899', emoji: '\uD83D\uDC90' },
      banner: { title: 'Kadinlar Gunune Ozel', subtitle: 'Benzersiz hediyeler' },
      discountSuggestion: 10,
   },
   {
      id: 'ramazan',
      name: 'Ramazan Bayrami',
      description: 'Ramazan Bayramina ozel firsatlar',
      startDate: '03-28',
      endDate: '04-02',
      theme: { primaryColor: '#059669', secondaryColor: '#d97706', emoji: '\uD83C\uDF19' },
      banner: { title: 'Ramazan Bayraminiz Kutlu Olsun', subtitle: 'Bayram hediyelerinde indirimler' },
      discountSuggestion: 15,
   },
   {
      id: '23nisan',
      name: '23 Nisan Cocuk Bayrami',
      description: 'Ulusal Egemenlik ve Cocuk Bayrami',
      startDate: '04-20',
      endDate: '04-24',
      theme: { primaryColor: '#3b82f6', secondaryColor: '#ef4444', emoji: '\uD83C\uDF88' },
      banner: { title: '23 Nisan Cocuk Bayrami Senligi!', subtitle: 'Eglenceli 3D figurler' },
      discountSuggestion: 15,
   },
   {
      id: 'anneler',
      name: 'Anneler Gunu',
      description: 'Anneler Gunune ozel hediyeler',
      startDate: '05-08',
      endDate: '05-15',
      theme: { primaryColor: '#f472b6', secondaryColor: '#fb923c', emoji: '\uD83C\uDF38' },
      banner: { title: 'Anneler Gunune Ozel', subtitle: 'Kisiye ozel 3D baski hediyeler' },
      discountSuggestion: 15,
   },
   {
      id: 'kurban',
      name: 'Kurban Bayrami',
      description: 'Kurban Bayramina ozel firsatlar',
      startDate: '06-05',
      endDate: '06-10',
      theme: { primaryColor: '#059669', secondaryColor: '#0284c7', emoji: '\uD83D\uDD4C' },
      banner: { title: 'Kurban Bayraminiz Mubarek Olsun', subtitle: 'Bayram hediyelerinde indirim' },
      discountSuggestion: 15,
   },
   {
      id: 'babalar',
      name: 'Babalar Gunu',
      description: 'Babalar Gunune ozel hediyeler',
      startDate: '06-15',
      endDate: '06-22',
      theme: { primaryColor: '#2563eb', secondaryColor: '#0d9488', emoji: '\uD83D\uDC54' },
      banner: { title: 'Babalar Gunune Ozel', subtitle: 'Arac aksesuarlari ve figurler' },
      discountSuggestion: 15,
   },
   {
      id: 'yaz',
      name: 'Yaz Indirimleri',
      description: 'Yaz kampanyasi firsatlari',
      startDate: '07-01',
      endDate: '08-31',
      theme: { primaryColor: '#f59e0b', secondaryColor: '#06b6d4', emoji: '\u2600\uFE0F' },
      banner: { title: 'Yaz Kampanyasi Basladi!', subtitle: 'Buyuk indirimler' },
      discountSuggestion: 25,
   },
   {
      id: 'okul',
      name: 'Okula Donus',
      description: 'Okula donus kampanyasi',
      startDate: '09-01',
      endDate: '09-15',
      theme: { primaryColor: '#8b5cf6', secondaryColor: '#3b82f6', emoji: '\uD83D\uDCDA' },
      banner: { title: 'Okula Donus Kampanyasi', subtitle: 'Kisiye ozel okul urunleri' },
      discountSuggestion: 10,
   },
   {
      id: '29ekim',
      name: '29 Ekim Cumhuriyet Bayrami',
      description: 'Cumhuriyet Bayrami kutlamalari',
      startDate: '10-26',
      endDate: '10-30',
      theme: { primaryColor: '#dc2626', secondaryColor: '#ffffff', emoji: '\uD83C\uDDF9\uD83C\uDDF7' },
      banner: { title: 'Cumhuriyet Bayrami Kutlu Olsun!', subtitle: 'Bayrama ozel indirimler' },
      discountSuggestion: 29,
   },
   {
      id: 'blackfriday',
      name: 'Efsane Cuma / Kasim Indirimleri',
      description: 'Yilin en buyuk indirimleri',
      startDate: '11-11',
      endDate: '11-30',
      theme: { primaryColor: '#000000', secondaryColor: '#f59e0b', emoji: '\uD83C\uDFF7\uFE0F' },
      banner: { title: 'EFSANE KASIM INDIRIMLERI', subtitle: "%40'a varan firsatlar" },
      discountSuggestion: 40,
   },
]

function getCampaignStatus(c: Campaign): 'aktif' | 'yaklasıyor' | 'gecti' {
   const now = new Date()
   const month = String(now.getMonth() + 1).padStart(2, '0')
   const day = String(now.getDate()).padStart(2, '0')
   const today = `${month}-${day}`

   // Check if active
   if (c.startDate <= c.endDate) {
      if (today >= c.startDate && today <= c.endDate) return 'aktif'
   } else {
      if (today >= c.startDate || today <= c.endDate) return 'aktif'
   }

   // Check if approaching (within 14 days)
   const currentDate = now.getTime()
   const [startMonth, startDay] = c.startDate.split('-').map(Number)
   let startYear = now.getFullYear()
   const startDate = new Date(startYear, startMonth - 1, startDay)
   if (startDate.getTime() < currentDate) {
      startDate.setFullYear(startYear + 1)
   }
   const daysUntil = (startDate.getTime() - currentDate) / (1000 * 60 * 60 * 24)
   if (daysUntil <= 14 && daysUntil > 0) return 'yaklasıyor'

   return 'gecti'
}

function formatDate(mmdd: string): string {
   const [m, d] = mmdd.split('-')
   const months = [
      'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
      'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik',
   ]
   return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

export default function CampaignsPage() {
   const [campaigns, setCampaigns] = useState<(Campaign & { status: ReturnType<typeof getCampaignStatus> })[]>([])

   useEffect(() => {
      const sorted = CAMPAIGNS.map((c) => ({
         ...c,
         status: getCampaignStatus(c),
      })).sort((a, b) => {
         const order = { aktif: 0, 'yaklasıyor': 1, gecti: 2 }
         return order[a.status] - order[b.status]
      })
      setCampaigns(sorted)
   }, [])

   return (
      <div className="flex-1 space-y-6 p-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Kampanyalar</h1>
               <p className="text-sm text-muted-foreground mt-1">
                  Sezonluk kampanya takvimi ve yonetimi
               </p>
            </div>
            <div className="flex items-center gap-2">
               <Calendar className="h-5 w-5 text-muted-foreground" />
               <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
               </span>
            </div>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Aktif Kampanya
               </div>
               <div className="text-2xl font-bold">
                  {campaigns.filter((c) => c.status === 'aktif').length}
               </div>
            </div>
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Timer className="h-4 w-4 text-amber-500" />
                  Yaklasan
               </div>
               <div className="text-2xl font-bold">
                  {campaigns.filter((c) => c.status === 'yaklasıyor').length}
               </div>
            </div>
            <div className="rounded-xl border p-4">
               <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Toplam
               </div>
               <div className="text-2xl font-bold">{campaigns.length}</div>
            </div>
         </div>

         {/* Campaign List */}
         <div className="space-y-3">
            {campaigns.map((c) => {
               const statusConfig = {
                  aktif: {
                     label: 'Aktif',
                     className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                     icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                  },
                  'yaklasıyor': {
                     label: 'Yaklasıyor',
                     className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                     icon: <AlertCircle className="h-3.5 w-3.5" />,
                  },
                  gecti: {
                     label: 'Gecti',
                     className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                     icon: <Clock className="h-3.5 w-3.5" />,
                  },
               }
               const status = statusConfig[c.status]

               return (
                  <div
                     key={c.id}
                     className={`rounded-xl border p-5 transition-colors ${
                        c.status === 'aktif'
                           ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10'
                           : c.status === 'yaklasıyor'
                             ? 'border-amber-200 dark:border-amber-800/50'
                             : ''
                     }`}
                  >
                     <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                           {/* Emoji avatar */}
                           <div
                              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                              style={{
                                 background: `linear-gradient(135deg, ${c.theme.primaryColor}20, ${c.theme.secondaryColor}20)`,
                              }}
                           >
                              {c.theme.emoji}
                           </div>

                           <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="font-semibold truncate">{c.name}</h3>
                                 <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
                                 >
                                    {status.icon}
                                    {status.label}
                                 </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{c.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                 <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(c.startDate)} - {formatDate(c.endDate)}
                                 </span>
                                 <span className="flex items-center gap-1">
                                    <Percent className="h-3 w-3" />
                                    Onerilen indirim: %{c.discountSuggestion}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                           <a
                              href={`/discount-codes/new?amount=${c.discountSuggestion}&code=${c.id.toUpperCase()}${new Date().getFullYear()}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                           >
                              <Ticket className="h-3.5 w-3.5" />
                              Kupon Olustur
                           </a>
                           <a
                              href={`/notifications?title=${encodeURIComponent(c.banner.title)}&body=${encodeURIComponent(c.banner.subtitle)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                           >
                              <Bell className="h-3.5 w-3.5" />
                              Bildirim Gonder
                           </a>
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>
   )
}
