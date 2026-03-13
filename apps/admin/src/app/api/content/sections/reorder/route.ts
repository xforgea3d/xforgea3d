import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

// POST body: [{ id: string, sort_order: number }]
export async function POST(req: Request) {
    try {
        const items: { id: string; sort_order: number }[] = await req.json()
        await prisma.$transaction(
            items.map(({ id, sort_order }) =>
                prisma.homepageSection.update({ where: { id }, data: { sort_order } })
            )
        )
        await revalidateAllStorefront()
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[SECTIONS_REORDER]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
