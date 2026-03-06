import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function GET(req: Request) {
    try {
        const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: 'desc' } })
        return NextResponse.json(posts)
    } catch (error) {
        console.error('[BLOG_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        if (!data.title) return new NextResponse('Title is required', { status: 400 })

        const post = await prisma.blogPost.create({ data })
        await revalidateStorefront(['/blog', '/'])
        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error('[BLOG_POST]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
