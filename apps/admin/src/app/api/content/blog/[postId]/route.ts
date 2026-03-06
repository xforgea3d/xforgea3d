import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { revalidateStorefront } from '@/lib/revalidate-storefront'

export async function GET(_: Request, { params }: { params: { postId: string } }) {
    try {
        const post = await prisma.blogPost.findUnique({ where: { id: params.postId } })
        if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(post)
    } catch (error) {
        console.error('[BLOG_POST_GET]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: { postId: string } }) {
    try {
        const data = await req.json()
        const post = await prisma.blogPost.update({ where: { id: params.postId }, data })
        await revalidateStorefront(['/blog', `/blog/${post.slug ?? params.postId}`, '/'])
        return NextResponse.json(post)
    } catch (error) {
        console.error('[BLOG_POST_PATCH]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE(_: Request, { params }: { params: { postId: string } }) {
    try {
        await prisma.blogPost.delete({ where: { id: params.postId } })
        await revalidateStorefront(['/blog', '/'])
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[BLOG_POST_DELETE]', error)
        return new NextResponse('Internal error', { status: 500 })
    }
}
