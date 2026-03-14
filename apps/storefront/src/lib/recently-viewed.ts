const STORAGE_KEY = 'recently-viewed-products'
const MAX_ITEMS = 10

export function addRecentlyViewed(productId: string): void {
   if (typeof window === 'undefined') return

   try {
      const existing = getRecentlyViewed()
      const filtered = existing.filter((id) => id !== productId)
      filtered.unshift(productId)
      const trimmed = filtered.slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
   } catch {
      // localStorage may be unavailable
   }
}

export function getRecentlyViewed(): string[] {
   if (typeof window === 'undefined') return []

   try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((id): id is string => typeof id === 'string')
   } catch {
      return []
   }
}
