/**
 * Google Ads / GA4 Conversion Tracking Helpers
 *
 * These functions fire gtag events when the Google Analytics script is loaded.
 * If gtag is not available (e.g., no consent or no GA ID), they silently no-op.
 */

function gtag(...args: any[]) {
   if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag(...args)
   }
}

export function trackPurchase(orderId: string, value: number) {
   gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'TRY',
   })
}

export function trackAddToCart(productId: string, productName: string, value: number) {
   gtag('event', 'add_to_cart', {
      items: [{ item_id: productId, item_name: productName, price: value, currency: 'TRY' }],
   })
}

export function trackBeginCheckout(value: number) {
   gtag('event', 'begin_checkout', {
      value: value,
      currency: 'TRY',
   })
}

export function trackViewItem(productId: string, productName: string, value: number) {
   gtag('event', 'view_item', {
      items: [{ item_id: productId, item_name: productName, price: value, currency: 'TRY' }],
   })
}
