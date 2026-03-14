'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BackToTop() {
   const [visible, setVisible] = useState(false)

   useEffect(() => {
      function onScroll() {
         setVisible(window.scrollY > 400)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
   }, [])

   return (
      <button
         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         aria-label="Yukarı çık"
         className={`fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border bg-background/80 backdrop-blur text-muted-foreground hover:text-foreground shadow-sm transition-all duration-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
         }`}
      >
         <ChevronUp className="h-5 w-5" />
      </button>
   )
}
