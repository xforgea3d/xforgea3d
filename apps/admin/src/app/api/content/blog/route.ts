import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateAllStorefront } from '@/lib/revalidate-storefront'

export async function GET(req: Request) {
    try {
        const posts = await prisma.blogPost.findMany({ take: 200, orderBy: { updatedAt: 'desc' } })
        return NextResponse.json(posts)
    } catch (error) {
        console.error('[BLOG_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        if (!body.title_tr && !body.title) return new NextResponse('Title is required', { status: 400 })

        const allowedFields = [
            'title_tr', 'slug', 'excerpt_tr', 'body_html_tr', 'cover_image_url',
            'tags', 'status', 'seo_title_tr', 'seo_description_tr',
            'published_at',
        ] as const
        const data: Record<string, unknown> = {}
        for (const key of allowedFields) {
            if (body[key] !== undefined) data[key] = body[key]
        }
        // Support legacy field names
        if (body.title && !body.title_tr) data.title_tr = body.title
        if (body.cover_image && !body.cover_image_url) data.cover_image_url = body.cover_image
        if (body.is_published !== undefined && !body.status) {
            data.status = body.is_published ? 'published' : 'draft'
        }

        const post = await prisma.blogPost.create({ data: data as any })
        await revalidateAllStorefront()
        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error('[BLOG_POST]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
