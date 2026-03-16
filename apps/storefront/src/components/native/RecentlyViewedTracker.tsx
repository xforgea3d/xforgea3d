'use client'

import { useEffect } from 'react'
import { addRecentlyViewed } from '@/lib/recently-viewed'
import { trackViewItem } from '@/lib/gtag'

export default function RecentlyViewedTracker({
   productId,
   productName,
   productPrice,
}: {
   productId: string
   productName?: string
   productPrice?: number
}) {
   useEffect(() => {
      addRecentlyViewed(productId)
      if (productName && productPrice !== undefined) {
         trackViewItem(productId, productName, productPrice)
      }
   }, [productId, productName, productPrice])

   return null
}
