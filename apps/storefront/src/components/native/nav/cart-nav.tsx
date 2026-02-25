'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartContext } from '@/state/Cart'
import { ShoppingBasketIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export function CartNav() {
    const { cart } = useCartContext()
    const items = cart?.items || []
    const itemCount = items.reduce((total, item) => total + (item.count || 0), 0)

    // Bounce animation state — triggered by cart:added custom event
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className={
                        'h-9 relative transition-transform duration-150 ' +
                        (bouncing ? 'scale-125' : 'scale-100')
                    }
                >
                    <ShoppingBasketIcon
                        className={
                            'h-4 transition-all duration-300 ' +
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
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 p-4" align="end">
                <h4 className="font-semibold mb-3">Sepetiniz ({itemCount} ürün)</h4>
                <DropdownMenuSeparator />

                <DropdownMenuGroup className="max-h-64 overflow-y-auto py-2 flex flex-col gap-3">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Sepetiniz boş.</p>
                    ) : (
                        items.map((item, index) => (
                            <div key={index} className="flex gap-3 items-center">
                                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {item.product?.images?.[0] ? (
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-200" />
                                    )}
                                </div>
                                <div className="flex flex-col overflow-hidden flex-1">
                                    <span className="text-sm font-medium truncate">{item.product?.title || 'Ürün'}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.count} adet × {item.product?.price} ₺
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-3" />

                <Button className="w-full" asChild>
                    <Link href="/cart">Sepete Git</Link>
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
