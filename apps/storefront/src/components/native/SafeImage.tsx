'use client'

import { useState, useCallback } from 'react'
import { ImageSkeleton } from '@/components/native/icons'

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
   fallbackClassName?: string
}

/**
 * A client-side <img> wrapper that gracefully handles broken / unreachable
 * image URLs by swapping in an ImageSkeleton placeholder on error.
 */
export default function SafeImage({
   src,
   alt,
   fallbackClassName,
   className,
   ...rest
}: SafeImageProps) {
   const [failed, setFailed] = useState(false)

   const handleError = useCallback(() => setFailed(true), [])

   if (failed || !src) {
      return (
         <div className={fallbackClassName ?? 'flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800'}>
            <ImageSkeleton />
         </div>
      )
   }

   return (
      <img
         src={src}
         alt={alt}
         className={className}
         onError={handleError}
         {...rest}
      />
   )
}
