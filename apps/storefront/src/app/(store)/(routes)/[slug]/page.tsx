import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    let page: any = null
    try {
        page = await prisma.contentPage.findUnique({
            where: { slug: params.slug, is_published: true },
        })
    } catch { return {} }
    if (!page) return {}
    return {
        title: page.seo_title_tr ?? page.title_tr,
        description: page.seo_description_tr ?? undefined,
    }
}

export default async function StaticPage({ params }: Props) {
    const page = await prisma.contentPage.findUnique({
        where: { slug: params.slug, is_published: true },
    })

    if (!page) notFound()

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">{page.title_tr}</h1>
            <div
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: page.body_html_tr ?? '' }}
            />
        </div>
    )
}

export async function generateStaticParams() {
    try {
        const pages = await prisma.contentPage.findMany({
            where: { is_published: true },
            select: { slug: true },
        })
        return pages.map(p => ({ slug: p.slug }))
    } catch {
        return []
    }
}
