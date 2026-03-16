export interface Campaign {
   id: string
   name: string
   description: string
   startDate: string // MM-DD format
   endDate: string // MM-DD format
   theme: {
      primaryColor: string // hex
      secondaryColor: string // hex
      gradientFrom: string // tailwind color
      gradientTo: string // tailwind color
      emoji: string
      icon: string // lucide icon name
   }
   banner: {
      title: string
      subtitle: string
      ctaText: string
      ctaLink: string
   }
   discountSuggestion: number // suggested discount %
}

export const CAMPAIGNS: Campaign[] = [
   // Ocak - Yeni Yil
   {
      id: 'yilbasi',
      name: 'Yeni Yil Indirimleri',
      description: 'Yeni yila ozel firsatlar',
      startDate: '12-25',
      endDate: '01-05',
      theme: {
         primaryColor: '#dc2626',
         secondaryColor: '#16a34a',
         gradientFrom: 'from-red-500/10',
         gradientTo: 'to-green-500/10',
         emoji: '\uD83C\uDF84',
         icon: 'Gift',
      },
      banner: {
         title: 'Yeni Yila Ozel %20 Indirim!',
         subtitle: 'Sevdiklerinize 3D baski hediyeler',
         ctaText: 'Hediyeleri Kesfet',
         ctaLink: '/products?sort=featured',
      },
      discountSuggestion: 20,
   },
   // Subat - Sevgililer Gunu
   {
      id: 'sevgililer',
      name: 'Sevgililer Gunu',
      description: '14 Subat ozel urunler',
      startDate: '02-07',
      endDate: '02-15',
      theme: {
         primaryColor: '#ec4899',
         secondaryColor: '#f43f5e',
         gradientFrom: 'from-pink-500/10',
         gradientTo: 'to-rose-500/10',
         emoji: '\u2764\uFE0F',
         icon: 'Heart',
      },
      banner: {
         title: 'Sevgililer Gunune Ozel Tasarimlar',
         subtitle: 'Kisiye ozel 3D baski hediyelerle sevginizi gosterin',
         ctaText: 'Hediye Sec',
         ctaLink: '/products?category=Dekoratif',
      },
      discountSuggestion: 15,
   },
   // Mart - Kadinlar Gunu
   {
      id: 'kadinlar',
      name: '8 Mart Dunya Kadinlar Gunu',
      description: 'Kadinlar Gunune ozel firsatlar',
      startDate: '03-05',
      endDate: '03-09',
      theme: {
         primaryColor: '#a855f7',
         secondaryColor: '#ec4899',
         gradientFrom: 'from-purple-500/10',
         gradientTo: 'to-pink-500/10',
         emoji: '\uD83D\uDC90',
         icon: 'Flower2',
      },
      banner: {
         title: 'Kadinlar Gunune Ozel',
         subtitle: 'Hayatinizdaki ozel kadinlara benzersiz hediyeler',
         ctaText: 'Hediyeleri Gor',
         ctaLink: '/products',
      },
      discountSuggestion: 10,
   },
   // Nisan - 23 Nisan
   {
      id: '23nisan',
      name: '23 Nisan Cocuk Bayrami',
      description: 'Ulusal Egemenlik ve Cocuk Bayrami',
      startDate: '04-20',
      endDate: '04-24',
      theme: {
         primaryColor: '#3b82f6',
         secondaryColor: '#ef4444',
         gradientFrom: 'from-blue-500/10',
         gradientTo: 'to-red-500/10',
         emoji: '\uD83C\uDF88',
         icon: 'PartyPopper',
      },
      banner: {
         title: '23 Nisan Cocuk Bayrami Senligi!',
         subtitle: 'Cocuklar icin eglenceli 3D figurler ve oyuncaklar',
         ctaText: 'Figurleri Kesfet',
         ctaLink: '/products?category=Fig%C3%BCrler',
      },
      discountSuggestion: 15,
   },
   // Mayis - Anneler Gunu
   {
      id: 'anneler',
      name: 'Anneler Gunu',
      description: 'Anneler Gunune ozel hediyeler',
      startDate: '05-08',
      endDate: '05-15',
      theme: {
         primaryColor: '#f472b6',
         secondaryColor: '#fb923c',
         gradientFrom: 'from-pink-400/10',
         gradientTo: 'to-orange-400/10',
         emoji: '\uD83C\uDF38',
         icon: 'Heart',
      },
      banner: {
         title: 'Anneler Gunune Ozel',
         subtitle: 'Annenize en guzel hediye: kisiye ozel 3D baski',
         ctaText: 'Anneye Hediye',
         ctaLink: '/products?category=Dekoratif',
      },
      discountSuggestion: 15,
   },
   // Haziran - Babalar Gunu
   {
      id: 'babalar',
      name: 'Babalar Gunu',
      description: 'Babalar Gunune ozel hediyeler',
      startDate: '06-15',
      endDate: '06-22',
      theme: {
         primaryColor: '#2563eb',
         secondaryColor: '#0d9488',
         gradientFrom: 'from-blue-600/10',
         gradientTo: 'to-teal-500/10',
         emoji: '\uD83D\uDC54',
         icon: 'Trophy',
      },
      banner: {
         title: 'Babalar Gunune Ozel',
         subtitle: 'Babaniza ozel arac aksesuarlari ve figurler',
         ctaText: 'Babaya Hediye',
         ctaLink: '/products?category=Ara%C3%A7%20Aksesuarlar%C4%B1',
      },
      discountSuggestion: 15,
   },
   // Temmuz-Agustos - Yaz Indirimi
   {
      id: 'yaz',
      name: 'Yaz Indirimleri',
      description: 'Yaz kampanyasi firsatlari',
      startDate: '07-01',
      endDate: '08-31',
      theme: {
         primaryColor: '#f59e0b',
         secondaryColor: '#06b6d4',
         gradientFrom: 'from-amber-500/10',
         gradientTo: 'to-cyan-500/10',
         emoji: '\u2600\uFE0F',
         icon: 'Sun',
      },
      banner: {
         title: 'Yaz Kampanyasi Basladi!',
         subtitle: 'Tum urunlerde buyuk indirimler',
         ctaText: 'Indirimleri Gor',
         ctaLink: '/products?sort=featured',
      },
      discountSuggestion: 25,
   },
   // Eylul - Okula Donus
   {
      id: 'okul',
      name: 'Okula Donus',
      description: 'Okula donus kampanyasi',
      startDate: '09-01',
      endDate: '09-15',
      theme: {
         primaryColor: '#8b5cf6',
         secondaryColor: '#3b82f6',
         gradientFrom: 'from-violet-500/10',
         gradientTo: 'to-blue-500/10',
         emoji: '\uD83D\uDCDA',
         icon: 'GraduationCap',
      },
      banner: {
         title: 'Okula Donus Kampanyasi',
         subtitle: 'Masaustu aksesuarlar ve kisiye ozel okul urunleri',
         ctaText: 'Urunleri Gor',
         ctaLink: '/products?category=Aksesuarlar',
      },
      discountSuggestion: 10,
   },
   // Ekim - 29 Ekim
   {
      id: '29ekim',
      name: '29 Ekim Cumhuriyet Bayrami',
      description: 'Cumhuriyet Bayrami kutlamalari',
      startDate: '10-26',
      endDate: '10-30',
      theme: {
         primaryColor: '#dc2626',
         secondaryColor: '#ffffff',
         gradientFrom: 'from-red-600/10',
         gradientTo: 'to-red-400/5',
         emoji: '\uD83C\uDDF9\uD83C\uDDF7',
         icon: 'Flag',
      },
      banner: {
         title: 'Cumhuriyet Bayrami Kutlu Olsun!',
         subtitle: 'Bayrama ozel indirimler',
         ctaText: 'Kampanyayi Gor',
         ctaLink: '/products',
      },
      discountSuggestion: 29,
   },
   // Kasim - Black Friday / 11.11
   {
      id: 'blackfriday',
      name: 'Efsane Cuma / Kasim Indirimleri',
      description: 'Yilin en buyuk indirimleri',
      startDate: '11-11',
      endDate: '11-30',
      theme: {
         primaryColor: '#000000',
         secondaryColor: '#f59e0b',
         gradientFrom: 'from-neutral-900/20',
         gradientTo: 'to-amber-500/10',
         emoji: '\uD83C\uDFF7\uFE0F',
         icon: 'Percent',
      },
      banner: {
         title: 'EFSANE KASIM INDIRIMLERI',
         subtitle: "Yilin en buyuk indirimleri basladi! %40'a varan firsatlar",
         ctaText: 'Firsatlari Yakala',
         ctaLink: '/products?sort=most_expensive',
      },
      discountSuggestion: 40,
   },
   // Ramazan (approximate - changes yearly)
   {
      id: 'ramazan',
      name: 'Ramazan Bayrami',
      description: 'Ramazan Bayramina ozel firsatlar',
      startDate: '03-28',
      endDate: '04-02',
      theme: {
         primaryColor: '#059669',
         secondaryColor: '#d97706',
         gradientFrom: 'from-emerald-500/10',
         gradientTo: 'to-amber-500/10',
         emoji: '\uD83C\uDF19',
         icon: 'Moon',
      },
      banner: {
         title: 'Ramazan Bayraminiz Kutlu Olsun',
         subtitle: 'Bayram hediyelerinde ozel indirimler',
         ctaText: 'Hediyeleri Gor',
         ctaLink: '/products',
      },
      discountSuggestion: 15,
   },
   // Kurban Bayrami (approximate)
   {
      id: 'kurban',
      name: 'Kurban Bayrami',
      description: 'Kurban Bayramina ozel firsatlar',
      startDate: '06-05',
      endDate: '06-10',
      theme: {
         primaryColor: '#059669',
         secondaryColor: '#0284c7',
         gradientFrom: 'from-emerald-500/10',
         gradientTo: 'to-sky-500/10',
         emoji: '\uD83D\uDD4C',
         icon: 'Moon',
      },
      banner: {
         title: 'Kurban Bayraminiz Mubarek Olsun',
         subtitle: 'Bayram hediyelerinde %15 indirim',
         ctaText: 'Hediyeleri Gor',
         ctaLink: '/products',
      },
      discountSuggestion: 15,
   },
]

export function getActiveCampaign(): Campaign | null {
   const now = new Date()
   const month = String(now.getMonth() + 1).padStart(2, '0')
   const day = String(now.getDate()).padStart(2, '0')
   const today = `${month}-${day}`

   return (
      CAMPAIGNS.find((c) => {
         if (c.startDate <= c.endDate) {
            return today >= c.startDate && today <= c.endDate
         }
         // Handle year-crossing campaigns (like Yilbasi: 12-25 to 01-05)
         return today >= c.startDate || today <= c.endDate
      }) || null
   )
}

/**
 * Get the end date of a campaign as a full Date object for the current year.
 * Used for countdown timers.
 */
export function getCampaignEndDate(campaign: Campaign): Date {
   const now = new Date()
   const [month, day] = campaign.endDate.split('-').map(Number)
   let year = now.getFullYear()

   // If campaign crosses year boundary and we're in January, end date year = current year
   // If we're in December, end date year = next year
   if (campaign.startDate > campaign.endDate) {
      const currentMonth = now.getMonth() + 1
      if (currentMonth >= 10) {
         year = now.getFullYear() + 1
      }
   }

   // Set to end of day
   return new Date(year, month - 1, day, 23, 59, 59)
}
