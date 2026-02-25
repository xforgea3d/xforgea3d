'use client'

import { useState } from 'react'
import { ShoppingBasketIcon, ShoppingCartIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartContextProvider, useCartContext } from '@/state/Cart'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { getCountInCart, getLocalCart } from '@/lib/cart'
import toast from 'react-hot-toast'

/**
 * Standalone "Sepete Ekle" button that works directly from the product listing
 * card — no need to enter the product detail page.
 *
 * It fires a global DOM event "cart:added" so CartNav can react with
 * a bounce animation.
 */
export function QuickAddButton({ product }: { product: any }) {
    return (
        <CartContextProvider>
            <QuickAddInner product={product} />
        </CartContextProvider>
    )
}

function QuickAddInner({ product }: { product: any }) {
    const { authenticated } = useAuthenticated()
    const { cart, dispatchCart } = useCartContext()
    const [loading, setLoading] = useState(false)
    const [added, setAdded] = useState(false)

    const maxStock = product?.stock || 0
    const isOutOfStock = maxStock === 0
    const inCart = getCountInCart({ cartItems: cart?.items, productId: product?.id })
    const isMaxReached = inCart >= maxStock

    async function handleAdd(e: React.MouseEvent) {
        e.preventDefault()   // prevent card link navigation
        e.stopPropagation()

        if (isOutOfStock || isMaxReached || loading) return

        try {
            setLoading(true)

            if (authenticated) {
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    body: JSON.stringify({ productId: product?.id, count: inCart + 1 }),
                    headers: { 'Content-Type': 'application/json-string' },
                    cache: 'no-store',
                })
                const json = await res.json()
                dispatchCart(json)
            } else {
                const localCart = getLocalCart() as any
                const existing = localCart.items.findIndex((i: any) => i.productId === product?.id)
                if (existing > -1) {
                    localCart.items[existing].count += 1
                } else {
                    localCart.items.push({ productId: product?.id, product, count: 1 })
                }
                dispatchCart(localCart)
            }

            // Trigger cart icon bounce animation via custom DOM event
            window.dispatchEvent(new CustomEvent('cart:added'))

            // Show toast
            toast.success(`${product?.title || 'Ürün'} sepete eklendi!`, {
                icon: '🛒',
                duration: 2500,
                style: {
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 500,
                },
            })

            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
        } catch (err) {
            console.error(err)
            toast.error('Bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    if (isOutOfStock) {
        return (
            <button
                disabled
                className="w-full mt-2 h-8 text-xs font-medium rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed"
            >
                Tükendi
            </button>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading || isMaxReached}
            className={
                'w-full mt-2 h-8 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ' +
                (added
                    ? 'bg-emerald-500 text-white scale-95'
                    : isMaxReached
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                        : 'bg-foreground text-background hover:opacity-90 active:scale-95')
            }
        >
            {loading ? (
                <span className="h-3.5 w-3.5 border-2 border-background/50 border-t-background rounded-full animate-spin" />
            ) : added ? (
                '✓ Eklendi!'
            ) : (
                <>
                    <ShoppingCartIcon className="h-3.5 w-3.5" />
                    Sepete Ekle
                </>
            )}
        </button>
    )
}
