'use client'

import { useEffect, useState } from 'react'
import { getActiveCampaign, getCampaignEndDate, type Campaign } from '@/lib/campaigns'
import { X } from 'lucide-react'
import Link from 'next/link'

const DISMISS_KEY = 'campaign-banner-dismissed'

export default function CampaignBanner() {
   const [campaign, setCampaign] = useState<Campaign | null>(null)
   const [dismissed, setDismissed] = useState(true)
   const [mounted, setMounted] = useState(false)

   useEffect(() => {
      const active = getActiveCampaign()
      if (!active) return

      const dismissedId = sessionStorage.getItem(DISMISS_KEY)
      if (dismissedId === active.id) return

      setCampaign(active)
      setDismissed(false)
      // Trigger entrance animation
      requestAnimationFrame(() => {
         setMounted(true)
      })
   }, [])

   function handleDismiss() {
      setMounted(false)
      setTimeout(() => {
         setDismissed(true)
         if (campaign) {
            sessionStorage.setItem(DISMISS_KEY, campaign.id)
         }
      }, 300)
   }

   if (dismissed || !campaign) return null

   return (
      <div
         className={`relative w-full overflow-hidden transition-all duration-300 ease-out ${
            mounted ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
         }`}
         style={{
            background: `linear-gradient(135deg, ${campaign.theme.primaryColor}18, ${campaign.theme.secondaryColor}18)`,
         }}
      >
         <div className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-center sm:gap-4 sm:px-8">
            {/* Emoji */}
            <span className="text-lg sm:text-xl flex-shrink-0">{campaign.theme.emoji}</span>

            {/* Content */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 min-w-0">
               <span className="text-sm font-bold truncate" style={{ color: campaign.theme.primaryColor }}>
                  {campaign.banner.title}
               </span>
               <span className="hidden sm:inline text-xs text-muted-foreground truncate">
                  {campaign.banner.subtitle}
               </span>
            </div>

            {/* CTA */}
            <Link
               href={campaign.banner.ctaLink}
               className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white transition-transform hover:scale-105"
               style={{ backgroundColor: campaign.theme.primaryColor }}
            >
               {campaign.banner.ctaText}
            </Link>

            {/* Emoji (right) */}
            <span className="hidden sm:inline text-lg flex-shrink-0">{campaign.theme.emoji}</span>

            {/* Dismiss */}
            <button
               onClick={handleDismiss}
               className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
               aria-label="Kapat"
            >
               <X className="h-3.5 w-3.5" />
            </button>
         </div>
      </div>
   )
}
