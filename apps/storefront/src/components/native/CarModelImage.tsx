'use client'

import { useEffect, useRef, useState } from 'react'

interface CarModelImageProps {
   src: string
   alt: string
   className?: string
   containerClassName?: string
}

export default function CarModelImage({ src, alt, className, containerClassName }: CarModelImageProps) {
   const [processedSrc, setProcessedSrc] = useState(src)
   const imgRef = useRef<HTMLImageElement>(null)

   useEffect(() => {
      if (!src) return
      setProcessedSrc(src)

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
         try {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
               // Fill white background
               ctx.fillStyle = '#ffffff'
               ctx.fillRect(0, 0, canvas.width, canvas.height)
               // Draw image on top
               ctx.drawImage(img, 0, 0)
               setProcessedSrc(canvas.toDataURL('image/png'))
            }
         } catch {
            // CORS or other error - keep original src
         }
      }
      img.onerror = () => {
         // Keep original src on error
      }
      img.src = src
   }, [src])

   return (
      <div
         className={containerClassName || 'relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-white'}
         style={{ backgroundColor: '#ffffff' }}
      >
         <img
            ref={imgRef}
            src={processedSrc}
            alt={alt || ''}
            className={className || 'absolute inset-0 w-full h-full object-contain p-3'}
            style={{ backgroundColor: '#ffffff' }}
            loading="lazy"
         />
      </div>
   )
}
