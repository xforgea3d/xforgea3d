import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET(req: Request) {
    try {
        const pages = await prisma.contentPage.findMany({ take: 200, orderBy: { updatedAt: 'desc' } })
        return NextResponse.json(pages)
    } catch (error) {
        console.error('[PAGES_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        if (!body.title_tr && !body.title) return new NextResponse('Title is required', { status: 400 })
        if (!body.slug) return new NextResponse('Slug is required', { status: 400 })
        if (!/^[a-z0-9-]+$/.test(body.slug)) return new NextResponse('Invalid slug format', { status: 400 })

        const allowedFields = [
            'slug', 'title_tr', 'body_html_tr', 'is_published',
            'seo_title_tr', 'seo_description_tr',
        ] as const
        const data: Record<string, unknown> = {}
        // Map title to title_tr (the actual schema field)
        data.title_tr = body.title_tr || body.title
        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key]
        }

        const page = await prisma.contentPage.create({ data: data as any })
        await revalidateAllStorefront()
        return NextResponse.json(page, { status: 201 })
    } catch (error) {
        console.error('[PAGES_POST]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
