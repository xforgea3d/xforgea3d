'use client'

import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { TR_CITIES, getDistricts, getPostalCode } from '@/lib/turkey-locations'
import { useCallback } from 'react'

interface CityDistrictSelectorProps {
   city: string
   district: string
   postalCode: string
   onCityChange: (city: string) => void
   onDistrictChange: (district: string) => void
   onPostalCodeChange: (postalCode: string) => void
   disabled?: boolean
   /** If true, only show city selector (no district/postal code) */
   cityOnly?: boolean
}

export function CityDistrictSelector({
   city,
   district,
   postalCode,
   onCityChange,
   onDistrictChange,
   onPostalCodeChange,
   disabled,
   cityOnly = false,
}: CityDistrictSelectorProps) {
   const districts = city ? getDistricts(city) : []

   const handleCityChange = useCallback(
      (newCity: string) => {
         onCityChange(newCity)
         onDistrictChange('')
         onPostalCodeChange('')
      },
      [onCityChange, onDistrictChange, onPostalCodeChange]
   )

   const handleDistrictChange = useCallback(
      (newDistrict: string) => {
         onDistrictChange(newDistrict)
         const pc = getPostalCode(city, newDistrict)
         if (pc) {
            onPostalCodeChange(pc)
         }
      },
      [city, onDistrictChange, onPostalCodeChange]
   )

   return (
      <div className={cityOnly ? '' : 'grid grid-cols-1 sm:grid-cols-3 gap-3'}>
         {/* City */}
         <div>
            <Select value={city} onValueChange={handleCityChange} disabled={disabled}>
               <SelectTrigger>
                  <SelectValue placeholder="Şehir seçin" />
               </SelectTrigger>
               <SelectContent className="max-h-[280px] overflow-y-auto">
                  {TR_CITIES.map((c) => (
                     <SelectItem key={c.plateCode} value={c.name}>
                        {c.plateCode} - {c.name}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         {/* District */}
         {!cityOnly && (
            <div>
               <Select
                  value={district}
                  onValueChange={handleDistrictChange}
                  disabled={disabled || !city}
               >
                  <SelectTrigger>
                     <SelectValue placeholder="İlçe seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px] overflow-y-auto">
                     {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                           {d}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>
         )}

         {/* Postal Code */}
         {!cityOnly && (
            <div>
               <Input
                  value={postalCode}
                  onChange={(e) => onPostalCodeChange(e.target.value)}
                  placeholder="Posta kodu"
                  disabled={disabled}
                  maxLength={5}
               />
            </div>
         )}
      </div>
   )
}

export default CityDistrictSelector
