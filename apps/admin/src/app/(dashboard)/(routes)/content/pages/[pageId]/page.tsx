export const revalidate = 0
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ContentPageForm } from './components/content-page-form'

export default async function ContentPageEditPage({ params }: { params: { pageId: string } }) {
    const page = params.pageId === 'new'
        ? null
        : await prisma.contentPage.findUnique({ where: { id: params.pageId } })

    if (params.pageId !== 'new' && !page) notFound()

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ContentPageForm initialData={page} />
            </div>
        </div>
    )
}
