'use client'

import { useEffect, useState } from 'react'

interface InstagramCTAProps {
   message?: string
   compact?: boolean
   className?: string
}

const INSTAGRAM_FALLBACK = 'https://www.instagram.com/xforgea3d'

export default function InstagramCTA({
   message,
   compact = false,
   className = '',
}: InstagramCTAProps) {
   const [instagramUrl, setInstagramUrl] = useState(INSTAGRAM_FALLBACK)

   useEffect(() => {
      fetch('/api/site-settings')
         .then((res) => res.json())
         .then((data) => {
            if (data?.instagram_url) setInstagramUrl(data.instagram_url)
            else if (data?.instagramUrl) setInstagramUrl(data.instagramUrl)
         })
         .catch(() => {})
   }, [])

   if (compact) {
      return (
         <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
            {message && <span>{message}</span>}
            <a
               href={instagramUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
               <InstagramIcon size={16} />
               @xforgea3d
            </a>
         </div>
      )
   }

   return (
      <div className={`rounded-xl border border-orange-200 dark:border-orange-800/40 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 ${className}`}>
         <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white flex-shrink-0">
               <InstagramIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
               {message && (
                  <p className="text-sm text-foreground leading-snug mb-1">{message}</p>
               )}
               <p className="text-sm text-muted-foreground">
                  Bizi Instagram&apos;da takip edin{' '}
                  <a
                     href={instagramUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                     @xforgea3d
                  </a>
               </p>
            </div>
            <a
               href={instagramUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition-all"
            >
               Takip Et
            </a>
         </div>
      </div>
   )
}

function InstagramIcon({ size = 20 }: { size?: number }) {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
         <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
         <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
   )
}
