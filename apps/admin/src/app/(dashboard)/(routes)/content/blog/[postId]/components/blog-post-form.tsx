'use client'

import { adminPath } from '@/lib/base-path'
import { Button } from '@/components/ui/button'
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
import { RichEditor } from '@/components/ui/rich-editor'
import ImageUpload from '@/components/ui/image-upload'
import { zodResolver } from '@hookform/resolvers/zod'
import type { BlogPost } from '@prisma/client'
import { Loader2, Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

const formSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Sadece kucuk harf, rakam ve tire'),
    title_tr: z.string().min(1),
    excerpt_tr: z.string().optional(),
    body_html_tr: z.string().optional(),
    cover_image_url: z.string().optional(),
    tags: z.string().optional(),
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
                excerpt_tr: initialData.excerpt_tr ?? '',
                body_html_tr: initialData.body_html_tr ?? '',
                cover_image_url: initialData.cover_image_url ?? '',
                tags: initialData.tags?.join(', ') ?? '',
                seo_title_tr: initialData.seo_title_tr ?? '',
                seo_description_tr: initialData.seo_description_tr ?? '',
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
                const res = await fetch(adminPath('/api/content/blog'), {
                    method: 'POST', body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Olusturma basarisiz')
            } else {
                const res = await fetch(adminPath(`/api/content/blog/${params.postId}`), {
                    method: 'PATCH', body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Guncelleme basarisiz')
            }
            router.refresh()
            router.push(adminPath('/content/blog'))
            toast.success(isNew ? 'Yazi olusturuldu.' : 'Yazi guncellendi.')
        } catch {
            toast.error('Bir hata olustu.')
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            const res = await fetch(adminPath(`/api/content/blog/${params.postId}`), { method: 'DELETE' })
            if (!res.ok) throw new Error('Silme basarisiz')
            router.refresh()
            router.push(adminPath('/content/blog'))
            toast.success('Yazi silindi.')
        } catch {
            toast.error('Bir hata olustu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={isNew ? 'Yeni Blog Yazisi' : 'Yaziyi Duzenle'}
                    description="Baslik, icerik, kapak gorseli ve SEO."
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="title_tr" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Baslik</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            if (isNew) {
                                                form.setValue('slug', toSlug(e.target.value))
                                            }
                                        }}
                                    />
                                </FormControl>
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
                            <FormLabel>Kapak Gorseli</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ? [field.value] : []}
                                    disabled={loading}
                                    onChange={(url) => field.onChange(url)}
                                    onRemove={() => field.onChange('')}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="excerpt_tr" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ozet</FormLabel>
                            <FormControl><Textarea disabled={loading} rows={2} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="body_html_tr" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Icerik</FormLabel>
                            <FormControl>
                                <RichEditor
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    disabled={loading}
                                    placeholder="Blog yazinizi buraya yazin..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Etiketler (virgulle ayirin)</FormLabel>
                            <FormControl><Input disabled={loading} placeholder="3d-baski, figur, recine" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="space-y-4 rounded-md border p-4">
                        <p className="text-sm font-semibold">SEO</p>
                        <FormField control={form.control} name="seo_title_tr" render={({ field }) => (
                            <FormItem>
                                <FormLabel>SEO Basligi</FormLabel>
                                <FormControl><Input disabled={loading} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="seo_description_tr" render={({ field }) => (
                            <FormItem>
                                <FormLabel>SEO Aciklamasi</FormLabel>
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
                                    <SelectItem value="published">Yayinda</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button disabled={loading} type="submit">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            isNew ? 'Olustur' : 'Kaydet'
                        )}
                    </Button>
                </form>
            </Form>
        </>
    )
}
