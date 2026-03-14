'use client'

import { cn } from '@/lib/utils'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, ImageOffIcon } from 'lucide-react'
import dynamic from 'next/dynamic'

const ProductLightbox = dynamic(() => import('./ProductLightbox'), { ssr: false })

// ─── Magnifier Lens ──────────────────────────────────────────────────────────
function MagnifierLens({
   src,
   containerRef,
}: {
   src: string
   containerRef: React.RefObject<HTMLDivElement>
}) {
   const lensRef = useRef<HTMLDivElement>(null)
   const [pos, setPos] = useState({ x: 0, y: 0, show: false })
   const rafRef = useRef<number>(0)

   const LENS_SIZE = 130   // px — diameter of the circular lens
   const ZOOM = 2.8        // magnification factor

   const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      cancelAnimationFrame(rafRef.current)
      const clientX = e.clientX
      const clientY = e.clientY
      rafRef.current = requestAnimationFrame(() => {
         const rect = containerRef.current?.getBoundingClientRect()
         if (!rect) return
         setPos({ x: clientX - rect.left, y: clientY - rect.top, show: true })
      })
   }, [containerRef])

   const handleLeave = useCallback(() => setPos(p => ({ ...p, show: false })), [])

   const bgX = -(pos.x * ZOOM - LENS_SIZE / 2)
   const bgY = -(pos.y * ZOOM - LENS_SIZE / 2)

   return (
      <div
         className="absolute inset-0 z-20"
         onMouseMove={handleMove}
         onMouseLeave={handleLeave}
         style={{ cursor: pos.show ? 'none' : 'default' }}
      >
         {pos.show && (
            <div
               ref={lensRef}
               className="pointer-events-none absolute rounded-full border-2 border-white/60 shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
               style={{
                  width: LENS_SIZE,
                  height: LENS_SIZE,
                  left: pos.x - LENS_SIZE / 2,
                  top: pos.y - LENS_SIZE / 2,
                  backgroundImage: `url(${src})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${containerRef.current!.offsetWidth * ZOOM}px ${containerRef.current!.offsetHeight * ZOOM}px`,
                  backgroundPosition: `${bgX}px ${bgY}px`,
               }}
            />
         )}
      </div>
   )
}

// ─── Main Carousel ─────────────────────────────────────────────────────────
export default function Carousel({ images, disableZoom = false }: { images: string[]; disableZoom?: boolean }) {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      { loop: true, dragFree: false },
      [Autoplay({ delay: 5000, stopOnInteraction: true })]
   )
   const containerRef = useRef<HTMLDivElement>(null)
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [canPrev, setCanPrev] = useState(false)
   const [canNext, setCanNext] = useState(false)
   const [lightboxOpen, setLightboxOpen] = useState(false)
   const [lightboxMounted, setLightboxMounted] = useState(false)

   const updateButtons = useCallback(() => {
      if (!emblaApi) return
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
   }, [emblaApi])

   const onSelect = useCallback(() => {
      if (!emblaApi) return
      setSelectedIndex(emblaApi.selectedScrollSnap())
      updateButtons()
   }, [emblaApi, updateButtons])

   useEffect(() => {
      if (!emblaApi) return
      emblaApi.on('select', onSelect)
      emblaApi.on('reInit', onSelect)
      onSelect()
      return () => { emblaApi.off('select', onSelect) }
   }, [emblaApi, onSelect])

   const openLightbox = () => {
      setLightboxMounted(true)
      setLightboxOpen(true)
   }

   // Filter out empty / placeholder URLs that are known to be broken
   const validImages = (images ?? []).filter(
      (src) => typeof src === 'string' && src.length > 1
   )

   if (!validImages.length) {
      return (
         <div className="flex flex-col items-center justify-center h-[280px] rounded-xl border border-dashed border-border bg-neutral-50 dark:bg-neutral-900/50">
            <ImageOffIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Henüz görsel eklenmedi.</p>
         </div>
      )
   }

   const currentSrc = validImages[selectedIndex] ?? validImages[0]

   return (
      <>
         {/* ── Carousel wrapper ───────────────────────────────────────── */}
         <div className="relative group" ref={containerRef}>
            <div className="overflow-hidden rounded-xl" ref={emblaRef}>
               <div className="flex touch-pan-y">
                  {validImages.map((src, i) => (
                     <div
                        key={i}
                        className={cn(
                           "relative flex-[0_0_100%] bg-neutral-100 dark:bg-neutral-900 select-none",
                           disableZoom ? "h-[400px] max-h-[400px]" : "h-[420px]"
                        )}
                     >
                        <img
                           src={src}
                           className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                           alt={`Product image ${i + 1}`}
                           loading={i === 0 ? 'eager' : 'lazy'}
                           draggable={false}
                           onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = 'none'
                              // Show fallback sibling
                              const fallback = img.parentElement?.querySelector('[data-img-fallback]') as HTMLElement | null
                              if (fallback) fallback.style.display = 'flex'
                           }}
                        />
                        {/* Fallback shown when image fails to load */}
                        <div
                           data-img-fallback
                           className="absolute inset-0 items-center justify-center flex-col gap-2"
                           style={{ display: 'none' }}
                        >
                           <ImageOffIcon className="h-8 w-8 text-muted-foreground/30" />
                           <span className="text-xs text-muted-foreground/50">Gorsel yuklenemedi</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* ── Hover Magnifier Lens — only on desktop, disabled for banners ── */}
            {!disableZoom && (
               <div className="hidden md:block">
                  <MagnifierLens src={currentSrc} containerRef={containerRef} />
               </div>
            )}

            {/* ── Prev / Next arrows ────────────────────────────────── */}
            {validImages.length > 1 && (
               <>
                  <button
                     onClick={() => emblaApi?.scrollPrev()}
                     className="absolute left-2 top-1/2 -translate-y-1/2 z-30 h-9 w-9 flex items-center justify-center rounded-full bg-background/80 border border-border backdrop-blur shadow-sm hover:bg-background transition-all opacity-60 group-hover:opacity-100 disabled:opacity-30"
                  >
                     <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                     onClick={() => emblaApi?.scrollNext()}
                     className="absolute right-2 top-1/2 -translate-y-1/2 z-30 h-9 w-9 flex items-center justify-center rounded-full bg-background/80 border border-border backdrop-blur shadow-sm hover:bg-background transition-all opacity-60 group-hover:opacity-100 disabled:opacity-30"
                  >
                     <ChevronRightIcon className="h-4 w-4" />
                  </button>
               </>
            )}

            {/* ── Click-to-open lightbox hint ───────────────────────── */}
            {!disableZoom && (
               <button
                  onClick={openLightbox}
                  className="absolute bottom-3 right-3 z-30 hidden md:flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground shadow border border-border opacity-60 group-hover:opacity-100 transition-opacity"
               >
                  <SearchIcon className="w-3.5 h-3.5" />
                  Büyüt
               </button>
            )}
         </div>

         {/* ── Thumbnail strip ─────────────────────────────────────── */}
         {validImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 justify-center">
               {validImages.map((src, i) => (
                  <button
                     key={i}
                     onClick={() => emblaApi?.scrollTo(i)}
                     className={cn(
                        'relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200',
                        i === selectedIndex
                           ? 'border-foreground opacity-100 scale-105'
                           : 'border-transparent opacity-50 hover:opacity-80'
                     )}
                  >
                     <img src={src} className="absolute inset-0 h-full w-full object-cover" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </button>
               ))}
            </div>
         )}

         {/* ── Dot indicators (mobile only) ────────────────────────── */}
         {validImages.length > 1 && (
            <div className="flex md:hidden justify-center gap-2 py-2">
               {validImages.map((_, i) => (
                  <button
                     key={i}
                     onClick={() => emblaApi?.scrollTo(i)}
                     className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        i === selectedIndex
                           ? 'w-6 bg-foreground'
                           : 'w-1.5 bg-foreground/30 hover:bg-foreground/60'
                     )}
                     aria-label={`Slide ${i + 1}`}
                  />
               ))}
            </div>
         )}

         {/* ── Lightbox — lazy mounted on first click ──────────────── */}
         {lightboxMounted && (
            <ProductLightbox
               images={validImages}
               initialIndex={selectedIndex}
               open={lightboxOpen}
               onClose={() => setLightboxOpen(false)}
               onIndexChange={(i) => {
                  setSelectedIndex(i)
                  emblaApi?.scrollTo(i)
               }}
            />
         )}
      </>
   )
}
