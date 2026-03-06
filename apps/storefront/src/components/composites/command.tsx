'use client'

import {
   CommandDialog,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command'
import { Loader2, PackageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import Image from 'next/image'

interface CommandMenuProps {
   open?: boolean
   onOpenChange?: (open: boolean) => void
}

export function CommandMenu({ open: controlledOpen, onOpenChange }: CommandMenuProps) {
   const router = useRouter()
   const [internalOpen, setInternalOpen] = React.useState(false)
   const [query, setQuery] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [products, setProducts] = React.useState<any[]>([])

   const isOpen = controlledOpen ?? internalOpen
   const setOpen = onOpenChange ?? setInternalOpen

   // Ctrl+K / Cmd+K
   React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
         if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            setOpen(!isOpen)
         }
      }
      document.addEventListener('keydown', down)
      return () => document.removeEventListener('keydown', down)
   }, [isOpen, setOpen])

   // Debounced search
   React.useEffect(() => {
      if (query.length < 2) {
         setProducts([])
         return
      }

      const delayDebounceFn = setTimeout(async () => {
         try {
            setLoading(true)
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
            const data = await res.json()
            setProducts(data.products || [])
         } catch (error) {
            console.error("Arama hatası", error)
         } finally {
            setLoading(false)
         }
      }, 400)

      return () => clearTimeout(delayDebounceFn)
   }, [query])

   const runCommand = React.useCallback((command: () => unknown) => {
      setOpen(false)
      command()
   }, [setOpen])

   return (
      <CommandDialog open={isOpen} onOpenChange={setOpen}>
         <CommandInput
            placeholder="Ürün ara..."
            value={query}
            onValueChange={setQuery}
         />
         <CommandList>
            <CommandEmpty>
               {loading ? (
                  <div className="flex items-center justify-center p-4">
                     <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                     <span className="text-sm">Aranıyor...</span>
                  </div>
               ) : (
                  query.length > 1 ? 'Sonuç bulunamadı.' : 'Aramaya başlamak için yazın.'
               )}
            </CommandEmpty>

            {products.length > 0 && (
               <CommandGroup heading="Ürünler">
                  {products.map((product) => (
                     <CommandItem
                        key={product.id}
                        value={product.title}
                        onSelect={() => {
                           runCommand(() => router.push(`/products/${product.id}`))
                        }}
                        className="flex items-center gap-3 cursor-pointer p-2"
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
                        <div className="flex flex-col flex-1">
                           <span className="font-medium text-sm line-clamp-1">{product.title}</span>
                           <span className="text-xs text-muted-foreground line-clamp-1">
                              {product.categories?.[0]?.title || ''}
                           </span>
                        </div>
                        <div className="text-sm font-semibold">
                           {product.price.toFixed(2)}₺
                        </div>
                     </CommandItem>
                  ))}
               </CommandGroup>
            )}
         </CommandList>
      </CommandDialog>
   )
}
