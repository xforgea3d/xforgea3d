'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { useCsrf } from '@/hooks/useCsrf'
import { getCountInCart, getLocalCart, writeLocalCart } from '@/lib/cart'
import { useCartContext } from '@/state/Cart'
import {
    MinusIcon,
    PlusIcon,
    ShoppingBasketIcon,
    ShoppingBag,
    Trash2,
    X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'

export function CartNav() {
    const { cart, dispatchCart } = useCartContext()
    const { authenticated } = useAuthenticated()
    const csrfToken = useCsrf()
    const items = cart?.items || []
    const itemCount = items.reduce((total, item) => total + (item.count || 0), 0)
    const [busyItems, setBusyItems] = useState<Set<string>>(new Set())
    const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

    // Bounce animation state -- triggered by cart:added custom event
    const [bouncing, setBouncing] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    useEffect(() => {
        const handleCartAdded = () => {
            setBouncing(true)
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => setBouncing(false), 700)
        }
        window.addEventListener('cart:added', handleCartAdded)
        return () => {
            window.removeEventListener('cart:added', handleCartAdded)
            clearTimeout(timeoutRef.current)
        }
    }, [])

    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    // ---- Cart manipulation helpers ----

    const markBusy = (productId: string, busy: boolean) => {
        setBusyItems((prev) => {
            const next = new Set(prev)
            busy ? next.add(productId) : next.delete(productId)
            return next
        })
    }

    const animateRemoval = (productId: string) => {
        return new Promise<void>((resolve) => {
            setRemovingItems((prev) => new Set(prev).add(productId))
            setTimeout(() => {
                setRemovingItems((prev) => {
                    const next = new Set(prev)
                    next.delete(productId)
                    return next
                })
                resolve()
            }, 250)
        })
    }

    const updateCartItem = useCallback(
        async (productId: string, newCount: number) => {
            markBusy(productId, true)
            try {
                if (authenticated) {
                    const response = await fetch('/api/cart', {
                        method: 'POST',
                        body: JSON.stringify({ productId, count: newCount, csrfToken }),
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(csrfToken && { 'x-csrf-token': csrfToken }),
                        },
                    })
                    const json = await response.json()
                    dispatchCart(json)
                } else {
                    const localCart = getLocalCart() as any
                    if (newCount < 1) {
                        localCart.items = localCart.items.filter(
                            (i: any) => i.productId !== productId
                        )
                    } else {
                        const idx = localCart.items.findIndex(
                            (i: any) => i.productId === productId
                        )
                        if (idx !== -1) {
                            localCart.items[idx].count = newCount
                        }
                    }
                    dispatchCart(localCart)
                }
            } catch (error) {
                console.error('Cart update error:', error)
            } finally {
                markBusy(productId, false)
            }
        },
        [authenticated, csrfToken, dispatchCart]
    )

    const handleRemoveItem = useCallback(
        async (e: React.MouseEvent, productId: string) => {
            e.stopPropagation()
            e.preventDefault()
            await animateRemoval(productId)
            await updateCartItem(productId, 0)
        },
        [updateCartItem]
    )

    const handleDecrement = useCallback(
        async (e: React.MouseEvent, productId: string, currentCount: number) => {
            e.stopPropagation()
            e.preventDefault()
            if (currentCount <= 1) {
                await animateRemoval(productId)
                await updateCartItem(productId, 0)
            } else {
                await updateCartItem(productId, currentCount - 1)
            }
        },
        [updateCartItem]
    )

    const handleIncrement = useCallback(
        async (e: React.MouseEvent, productId: string, currentCount: number) => {
            e.stopPropagation()
            e.preventDefault()
            await updateCartItem(productId, currentCount + 1)
        },
        [updateCartItem]
    )

    const handleClearCart = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
            // Remove each item
            for (const item of items) {
                if (authenticated) {
                    await fetch('/api/cart', {
                        method: 'POST',
                        body: JSON.stringify({
                            productId: item.productId,
                            count: 0,
                            csrfToken,
                        }),
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(csrfToken && { 'x-csrf-token': csrfToken }),
                        },
                    })
                }
            }
            const emptyCart = { items: [] }
            dispatchCart(emptyCart)
        },
        [items, authenticated, csrfToken, dispatchCart]
    )

    // Subtotal
    const subtotal = items.reduce((sum, item) => {
        const price = item.product?.discount
            ? item.product.price - item.product.discount
            : item.product?.price || 0
        return sum + price * (item.count || 0)
    }, 0)

    if (!mounted) {
        return (
            <button className="flex outline-none relative hover:opacity-80 transition-opacity">
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm">
                    <ShoppingBasketIcon className="h-4 w-4" />
                </span>
            </button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex outline-none relative hover:opacity-80 transition-opacity">
                    <span
                        className={
                            'flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm transition-transform duration-150 ' +
                            (bouncing ? 'scale-125' : 'scale-100')
                        }
                    >
                        <ShoppingBasketIcon
                            className={
                                'h-4 w-4 transition-all duration-300 ' +
                                (bouncing ? 'text-emerald-500 scale-110' : '')
                            }
                        />
                        {itemCount > 0 && (
                            <span
                                className={
                                    'absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ' +
                                    (bouncing
                                        ? 'bg-emerald-500 text-white scale-125 ring-2 ring-emerald-500/30'
                                        : 'bg-foreground text-background')
                                }
                            >
                                {itemCount}
                            </span>
                        )}
                        {/* Ripple halo on add */}
                        {bouncing && (
                            <span className="absolute inset-0 rounded-md animate-ping bg-emerald-400/30 pointer-events-none" />
                        )}
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-[calc(100vw-2rem)] sm:w-80 p-0"
                align="end"
                sideOffset={8}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-2">
                    <h4 className="font-semibold text-sm">
                        Sepetiniz{' '}
                        <span className="text-muted-foreground font-normal">
                            ({itemCount} ürün)
                        </span>
                    </h4>
                </div>
                <DropdownMenuSeparator className="mb-0" />

                {/* Items list */}
                <DropdownMenuGroup className="max-h-72 overflow-y-auto py-2 px-2 flex flex-col gap-1">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <ShoppingBag className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm font-medium">Sepetiniz boş</p>
                            <p className="text-xs mt-1">Alışverişe başlayın!</p>
                        </div>
                    ) : (
                        items.map((item, index) => {
                            const productId = item.productId
                            const isBusy = busyItems.has(productId)
                            const isRemoving = removingItems.has(productId)
                            const effectivePrice = item.product?.discount
                                ? item.product.price - item.product.discount
                                : item.product?.price || 0
                            const lineTotal = effectivePrice * (item.count || 0)

                            return (
                                <div
                                    key={`${productId}-${index}`}
                                    className={
                                        'group relative flex gap-3 items-center rounded-lg p-2 transition-all duration-250 hover:bg-muted/50 ' +
                                        (isRemoving
                                            ? 'opacity-0 scale-95 -translate-x-4'
                                            : 'opacity-100 scale-100 translate-x-0')
                                    }
                                    style={{
                                        transitionProperty: 'opacity, transform',
                                    }}
                                >
                                    {/* Product image */}
                                    <Link
                                        href={`/products/${item.product?.id || productId}`}
                                        className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.product?.images?.[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product?.title || 'Urun'}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                                                <ShoppingBag className="h-4 w-4 text-neutral-400" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Product info */}
                                    <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                                        <span className="text-sm font-medium truncate leading-tight">
                                            {item.product?.title || 'Urun'}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-0.5">
                                            {effectivePrice.toFixed(2)} TL
                                        </span>
                                    </div>

                                    {/* Quantity controls */}
                                    <div
                                        className="flex items-center gap-0.5 flex-shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className="h-8 w-8 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-40"
                                            onClick={(e) =>
                                                handleDecrement(e, productId, item.count)
                                            }
                                            disabled={isBusy}
                                            aria-label="Adet azalt"
                                        >
                                            {item.count <= 1 ? (
                                                <X className="h-3 w-3" />
                                            ) : (
                                                <MinusIcon className="h-3 w-3" />
                                            )}
                                        </button>
                                        <span className="text-xs font-semibold w-6 text-center tabular-nums">
                                            {isBusy ? (
                                                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                                item.count
                                            )}
                                        </span>
                                        <button
                                            className="h-8 w-8 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-40"
                                            onClick={(e) =>
                                                handleIncrement(e, productId, item.count)
                                            }
                                            disabled={isBusy}
                                            aria-label="Adet artir"
                                        >
                                            <PlusIcon className="h-3 w-3" />
                                        </button>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-40"
                                        onClick={(e) => handleRemoveItem(e, productId)}
                                        disabled={isBusy}
                                        aria-label="Urunu kaldir"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </DropdownMenuGroup>

                {/* Footer: subtotal + actions */}
                {items.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="mt-0" />
                        <div className="px-4 py-3 space-y-3">
                            {/* Subtotal */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Ara Toplam
                                </span>
                                <span className="text-sm font-semibold">
                                    {subtotal.toFixed(2)} TL
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                    onClick={handleClearCart}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Sepeti Temizle
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 text-xs h-8"
                                    asChild
                                >
                                    <Link href="/cart">Sepete Git</Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty state CTA */}
                {items.length === 0 && (
                    <div className="px-4 pb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8"
                            asChild
                        >
                            <Link href="/products">Ürünleri Keşfet</Link>
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
