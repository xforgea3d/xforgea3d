'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
   endDate: string
   title?: string
}

interface TimeLeft {
   days: number
   hours: number
   minutes: number
   seconds: number
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
   const diff = new Date(endDate).getTime() - Date.now()
   if (diff <= 0) return null
   return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
   }
}

export default function CountdownTimer({ endDate, title }: CountdownTimerProps) {
   const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
      calculateTimeLeft(endDate)
   )

   useEffect(() => {
      const timer = setInterval(() => {
         const remaining = calculateTimeLeft(endDate)
         setTimeLeft(remaining)
         if (!remaining) clearInterval(timer)
      }, 1000)
      return () => clearInterval(timer)
   }, [endDate])

   if (!timeLeft) {
      return (
         <div className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 dark:border-orange-800/40 bg-orange-50 dark:bg-orange-950/20 px-4 py-3">
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
               Kampanya sona erdi
            </span>
         </div>
      )
   }

   const blocks: { value: number; label: string }[] = [
      { value: timeLeft.days, label: 'Gün' },
      { value: timeLeft.hours, label: 'Saat' },
      { value: timeLeft.minutes, label: 'Dk' },
      { value: timeLeft.seconds, label: 'Sn' },
   ]

   return (
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
         {title && (
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
               {title}
            </span>
         )}
         <div className="flex items-center gap-2">
            {blocks.map(({ value, label }, i) => (
               <div key={label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                     <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-orange-500 text-white text-lg sm:text-xl font-bold tabular-nums shadow-md shadow-orange-500/20">
                        {String(value).padStart(2, '0')}
                     </span>
                     <span className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                        {label}
                     </span>
                  </div>
                  {i < blocks.length - 1 && (
                     <span className="text-orange-500 font-bold text-lg mb-4">:</span>
                  )}
               </div>
            ))}
         </div>
      </div>
   )
}
