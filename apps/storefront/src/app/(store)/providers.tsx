'use client'

import { UserContextProvider } from '@/state/User'
import { CartContextProvider } from '@/state/Cart'

/**
 * Wraps the entire store (all storefront pages) with cart + user state.
 * CRITICAL: Without this wrapper, useCartContext() returns the default
 * empty context and dispatchCart is a no-op — cart stays empty even after
 * QuickAdd calls it. This must live in a 'use client' component.
 */
export function StoreProviders({ children }: { children: React.ReactNode }) {
    return (
        <UserContextProvider>
            <CartContextProvider>
                {children}
            </CartContextProvider>
        </UserContextProvider>
    )
}
