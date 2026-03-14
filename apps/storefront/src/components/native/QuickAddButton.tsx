'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCartIcon, SendIcon } from 'lucide-react'
import { useCartContext } from '@/state/Cart'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { useCsrf } from '@/hooks/useCsrf'
import { getCountInCart, getLocalCart } from '@/lib/cart'
import toast from 'react-hot-toast'

/**
 * Standalone "Sepete Ekle" button that works directly from the product listing
 * card without navigating to the product detail page.
 *
 * IMPORTANT: Does NOT wrap its own CartContextProvider.
 * It uses the CartContext already provided by the root layout tree.
 * This ensures dispatchCart updates the SAME cart that CartNav reads.
 */
export function QuickAddButton({ product }: { product: any }) {
    const router = useRouter()
    const { authenticated } = useAuthenticated()
    const csrfToken = useCsrf()
    const { cart, dispatchCart } = useCartContext()
    const [loading, setLoading] = useState(false)
    const [added, setAdded] = useState(false)
    // Mount guard — prevents localStorage read on SSR
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    if (!mounted) {
        return (
            <button disabled className="w-full h-10 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                Sepete Ekle
            </button>
        )
    }

    const maxStock = product?.stock ?? 0
    const isOutOfStock = maxStock === 0 || !product?.isAvailable
    const cartItems = cart?.items ?? []
    const inCart = getCountInCart({ cartItems, productId: product?.id })
    const isMaxReached = maxStock > 0 && inCart >= maxStock

    async function handleAdd(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (isOutOfStock || isMaxReached || loading) return

        try {
            setLoading(true)

            if (authenticated) {
                const res = await fetch('/api/cart', {
                    method: 'POST',
                    body: JSON.stringify({ productId: product?.id, count: inCart + 1, csrfToken }),
                    headers: {
                        'Content-Type': 'application/json',
                        ...(csrfToken && { 'x-csrf-token': csrfToken }),
                    },
                    cache: 'no-store',
                })
                if (!res.ok) throw new Error('Cart API error')
                const json = await res.json()
                dispatchCart(json)
            } else {
                const localCart = getLocalCart() ?? { items: [] }
                const existing = (localCart.items ?? []).findIndex((i: any) => i.productId === product?.id)
                if (existing > -1) {
                    localCart.items[existing].count += 1
                } else {
                    localCart.items.push({ productId: product?.id, product, count: 1 })
                }
                dispatchCart({ ...localCart })
            }

            // Animate the cart icon
            window.dispatchEvent(new CustomEvent('cart:added'))

            toast.success(`${product?.title || 'Ürün'} sepete eklendi!`, {
                icon: '🛒',
                duration: 2500,
                style: { borderRadius: '12px', fontSize: '13px', fontWeight: 500 },
            })

            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
        } catch (err) {
            console.error(err)
            toast.error('Bir hata oluştu, tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    if (isOutOfStock) {
        return (
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const params = new URLSearchParams()
                    if (product?.title) params.set('product', product.title)
                    if (product?.id) params.set('productId', product.id)
                    router.push(`/quote-request?${params.toString()}`)
                }}
                className="w-full h-10 text-xs font-semibold rounded-lg border-2 border-orange-500 text-orange-600 dark:text-orange-400 bg-transparent hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200 flex items-center justify-center gap-1.5"
            >
                <SendIcon className="h-3.5 w-3.5" />
                Talep Et
            </button>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading || isMaxReached}
            className={
                'w-full h-10 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ' +
                (added
                    ? 'bg-emerald-500 text-white scale-95'
                    : isMaxReached
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                        : 'bg-foreground text-background hover:opacity-90 active:scale-95')
            }
        >
            {loading ? (
                <span className="h-3.5 w-3.5 border-2 border-background/50 border-t-background rounded-full animate-spin" />
            ) : added ? '✓ Eklendi!' : (
                <>
                    <ShoppingCartIcon className="h-3.5 w-3.5" />
                    Sepete Ekle
                </>
            )}
        </button>
    )
}
