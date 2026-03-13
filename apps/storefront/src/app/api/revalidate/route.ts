import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        // Prefer Authorization header; fall back to query param for backward compatibility
        const secret =
            req.headers.get('authorization')?.replace('Bearer ', '') ||
            searchParams.get('secret')
        const path = searchParams.get('path')

        // Simple secret check to prevent unauthorized cache purging
        if (secret !== process.env.REVALIDATION_SECRET) {
            return new NextResponse('Invalid token', { status: 401 })
        }

        if (path) {
            revalidatePath(path)
            return NextResponse.json({ revalidated: true, path })
        }

        return new NextResponse('Missing path parameter', { status: 400 })
    } catch (err) {
        console.error('[REVALIDATE_POST]', err)
        return new NextResponse('Error revalidating', { status: 500 })
    }
}
