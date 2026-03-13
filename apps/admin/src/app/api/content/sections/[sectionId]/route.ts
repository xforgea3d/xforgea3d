import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function PATCH(req: Request, { params }: { params: { sectionId: string } }) {
    try {
        const body = await req.json()
        const allowedFields = ['title_tr', 'content_json', 'is_enabled', 'sort_order'] as const
        const data: Record<string, unknown> = {}
        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key]
        }
        const section = await prisma.homepageSection.update({
            where: { id: params.sectionId },
            data,
        })
        await revalidateAllStorefront()
        return NextResponse.json(section)
    } catch (error) {
        console.error('[SECTION_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: { sectionId: string } }) {
    try {
        await prisma.homepageSection.delete({ where: { id: params.sectionId } })
        await revalidateAllStorefront()
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[SECTION_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
