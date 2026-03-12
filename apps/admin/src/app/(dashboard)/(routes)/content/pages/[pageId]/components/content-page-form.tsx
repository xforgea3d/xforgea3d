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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ContentPage } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
    title_tr: z.string().min(1),
    body_html_tr: z.string().optional(),
    is_published: z.boolean().default(false),
    seo_title_tr: z.string().optional(),
    seo_description_tr: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ContentPageForm({ initialData }: { initialData: ContentPage | null }) {
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
                is_published: initialData.is_published,
                body_html_tr: initialData.body_html_tr ?? undefined,
                seo_title_tr: initialData.seo_title_tr ?? undefined,
                seo_description_tr: initialData.seo_description_tr ?? undefined,
            }
            : {
                slug: '', title_tr: '', body_html_tr: '', is_published: false,
                seo_title_tr: '', seo_description_tr: '',
            },
    })

    const onSubmit = async (data: FormValues) => {
        try {
            setLoading(true)
            if (isNew) {
                const res = await fetch('/api/content/pages', {
                    method: 'POST', body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Oluşturma başarısız')
            } else {
                const res = await fetch(`/api/content/pages/${params.pageId}`, {
                    method: 'PATCH', body: JSON.stringify(data),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) throw new Error('Güncelleme başarısız')
            }
            router.refresh()
            router.push('/content/pages')
            toast.success(isNew ? 'Sayfa oluşturuldu.' : 'Sayfa güncellendi.')
        } catch {
            toast.error('Bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/content/pages/${params.pageId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Silme başarısız')
            router.refresh()
            router.push('/content/pages')
            toast.success('Sayfa silindi.')
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
                    title={isNew ? 'Yeni Sayfa' : 'Sayfayı Düzenle'}
                    description="Slug, içerik ve SEO bilgilerini düzenle."
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
                                <FormControl><Input disabled={loading || !isNew} placeholder="hakkimizda" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

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

                    <FormField control={form.control} name="is_published" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Yayında</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    İşaretlenirse sayfa mağazada görünür hale gelir.
                                </p>
                            </div>
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
