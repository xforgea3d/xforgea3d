import prisma from '@/lib/prisma'

type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
type ErrorSource = 'frontend' | 'backend' | 'middleware' | 'payment' | 'external'

interface LogErrorOptions {
   message: string
   stack?: string
   severity?: ErrorSeverity
   source?: ErrorSource
   path?: string
   method?: string
   statusCode?: number
   userAgent?: string
   ip?: string
   userId?: string | null
   metadata?: Record<string, any>
}

export async function logError(opts: LogErrorOptions): Promise<void> {
   try {
      await prisma.error.create({
         data: {
            message: opts.message.slice(0, 2000),
            stack: opts.stack?.slice(0, 10000) || null,
            severity: opts.severity || 'medium',
            source: opts.source || 'backend',
            path: opts.path?.slice(0, 500) || null,
            method: opts.method?.slice(0, 10) || null,
            statusCode: opts.statusCode || null,
            userAgent: opts.userAgent?.slice(0, 500) || null,
            ip: opts.ip?.slice(0, 45) || null,
            userId: opts.userId || null,
            metadata: opts.metadata || null,
         },
      })
   } catch (e) {
      // Never let error logging crash the app
      console.error('[ERROR_LOGGER]', e)
   }
}

// Helper to classify error severity based on status code
export function severityFromStatus(status: number): ErrorSeverity {
   if (status >= 500) return 'critical'
   if (status === 429) return 'low'
   if (status === 403 || status === 401) return 'medium'
   if (status >= 400) return 'low'
   return 'medium'
}

// Helper to extract request context
export function extractRequestContext(req: Request) {
   return {
      path: new URL(req.url).pathname,
      method: req.method,
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userId: req.headers.get('X-USER-ID') || undefined,
   }
}

// Wrap an API route handler with automatic error logging
export function withErrorLogging(
   handler: (req: Request, ctx?: any) => Promise<Response>,
   routeTag: string
) {
   return async (req: Request, ctx?: any): Promise<Response> => {
      try {
         const response = await handler(req, ctx)

         // Log server errors (5xx)
         if (response.status >= 500) {
            const context = extractRequestContext(req)
            await logError({
               message: `[${routeTag}] Server error returned`,
               severity: 'critical',
               source: 'backend',
               statusCode: response.status,
               ...context,
            })
         }

         return response
      } catch (error: any) {
         const context = extractRequestContext(req)
         await logError({
            message: error?.message || `[${routeTag}] Unhandled exception`,
            stack: error?.stack,
            severity: 'critical',
            source: 'backend',
            statusCode: 500,
            ...context,
            metadata: { routeTag },
         })

         console.error(`[${routeTag}]`, error)
         const { NextResponse } = await import('next/server')
         return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 })
      }
   }
}
