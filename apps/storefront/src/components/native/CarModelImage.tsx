'use client'

interface CarModelImageProps {
   src: string
   alt: string
   className?: string
   containerClassName?: string
}

export default function CarModelImage({ src, alt, className, containerClassName }: CarModelImageProps) {
   return (
      <div className={containerClassName || 'relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-white'}>
         <img
            src={src}
            alt={alt || ''}
            className={className || 'absolute inset-0 w-full h-full object-contain p-3'}
            loading="lazy"
         />
      </div>
   )
}
