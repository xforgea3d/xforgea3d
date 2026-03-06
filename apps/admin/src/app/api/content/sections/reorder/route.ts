import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

// POST body: [{ id: string, sort_order: number }]
export async function POST(req: Request) {
    try {
        const items: { id: string; sort_order: number }[] = await req.json()
        await Promise.all(
            items.map(({ id, sort_order }) =>
                prisma.homepageSection.update({ where: { id }, data: { sort_order } })
            )
        )
        await revalidateStorefront(['/'])
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[SECTIONS_REORDER]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
