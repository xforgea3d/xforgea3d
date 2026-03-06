export const revalidate = 0
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default async function BlogListPage() {
    let posts: any[] = []
    try {
        posts = await prisma.blogPost.findMany({
            orderBy: { updatedAt: 'desc' },
        })
    } catch (error) {
        console.warn('[BlogListPage] Failed to fetch blog posts:', error)
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Blog Yazıları (${posts.length})`}
                        description="Blog içeriklerini yönet."
                    />
                    <Link href="/content/blog/new">
                        <Button>
                            <PlusIcon className="h-4 w-4 mr-2" /> Yeni Yazı
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
                                <th className="p-3 text-left font-medium">Yayın Tarihi</th>
                                <th className="p-3 text-left font-medium">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="p-3 font-medium">{post.title_tr}</td>
                                    <td className="p-3 text-muted-foreground font-mono text-xs">/blog/{post.slug}</td>
                                    <td className="p-3">
                                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                            {post.status === 'published' ? 'Yayında' : 'Taslak'}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-muted-foreground text-xs">
                                        {post.published_at ? format(post.published_at, 'dd.MM.yyyy') : '—'}
                                    </td>
                                    <td className="p-3">
                                        <Link href={`/content/blog/${post.id}`}>
                                            <Button variant="outline" size="sm">Düzenle</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Henüz yazı oluşturulmadı.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
