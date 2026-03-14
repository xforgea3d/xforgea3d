'use client'

import { Heading } from '@/components/native/heading'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

import { CartGrid } from './components/grid'

export default function Cart() {
   return (
      <div className="py-8">
         <nav className="flex text-muted-foreground mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-2">
               <li className="inline-flex items-center">
                  <Link className="text-sm font-medium hover:text-foreground transition-colors" href="/">
                     Ana Sayfa
                  </Link>
               </li>
               <li aria-current="page">
                  <div className="flex items-center gap-2">
                     <ChevronRightIcon className="h-4" />
                     <span className="text-sm font-medium text-foreground">Sepet</span>
                  </div>
               </li>
            </ol>
         </nav>
         <Heading
            title="Sepetiniz"
            description="Sepetinizdeki ürünlerinizi inceleyin ve sipariş verin."
         />
         <CartGrid />
      </div>
   )
}
