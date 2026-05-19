'use client'

import { Label } from '@/components/ui/label'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { isVariableValid } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

// ─── Session storage helpers for filter persistence ─────────────────────────
const FILTER_STORAGE_KEY = 'xforgea3d_product_filters'

function saveFiltersToSession(params: string) {
   try {
      sessionStorage.setItem(FILTER_STORAGE_KEY, params)
   } catch {
      console.warn('[products] Unable to persist filters')
   }
}

export function getFiltersFromSession(): string | null {
   try {
      return sessionStorage.getItem(FILTER_STORAGE_KEY)
   } catch {
      return null
   }
}

function useFilterNav() {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()

   const navigate = (key: string, val: string | null) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (val) {
         current.set(key, val)
      } else {
         current.delete(key)
      }
      const search = current.toString()
      const query = search ? `?${search}` : ''
      saveFiltersToSession(search)
      router.replace(`${pathname}${query}`, { scroll: false })
   }

   return { searchParams, navigate }
}

export function SortBy({ initialData }) {
   const { navigate } = useFilterNav()
   const [value, setValue] = React.useState(initialData || '')

   useEffect(() => {
      if (isVariableValid(initialData)) setValue(String(initialData))
   }, [initialData])

   return (
      <Select
         value={value || undefined}
         onValueChange={(v) => {
            setValue(v)
            navigate('sort', v || null)
         }}
      >
         <SelectTrigger className="w-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur shadow-sm">
            <SelectValue placeholder="Sırala..." />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="featured">Öne Çıkanlar</SelectItem>
            <SelectItem value="least_expensive">Artan Fiyat</SelectItem>
            <SelectItem value="most_expensive">Azalan Fiyat</SelectItem>
         </SelectContent>
      </Select>
   )
}

export function CategoriesCombobox({ categories, initialCategory }) {
   const { navigate } = useFilterNav()
   const [value, setValue] = React.useState(initialCategory || '')

   useEffect(() => {
      if (initialCategory) setValue(initialCategory)
   }, [initialCategory])

   return (
      <Select
         value={value || undefined}
         onValueChange={(v) => {
            if (v === '__clear__') {
               setValue('')
               navigate('category', null)
            } else {
               setValue(v)
               navigate('category', v)
            }
         }}
      >
         <SelectTrigger className="w-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur shadow-sm">
            <SelectValue placeholder="Kategori Seç..." />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="__clear__">Tüm Kategoriler</SelectItem>
            {categories.map((category) => (
               <SelectItem key={category.id || category.title} value={category.title}>
                  {category.title}
               </SelectItem>
            ))}
         </SelectContent>
      </Select>
   )
}

export function BrandCombobox({ brands, initialBrand }) {
   const { navigate } = useFilterNav()
   const [value, setValue] = React.useState(initialBrand || '')

   useEffect(() => {
      if (initialBrand) setValue(initialBrand)
   }, [initialBrand])

   return (
      <Select
         value={value || undefined}
         onValueChange={(v) => {
            if (v === '__clear__') {
               setValue('')
               navigate('brand', null)
            } else {
               setValue(v)
               navigate('brand', v)
            }
         }}
      >
         <SelectTrigger className="w-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur shadow-sm">
            <SelectValue placeholder="Marka Seç..." />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="__clear__">Tüm Markalar</SelectItem>
            {brands.map((brand) => (
               <SelectItem key={brand.id || brand.title} value={brand.title}>
                  {brand.title}
               </SelectItem>
            ))}
         </SelectContent>
      </Select>
   )
}

export function PriceRangeFilter({ initialMin, initialMax }: { initialMin?: string; initialMax?: string }) {
   const { navigate } = useFilterNav()
   const [minPrice, setMinPrice] = React.useState(initialMin || '')
   const [maxPrice, setMaxPrice] = React.useState(initialMax || '')

   useEffect(() => {
      if (initialMin) setMinPrice(initialMin)
      if (initialMax) setMaxPrice(initialMax)
   }, [initialMin, initialMax])

   const applyMin = (val: string) => {
      setMinPrice(val)
      navigate('minPrice', val || null)
   }

   const applyMax = (val: string) => {
      setMaxPrice(val)
      navigate('maxPrice', val || null)
   }

   return (
      <div className="flex w-full gap-2 col-span-2 md:col-span-3 lg:col-span-4">
         <div className="flex-1 relative">
            <input
               type="number"
               min={0}
               placeholder="Min Fiyat"
               value={minPrice}
               onChange={(e) => applyMin(e.target.value)}
               className="w-full border rounded-md h-10 px-3 text-sm bg-white/50 dark:bg-black/50 backdrop-blur shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            />
         </div>
         <div className="flex-1 relative">
            <input
               type="number"
               min={0}
               placeholder="Max Fiyat"
               value={maxPrice}
               onChange={(e) => applyMax(e.target.value)}
               className="w-full border rounded-md h-10 px-3 text-sm bg-white/50 dark:bg-black/50 backdrop-blur shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            />
         </div>
      </div>
   )
}

export function AvailableToggle({ initialData }) {
   const { navigate } = useFilterNav()
   const [value, setValue] = React.useState(false)

   useEffect(() => {
      setValue(initialData === 'true' ? true : false)
   }, [initialData])

   return (
      <div className="flex w-full border rounded-md h-10 px-3 items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur shadow-sm">
         <Label htmlFor="available" className="text-sm font-medium cursor-pointer">Sadece Mevcut</Label>
         <Switch
            checked={value}
            onCheckedChange={(currentValue: boolean) => {
               setValue(currentValue)
               navigate('isAvailable', currentValue ? 'true' : 'false')
            }}
            id="available"
         />
      </div>
   )
}
