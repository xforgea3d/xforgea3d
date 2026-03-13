export const revalidate = 3600

import prisma from '@/lib/prisma'
import { sanitizeHtml } from '@/lib/sanitize'
import { BlogPostJsonLd } from '@/app/json-ld'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
const formatTR = (d: Date) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

interface Props {
   params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
   let post: any = null
   try {
      post = await prisma.blogPost.findUnique({
         where: { slug: params.slug, status: 'published' },
      })
   } catch { return {} }
   if (!post) return {}
   return {
      title: post.seo_title_tr ?? post.title_tr,
      description: post.seo_description_tr ?? post.excerpt_tr ?? undefined,
      openGraph: {
         type: 'article',
         title: post.seo_title_tr ?? post.title_tr,
         description: post.seo_description_tr ?? post.excerpt_tr ?? undefined,
         url: `${SITE_URL}/blog/${post.slug}`,
         ...(post.cover_image_url && {
            images: [{ url: post.cover_image_url, alt: post.title_tr }],
         }),
         publishedTime: post.published_at?.toISOString(),
         tags: post.tags,
         locale: 'tr_TR',
         siteName: 'xForgea3D',
      },
      twitter: {
         card: 'summary_large_image',
         title: post.seo_title_tr ?? post.title_tr,
         description: post.seo_description_tr ?? post.excerpt_tr ?? undefined,
         ...(post.cover_image_url && { images: [post.cover_image_url] }),
      },
      alternates: {
         canonical: `${SITE_URL}/blog/${post.slug}`,
      },
   }
}

export default async function BlogPostPage({ params }: Props) {
   const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: 'published' },
   })
   if (!post) notFound()

   return (
      <article className="max-w-3xl mx-auto px-4 py-12">
         {/* JSON-LD BlogPosting Schema */}
         <BlogPostJsonLd post={post} />

         {post.cover_image_url && (
            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
               <img src={post.cover_image_url} alt={post.title_tr} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
            </div>
         )}
         <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
               <span key={tag} className="text-xs px-2 py-1 rounded-full border text-muted-foreground">
                  {tag}
               </span>
            ))}
         </div>
         <h1 className="text-3xl font-bold tracking-tight mb-3">{post.title_tr}</h1>
         {post.published_at && (
            <p className="text-sm text-muted-foreground mb-8">
               {formatTR(new Date(post.published_at))}
            </p>
         )}
         <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body_html_tr ?? '') }}
         />
         <div className="mt-12 pt-6 border-t">
            <Link href="/blog" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
               ← Blog'a Don
            </Link>
         </div>
      </article>
   )
}
