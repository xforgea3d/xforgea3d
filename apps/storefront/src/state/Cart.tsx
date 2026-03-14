'use client'

import { getLocalCart, writeLocalCart } from '@/lib/cart'
import { isVariableValid } from '@/lib/utils'
import { useUserContext } from '@/state/User'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext<{
   cart: any
   loading: boolean
   refreshCart: () => void
   dispatchCart: (object: any) => void
}>({
   cart: null,
   loading: true,
   refreshCart: () => {},
   dispatchCart: () => {},
})

export const useCartContext = () => {
   return useContext(CartContext)
}

export const CartContextProvider = ({ children }) => {
   const { refreshUser, user } = useUserContext() as { refreshUser: () => Promise<void>; user: any }

   const [cart, setCart] = useState<any>(null)
   const [loading, setLoading] = useState(true)

   const dispatchCart = useCallback((newCart: any) => {
      setCart(newCart)
      writeLocalCart(newCart)
   }, [])

   const refreshCart = useCallback(() => {
      setLoading(true)

      if (isVariableValid(user)) {
         setCart((user as any)?.cart)
         writeLocalCart((user as any)?.cart)
      }
      if (!isVariableValid(user)) setCart(getLocalCart())

      setLoading(false)
   }, [user])

   useEffect(() => {
      if (isVariableValid(user)) {
         setCart((user as any)?.cart)
         writeLocalCart((user as any)?.cart)
      }
      if (!isVariableValid(getLocalCart())) writeLocalCart({ items: [] })
      if (!isVariableValid(user)) setCart(getLocalCart())

      setLoading(false)
   }, [user])

   const value = useMemo(
      () => ({ cart, loading, refreshCart, dispatchCart }),
      [cart, loading, refreshCart, dispatchCart]
   )

   return (
      <CartContext.Provider value={value}>
         {children}
      </CartContext.Provider>
   )
}
