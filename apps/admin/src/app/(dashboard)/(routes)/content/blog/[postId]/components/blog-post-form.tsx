'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import type { BlogPost } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
    title_tr: z.string().min(1),
    excerpt_tr: z.string().optional(),
    body_html_tr: z.string().optional(),
    cover_image_url: z.string().optional(),
    tags: z.string().optional(), // comma-separated, split on save
    status: z.enum(['draft', 'published']),
    seo_title_tr: z.string().optional(),
    seo_description_tr: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function BlogPostForm({ initialData }: { initialData: BlogPost | null }) {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isNew = !initialData

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                slug: initialData.slug,
                title_tr: initialData.title_tr,
                status: initialData.status,
                excerpt_tr: initialData.excerpt_tr ?? undefined,
                body_html_tr: initialData.body_html_tr ?? undefined,
                cover_image_url: initialData.cover_image_url ?? undefined,
                tags: initialData.tags?.join(', ') ?? '',
                seo_title_tr: initialData.seo_title_tr ?? undefined,
                seo_description_tr: initialData.seo_description_tr ?? undefined,
            }
            : { slug: '', title_tr: '', excerpt_tr: '', body_html_tr: '', cover_image_url: '', tags: '', status: 'draft' as const, seo_title_tr: '', seo_description_tr: '' },
    })

    const onSubmit = async (data: FormValues) => {
        try {
            setLoading(true)
            const payload = {
                ...data,
                tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                published_at: data.status === 'published' ? new Date().toISOString() : null,
            }
            if (isNew) {
                const res = await fetch('/api/content/blog', {
                    method: 'POST', body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Oluşturma başarısız')
            } else {
                const res = await fetch(`/api/content/blog/${params.postId}`, {
                    method: 'PATCH', body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Güncelleme başarısız')
            }
            router.refresh()
            router.push('/content/blog')
            toast.success(isNew ? 'Yazı oluşturuldu.' : 'Yazı güncellendi.')
        } catch {
            toast.error('Bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/content/blog/${params.postId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Silme başarısız')
            router.refresh()
            router.push('/content/blog')
            toast.success('Yazı silindi.')
        } catch {
            toast.error('Bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={isNew ? 'Yeni Blog Yazısı' : 'Yazıyı Düzenle'}
                    description="Başlık, içerik, kapak görseli ve SEO."
                />
                {!isNew && (
                    <Button variant="destructive" size="sm" disabled={loading} onClick={onDelete}>
                        <Trash className="h-4" />
                    </Button>
                )}
            </div>
            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="title_tr" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Başlık</FormLabel>
                                <FormControl><Input disabled={loading} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="slug" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl><Input disabled={loading || !isNew} placeholder="ornek-yazi" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="cover_image_url" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kapak Görseli URL</FormLabel>
                            <FormControl><Input disabled={loading} placeholder="https://..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="excerpt_tr" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Özet</FormLabel>
                            <FormControl><Textarea disabled={loading} rows={2} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="body_html_tr" render={({ field }) => (
                        <FormItem>
                            <FormLabel>İçerik (HTML)</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={loading}
                                    rows={18}
                                    className="font-mono text-xs"
                                    placeholder="<h2>Başlık</h2><p>Paragraf...</p>"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Etiketler (virgülle ayırın)</FormLabel>
                            <FormControl><Input disabled={loading} placeholder="3d-baski, figür, reçine" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="space-y-4 rounded-md border p-4">
                        <p className="text-sm font-semibold">SEO</p>
                        <FormField control={form.control} name="seo_title_tr" render={({ field }) => (
                            <FormItem>
                                <FormLabel>SEO Başlığı</FormLabel>
                                <FormControl><Input disabled={loading} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="seo_description_tr" render={({ field }) => (
                            <FormItem>
                                <FormLabel>SEO Açıklaması</FormLabel>
                                <FormControl><Textarea disabled={loading} rows={2} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Durum</FormLabel>
                            <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="draft">Taslak</SelectItem>
                                    <SelectItem value="published">Yayında</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button disabled={loading} type="submit">
                        {isNew ? 'Oluştur' : 'Kaydet'}
                    </Button>
                </form>
            </Form>
        </>
    )
}
