/**
 * revalidate-storefront.ts
 *
 * Calls the storefront's /api/revalidate webhook so that the storefront's
 * ISR cache is immediately busted after any admin mutation.
 *
 * The storefront runs on a DIFFERENT Next.js process, so calling Next.js's
 * own `revalidatePath()` inside the admin app does NOT affect the storefront.
 * This HTTP call is the only correct cross-app invalidation mechanism.
 */

const STOREFRONT_URL =
    process.env.STOREFRONT_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:7777' : '')

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET
if (!REVALIDATION_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('[REVALIDATION] REVALIDATION_SECRET env var is not set!')
}

/**
 * Revalidate a single path with retry logic.
 * Retries up to {@link MAX_RETRIES} times with exponential back-off.
 */
async function revalidateWithRetry(path: string): Promise<void> {
    const MAX_RETRIES = 3
    const BASE_DELAY_MS = 500

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(
                `${STOREFRONT_URL}/api/revalidate?path=${encodeURIComponent(path)}`,
                {
                    method: 'POST',
                    cache: 'no-store',
                    signal: AbortSignal.timeout(5000),
                    headers: {
                        'Authorization': `Bearer ${REVALIDATION_SECRET}`,
                    },
                }
            )
            if (res.ok) return
            console.error(`[STOREFRONT_REVALIDATE] HTTP ${res.status} for "${path}" (attempt ${attempt + 1})`)
        } catch (err) {
            console.error(`[STOREFRONT_REVALIDATE] Failed for "${path}" (attempt ${attempt + 1}):`, err)
        }
        if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, BASE_DELAY_MS * 2 ** attempt))
        }
    }
    console.error(`[STOREFRONT_REVALIDATE] All retries exhausted for "${path}"`)
}

/**
 * Revalidate one or more storefront paths.
 * Fires all requests in parallel with retry logic. Swallows errors so
 * admin mutations are never blocked by a failed webhook.
 */
export async function revalidateStorefront(paths: string[]): Promise<void> {
    if (!STOREFRONT_URL || !REVALIDATION_SECRET) return

    await Promise.allSettled(paths.map((path) => revalidateWithRetry(path)))
}

/**
 * All storefront paths that should be revalidated after any admin mutation
 * that affects publicly visible data (navbar, products, categories, etc.).
 */
const ALL_STOREFRONT_PATHS = [
    '/',
    '/products',
    '/api/categories',
    '/api/car-brands',
    '/api/collections',
    '/api/nav-items',
    '/api/products',
    '/api/search',
    '/api/maintenance-status',
]

/**
 * Convenience function: revalidates ALL common storefront paths including
 * API routes used by the navbar and other client-side components.
 *
 * Use this from any admin mutation that changes data visible on the storefront.
 */
export async function revalidateAllStorefront(): Promise<void> {
    return revalidateStorefront(ALL_STOREFRONT_PATHS)
}
