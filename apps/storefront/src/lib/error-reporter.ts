const ERROR_LOG_URL = '/api/error-logs'
const DEBOUNCE_MS = 1000
const MAX_ERRORS_PER_MINUTE = 10

let errorCount = 0
let resetTimer: ReturnType<typeof setTimeout> | null = null
const reportedErrors = new Set<string>()

function getErrorFingerprint(message: string, stack?: string): string {
   return `${message}::${(stack || '').split('\n')[0]}`
}

export async function reportError(opts: {
   message: string
   stack?: string
   severity?: 'low' | 'medium' | 'high' | 'critical'
   source?: 'frontend' | 'backend'
   path?: string
   metadata?: Record<string, any>
}): Promise<void> {
   try {
      // Rate limit
      if (errorCount >= MAX_ERRORS_PER_MINUTE) return
      errorCount++
      if (!resetTimer) {
         resetTimer = setTimeout(() => { errorCount = 0; resetTimer = null }, 60_000)
      }

      // Deduplicate
      const fingerprint = getErrorFingerprint(opts.message, opts.stack)
      if (reportedErrors.has(fingerprint)) return
      reportedErrors.add(fingerprint)
      // Clean up after 5 minutes
      setTimeout(() => reportedErrors.delete(fingerprint), 5 * 60_000)

      await fetch(ERROR_LOG_URL, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            message: opts.message,
            stack: opts.stack,
            severity: opts.severity || 'medium',
            source: opts.source || 'frontend',
            path: opts.path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
            metadata: {
               ...opts.metadata,
               url: typeof window !== 'undefined' ? window.location.href : undefined,
               timestamp: new Date().toISOString(),
            },
         }),
      }).catch(() => {
         // Silently fail - don't create error loops
      })
   } catch {
      // Never throw from error reporter
   }
}

// Classify fetch response errors
export function reportApiError(url: string, status: number, body?: string): void {
   let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
   if (status >= 500) severity = 'critical'
   else if (status === 403 || status === 401) severity = 'medium'
   else if (status >= 400) severity = 'low'

   reportError({
      message: `API Error: ${status} ${url}`,
      severity,
      source: 'frontend',
      metadata: { apiUrl: url, statusCode: status, responseBody: body?.slice(0, 500) },
   })
}
