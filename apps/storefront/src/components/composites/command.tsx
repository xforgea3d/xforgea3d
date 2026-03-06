'use client'

import { Input } from '@/components/ui/input'
import { Loader2, PackageIcon, SearchIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CommandMenuProps {
   open?: boolean
   onOpenChange?: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
   const router = useRouter()
   const [query, setQuery] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [products, setProducts] = React.useState<any[]>([])
   const inputRef = React.useRef<HTMLInputElement>(null)
   const containerRef = React.useRef<HTMLDivElement>(null)

   // Ctrl+K / Cmd+K
   React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
         if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            onOpenChange?.(!open)
         }
         if (e.key === 'Escape' && open) {
            onOpenChange?.(false)
         }
      }
      document.addEventListener('keydown', down)
      return () => document.removeEventListener('keydown', down)
   }, [open, onOpenChange])

   // Focus input when opened
   React.useEffect(() => {
      if (open) {
         setTimeout(() => inputRef.current?.focus(), 100)
      } else {
         setQuery('')
         setProducts([])
      }
   }, [open])

   // Click outside to close
   React.useEffect(() => {
      if (!open) return
      const handler = (e: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            onOpenChange?.(false)
         }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
   }, [open, onOpenChange])

   // Debounced search
   React.useEffect(() => {
      if (query.length < 2) {
         setProducts([])
         return
      }
      const t = setTimeout(async () => {
         try {
            setLoading(true)
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
            const data = await res.json()
            setProducts(data.products || [])
         } catch {
         } finally {
            setLoading(false)
         }
      }, 400)
      return () => clearTimeout(t)
   }, [query])

   return (
      <div ref={containerRef} className="relative">
         <div className={cn(
            'flex items-center transition-all duration-200 overflow-hidden rounded-md border bg-background',
            open ? 'w-64' : 'w-0 border-transparent'
         )}>
            <SearchIcon className="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground" />
            <Input
               ref={inputRef}
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Ürün ara..."
               className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 text-sm"
            />
            {open && (
               <button onClick={() => onOpenChange?.(false)} className="mr-1 p-1 hover:bg-accent rounded">
                  <X className="h-3 w-3 text-muted-foreground" />
               </button>
            )}
         </div>

         {/* Results dropdown */}
         {open && query.length >= 2 && (
            <div className="absolute right-0 top-full mt-1 w-80 max-h-80 overflow-y-auto rounded-lg border bg-popover shadow-lg z-50">
               {loading ? (
                  <div className="flex items-center justify-center p-4 gap-2">
                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                     <span className="text-sm text-muted-foreground">Aranıyor...</span>
                  </div>
               ) : products.length === 0 ? (
                  <div className="p-4 text-sm text-center text-muted-foreground">
                     Sonuç bulunamadı.
                  </div>
               ) : (
                  <div className="py-1">
                     {products.map((product) => (
                        <button
                           key={product.id}
                           onClick={() => {
                              onOpenChange?.(false)
                              router.push(`/products/${product.id}`)
                           }}
                           className="flex items-center gap-3 w-full px-3 py-2 hover:bg-accent text-left transition-colors"
                        >
                           <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                              {product.images?.[0] ? (
                                 <Image
                                    src={product.images[0]}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                 />
                              ) : (
                                 <PackageIcon className="h-4 w-4 absolute m-auto inset-0 text-muted-foreground" />
                              )}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-medium text-sm truncate">{product.title}</span>
                              <span className="text-xs text-muted-foreground truncate">
                                 {product.categories?.[0]?.title || ''}
                              </span>
                           </div>
                           <span className="text-sm font-semibold flex-shrink-0">
                              {product.price.toFixed(2)}₺
                           </span>
                        </button>
                     ))}
                  </div>
               )}
            </div>
         )}
      </div>
   )
}
