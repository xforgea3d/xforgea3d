'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AddressAutocompleteProps {
   value: string
   onChange: (value: string) => void
   placeholder?: string
   className?: string
}

/**
 * Address input with optional Google Maps Places autocomplete.
 *
 * If NEXT_PUBLIC_GOOGLE_MAPS_KEY is set, loads the Google Places API and
 * provides autocomplete suggestions as the user types. If the key is not
 * configured, renders a plain textarea (preserving current behavior).
 */
export default function AddressAutocomplete({
   value,
   onChange,
   placeholder = 'Mahalle, Sokak, Bina No, Daire No',
   className = '',
}: AddressAutocompleteProps) {
   const inputRef = useRef<HTMLInputElement>(null)
   const autocompleteRef = useRef<any>(null)
   const [scriptLoaded, setScriptLoaded] = useState(false)
   const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

   // Load Google Maps script
   useEffect(() => {
      if (!mapsKey) return
      if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
         setScriptLoaded(true)
         return
      }

      // Check if script is already loading
      const existingScript = document.querySelector(
         'script[src*="maps.googleapis.com/maps/api/js"]'
      )
      if (existingScript) {
         existingScript.addEventListener('load', () => setScriptLoaded(true))
         return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&language=tr&region=TR`
      script.async = true
      script.defer = true
      script.onload = () => setScriptLoaded(true)
      script.onerror = () => console.warn('[AddressAutocomplete] Failed to load Google Maps script')
      document.head.appendChild(script)
   }, [mapsKey])

   // Initialize autocomplete
   useEffect(() => {
      if (!scriptLoaded || !inputRef.current || autocompleteRef.current) return

      try {
         const google = (window as any).google
         if (!google?.maps?.places) return

         const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'tr' },
            types: ['address'],
            fields: ['formatted_address', 'address_components'],
         })

         autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place?.formatted_address) {
               onChange(place.formatted_address)
            }
         })

         autocompleteRef.current = autocomplete
      } catch (err) {
         console.warn('[AddressAutocomplete] Failed to init autocomplete:', err)
      }
   }, [scriptLoaded, onChange])

   // If no Google Maps key, render plain textarea
   if (!mapsKey) {
      return (
         <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
         />
      )
   }

   return (
      <input
         ref={inputRef}
         type="text"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         autoComplete="off"
         className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
   )
}
