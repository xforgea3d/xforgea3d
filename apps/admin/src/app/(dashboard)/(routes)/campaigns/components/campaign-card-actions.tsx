'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Power, PowerOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CampaignCardActionsProps {
   campaignId: string
   isActive: boolean
   storefrontUrl: string
}

export function CampaignCardActions({
   campaignId,
   isActive,
   storefrontUrl,
}: CampaignCardActionsProps) {
   const router = useRouter()
   const [toggling, setToggling] = useState(false)

   function handleTestClick(e: React.MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
      const previewSecret = process.env.NEXT_PUBLIC_CAMPAIGN_PREVIEW_SECRET || ''
      const url = `${storefrontUrl}?campaign_preview=${campaignId}&secret=${previewSecret}`
      window.open(url, '_blank')
   }

   async function handleToggleActive(e: React.MouseEvent) {
      e.preventDefault()
      e.stopPropagation()
      try {
         setToggling(true)
         const res = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !isActive }),
         })
         if (!res.ok) throw new Error('Toggle failed')
         toast.success(isActive ? 'Kampanya deaktif edildi' : 'Kampanya aktif edildi')
         router.refresh()
      } catch {
         toast.error('Durum degistirilemedi')
      } finally {
         setToggling(false)
      }
   }

   return (
      <div className="flex items-center gap-1.5 mt-2">
         <button
            onClick={handleTestClick}
            className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 text-[11px] font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            title="Storefront'ta onizle"
         >
            <ExternalLink className="h-3 w-3" />
            Test Et
         </button>
         <button
            onClick={handleToggleActive}
            disabled={toggling}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
               isActive
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
            }`}
            title={isActive ? 'Deaktif et' : 'Aktif et'}
         >
            {isActive ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
            {toggling ? '...' : isActive ? 'Deaktif Et' : 'Aktif Et'}
         </button>
      </div>
   )
}
