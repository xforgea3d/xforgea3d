'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getFiltersFromSession } from './options'

/**
 * Invisible client component that restores saved filters from sessionStorage
 * on initial page load when no filters are present in the URL.
 */
export default function FilterRestorer() {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   useEffect(() => {
      // Only restore if the current URL has no filter params
      const hasFilters = searchParams.has('sort') ||
         searchParams.has('category') ||
         searchParams.has('brand') ||
         searchParams.has('isAvailable') ||
         searchParams.has('carBrand') ||
         searchParams.has('carModel')

      if (hasFilters) return

      const saved = getFiltersFromSession()
      if (saved && saved.length > 0) {
         router.replace(`${pathname}?${saved}`, { scroll: false })
      }
   }, []) // eslint-disable-line react-hooks/exhaustive-deps

   return null
}
