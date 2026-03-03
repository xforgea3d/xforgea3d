import prisma from '@/lib/prisma'
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xforgea3d.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
   // ── Static routes ─────────────────────────────────────────
   const staticRoutes: MetadataRoute.Sitemap = [
      { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${BASE_URL}/atolye`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE_URL}/policies`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
      { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
   ]

   // ── Dynamic queries in parallel (graceful fallback if DB unreachable) ──
   let pages: any[] = [], posts: any[] = [], products: any[] = [], categories: any[] = []
   try {
      ;[pages, posts, products, categories] = await Promise.all([
         prisma.contentPage.findMany({
            where: { is_published: true },
            select: { slug: true, updatedAt: true },
         }),
         prisma.blogPost.findMany({
            where: { status: 'published' },
            select: { slug: true, updatedAt: true },
            orderBy: { published_at: 'desc' },
         }),
         prisma.product.findMany({
            where: { isAvailable: true },
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
         }),
         prisma.category.findMany({
            select: { title: true, updatedAt: true },
         }),
      ])
   } catch (e) {
      console.warn('[sitemap] DB unavailable, returning static routes only')
   }

   // ── CMS pages ────────────────────────────────────────────
   const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
   }))

   // ── Blog posts ───────────────────────────────────────────
   const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
   }))

   // ── Products ─────────────────────────────────────────────
   const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
   }))

   // ── Categories (filter by encoded title for product listing) ──
   const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE_URL}/products?category=${encodeURIComponent(c.title)}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
   }))

   return [
      ...staticRoutes,
      ...pageRoutes,
      ...postRoutes,
      ...productRoutes,
      ...categoryRoutes,
   ]
}
