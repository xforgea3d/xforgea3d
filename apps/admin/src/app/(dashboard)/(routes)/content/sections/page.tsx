export const revalidate = 0
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { SectionReorderList } from './components/section-reorder-list'

export default async function HomepageSectionsPage() {
    const sections = await prisma.homepageSection.findMany({
        orderBy: { sort_order: 'asc' },
    })

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading
                    title="Ana Sayfa Bölümleri"
                    description="Bölümleri etkinleştir, sırala ve düzenle."
                />
                <Separator />
                <SectionReorderList initialSections={sections as any} />
            </div>
        </div>
    )
}
