export const revalidate = 0
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { BlogPostForm } from './components/blog-post-form'

export default async function BlogPostEditPage({ params }: { params: { postId: string } }) {
    const post = params.postId === 'new'
        ? null
        : await prisma.blogPost.findUnique({ where: { id: params.postId } })

    if (params.postId !== 'new' && !post) notFound()

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BlogPostForm initialData={post} />
            </div>
        </div>
    )
}
