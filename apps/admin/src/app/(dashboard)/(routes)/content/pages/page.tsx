export const revalidate = 0
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default async function ContentPagesPage() {
    let pages: any[] = []
    try {
        pages = await prisma.contentPage.findMany({
            orderBy: { updatedAt: 'desc' },
        })
    } catch (error) {
        console.warn('[ContentPagesPage] Failed to fetch content pages:', error)
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Sayfalar (${pages.length})`}
                        description="Statik içerik sayfalarını yönet."
                    />
                    <Link href="/content/pages/new">
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" /> Yeni Sayfa
                        </Button>
                    </Link>
                </div>
                <Separator />

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left font-medium">Başlık</th>
                                <th className="p-3 text-left font-medium">Slug</th>
                                <th className="p-3 text-left font-medium">Durum</th>
                                <th className="p-3 text-left font-medium">Güncelleme</th>
                                <th className="p-3 text-left font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page) => (
                                <tr key={page.id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="p-3 font-medium">{page.title_tr}</td>
                                    <td className="p-3 text-muted-foreground font-mono text-xs">/{page.slug}</td>
                                    <td className="p-3">
                                        <Badge variant={page.is_published ? 'default' : 'secondary'}>
                                            {page.is_published ? 'Yayında' : 'Taslak'}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-muted-foreground text-xs">{format(page.updatedAt, 'dd.MM.yyyy HH:mm')}</td>
                                    <td className="p-3">
                                        <Link href={`/content/pages/${page.id}`}>
                                            <Button variant="outline" size="sm">Düzenle</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {pages.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Henüz sayfa oluşturulmadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
