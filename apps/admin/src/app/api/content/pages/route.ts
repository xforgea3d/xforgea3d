import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function GET(req: Request) {
    try {
        const pages = await prisma.contentPage.findMany({ orderBy: { updatedAt: 'desc' } })
        return NextResponse.json(pages)
    } catch (error) {
        console.error('[PAGES_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        if (!data.title) return new NextResponse('Title is required', { status: 400 })
        if (!data.slug) return new NextResponse('Slug is required', { status: 400 })

        const page = await prisma.contentPage.create({ data })
        await revalidateStorefront([`/${data.slug}`, '/'])
        return NextResponse.json(page, { status: 201 })
    } catch (error) {
        console.error('[PAGES_POST]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
