/**
 * Simple in-memory rate limiter for serverless.
 * Not distributed — works per-instance. Good enough for Vercel's auto-scaling.
 */
const hits = new Map<string, { count: number; resetAt: number }>()

// Cleanup stale entries every 60s
setInterval(() => {
   const now = Date.now()
   for (const [key, val] of hits) {
      if (val.resetAt < now) hits.delete(key)
   }
}, 60_000)

export function rateLimit(
   key: string,
   limit: number = 10,
   windowMs: number = 60_000
): { ok: boolean; remaining: number } {
   const now = Date.now()
   const entry = hits.get(key)

   if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs })
      return { ok: true, remaining: limit - 1 }
   }

   entry.count++

   if (entry.count > limit) {
      return { ok: false, remaining: 0 }
   }

   return { ok: true, remaining: limit - entry.count }
}
