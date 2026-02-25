'use client'

import { Heading } from '@/components/native/heading'
import { CartContextProvider } from '@/state/Cart'

import { CartGrid } from './components/grid'

export default function Cart() {
   return (
      <div className="py-8">
         <Heading
            title="Sepetiniz"
            description="Sepetinizdeki ürünlerinizi inceleyin ve sipariş verin."
         />
         <CartGrid />
      </div>
   )
}
