import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

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
        const data = await req.json()
        const page = await prisma.contentPage.update({ where: { id: params.pageId }, data })
        await revalidateStorefront([`/page/${page.slug}`, '/'])
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
        if (page?.slug) await revalidateStorefront([`/page/${page.slug}`, '/'])
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[PAGE_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
