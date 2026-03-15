'use client'

import { Input } from '@/components/ui/input'
import { useCallback } from 'react'

interface PhoneInputProps {
   value: string
   onChange: (value: string) => void
   disabled?: boolean
   error?: string
   className?: string
   placeholder?: string
}

function formatPhone(digits: string): string {
   // Format: 05XX XXX XX XX
   if (digits.length <= 4) return digits
   if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
   if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
   return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`
}

function stripNonDigits(val: string): string {
   return val.replace(/\D/g, '')
}

export function validateTurkishPhone(value: string): string | null {
   const digits = stripNonDigits(value)
   if (!digits) return null // empty is not an error (use required validation separately)
   if (digits.length < 10) return 'Telefon numarası 10 haneli olmalıdır'
   if (digits.length > 11) return 'Telefon numarası çok uzun'
   if (digits.length === 11 && digits.startsWith('90')) {
      const rest = digits.slice(1)
      if (!rest.startsWith('05')) return 'Telefon numarası 05 ile başlamalıdır'
      return null
   }
   if (!digits.startsWith('05')) return 'Telefon numarası 05 ile başlamalıdır'
   if (digits.length !== 10) return 'Telefon numarası 10 haneli olmalıdır'
   return null
}

export function PhoneInput({
   value,
   onChange,
   disabled,
   error,
   className,
   placeholder = '05XX XXX XX XX',
}: PhoneInputProps) {
   const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         let digits = stripNonDigits(e.target.value)
         // If user typed country code, strip it
         if (digits.startsWith('90') && digits.length > 10) {
            digits = '0' + digits.slice(2)
         }
         // Limit to 10 digits
         if (digits.length > 11) digits = digits.slice(0, 11)
         onChange(digits)
      },
      [onChange]
   )

   const displayValue = formatPhone(stripNonDigits(value))
   const validationError = error || (value && value.length >= 4 ? validateTurkishPhone(value) : null)

   return (
      <div className="space-y-1">
         <Input
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`${validationError ? 'border-red-400 focus-visible:ring-red-400' : ''} ${className || ''}`}
         />
         {validationError && (
            <p className="text-xs text-red-500">{validationError}</p>
         )}
      </div>
   )
}

export default PhoneInput
