import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET(_: Request, { params }: { params: { pageId: string } }) {
    try {
        const page = await prisma.contentPage.findUnique({ where: { id: params.pageId } })
        if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(page)
    } catch (error) {
        console.error('[PAGE_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: { pageId: string } }) {
    try {
        const body = await req.json()
        const allowedFields = [
            'slug', 'title_tr', 'body_html_tr', 'is_published',
            'seo_title_tr', 'seo_description_tr',
        ] as const
        const data: Record<string, unknown> = {}
        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key]
        }
        // Support legacy field name
        if (body.title && !body.title_tr) data.title_tr = body.title
        const page = await prisma.contentPage.update({ where: { id: params.pageId }, data })
        await revalidateAllStorefront()
        return NextResponse.json(page)
    } catch (error) {
        console.error('[PAGE_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: { pageId: string } }) {
    try {
        const page = await prisma.contentPage.findUnique({ where: { id: params.pageId } })
        await prisma.contentPage.delete({ where: { id: params.pageId } })
        if (page?.slug) await revalidateAllStorefront()
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[PAGE_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
