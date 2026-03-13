'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Product } from './Product'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FeaturedProductsCarouselProps {
   products: any[]
}

export default function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: true,
         align: 'start',
         slidesToScroll: 1,
         containScroll: 'trimSnaps',
      },
      [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
   )

   const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
   const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

   return (
      <div className="relative group/carousel">
         {/* Carousel viewport */}
         <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
               {products.map((product) => (
                  <div
                     key={product.id}
                     className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] xl:flex-[0_0_25%] min-w-0 pl-4"
                  >
                     <Product product={product} />
                  </div>
               ))}
            </div>
         </div>

         {/* Navigation arrows */}
         <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-background/90 border shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-background hover:scale-110"
            aria-label="Previous slide"
         >
            <ChevronLeft className="h-5 w-5" />
         </button>
         <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-background/90 border shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 hover:bg-background hover:scale-110"
            aria-label="Next slide"
         >
            <ChevronRight className="h-5 w-5" />
         </button>
      </div>
   )
}
