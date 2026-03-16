'use client'

import { useEffect, useState } from 'react'
import { getActiveCampaign, type Campaign, type DBCampaign, dbCampaignToLegacy } from '@/lib/campaigns'
import { X, Copy, Check } from 'lucide-react'
import Link from 'next/link'

const DISMISS_KEY = 'campaign-banner-dismissed'

interface DiscountInfo {
   code: string
   percent: number
}

export default function CampaignBanner() {
   const [campaign, setCampaign] = useState<Campaign | null>(null)
   const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null)
   const [dismissed, setDismissed] = useState(true)
   const [mounted, setMounted] = useState(false)
   const [copied, setCopied] = useState(false)

   useEffect(() => {
      // Try DB campaigns first, then fall back to hardcoded
      async function loadCampaign() {
         let active: Campaign | null = null
         let discount: DiscountInfo | null = null

         try {
            const res = await fetch('/api/campaigns/active')
            if (res.ok) {
               const dbCampaigns: DBCampaign[] = await res.json()
               if (dbCampaigns.length > 0) {
                  active = dbCampaignToLegacy(dbCampaigns[0])
                  if (dbCampaigns[0].discountCode) {
                     discount = {
                        code: dbCampaigns[0].discountCode.code,
                        percent: dbCampaigns[0].discountCode.percent,
                     }
                  }
               }
            }
         } catch {
            // DB unavailable, fall through to hardcoded
         }

         if (!active) {
            active = getActiveCampaign()
         }

         if (!active) return

         const dismissedId = sessionStorage.getItem(DISMISS_KEY)
         if (dismissedId === active.id) return

         setCampaign(active)
         setDiscountInfo(discount)
         setDismissed(false)
         requestAnimationFrame(() => {
            setMounted(true)
         })
      }

      loadCampaign()
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

   async function handleClick() {
      // Track click event for DB campaigns
      if (campaign) {
         fetch('/api/campaigns/active', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaign.id }),
         }).catch(() => {})
      }
   }

   function handleCopyCode() {
      if (!discountInfo) return
      navigator.clipboard.writeText(discountInfo.code).then(() => {
         setCopied(true)
         setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
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

            {/* Discount code */}
            {discountInfo && (
               <button
                  onClick={handleCopyCode}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: campaign.theme.primaryColor, color: campaign.theme.primaryColor }}
                  title="Kodu kopyala"
               >
                  <span>Kod: {discountInfo.code}</span>
                  <span className="text-[10px] opacity-75">%{discountInfo.percent}</span>
                  {copied ? (
                     <Check className="h-3 w-3" />
                  ) : (
                     <Copy className="h-3 w-3" />
                  )}
               </button>
            )}

            {/* CTA */}
            <Link
               href={campaign.banner.ctaLink}
               onClick={handleClick}
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
