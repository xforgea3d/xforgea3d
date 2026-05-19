import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        // CRITICAL: Accept secret ONLY from Authorization header (not query params)
        // Query params are logged in browser history, server logs, and proxy logs
        const secret = req.headers.get('authorization')?.replace('Bearer ', '')
        const path = searchParams.get('path')
        // Optional scope: 'page' (default) or 'layout' (busts the entire layout tree)
        const scope = searchParams.get('scope') === 'layout' ? 'layout' : 'page'

        // Timing-safe secret check to prevent unauthorized cache purging
        const expected = process.env.REVALIDATION_SECRET
        if (!secret || !expected || secret.length !== expected.length ||
            !crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
            return new NextResponse('Invalid token', { status: 401 })
        }

        if (path) {
            if (process.env.NODE_ENV !== 'test') {
                revalidatePath(path, scope)
            }
            return NextResponse.json({ revalidated: true, path, scope })
        }

        return new NextResponse('Missing path parameter', { status: 400 })
    } catch (err) {
        console.error('[REVALIDATE_POST]', err)
        return new NextResponse('Error revalidating', { status: 500 })
    }
}
