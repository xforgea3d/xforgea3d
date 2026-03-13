export const revalidate = 3600

import prisma from '@/lib/prisma'
import Link from 'next/link'
const formatTR = (d: Date) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
import { Heading } from '@/components/native/heading'

export const metadata = {
   title: 'Blog | xForgea3D',
   description: '3D baskı dünyasından haberler, ipuçları ve hikayeler.',
}

export default async function BlogPage() {
   let posts: any[] = []
   try {
      posts = await prisma.blogPost.findMany({
         where: { status: 'published' },
         orderBy: { published_at: 'desc' },
      })
   } catch (e) {
      console.warn('[blog] DB unavailable during build')
   }

   return (
      <div className="max-w-5xl mx-auto px-4 py-12">
         <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground mt-2">
               3D baskı dünyasından haberler, ipuçları ve hikayeler.
            </p>
         </div>

         {posts.length === 0 && (
            <p className="text-muted-foreground text-center py-20">
               Henüz yayınlanmış yazı yok.
            </p>
         )}

         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
               <Link key={post.id} href={`/blog/${post.slug}`} className="group block rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                  {post.cover_image_url ? (
                     <div className="relative h-48 w-full">
                        <img src={post.cover_image_url} alt={post.title_tr} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                     </div>
                  ) : (
                     <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                        Görsel Yok
                     </div>
                  )}
                  <div className="p-4 space-y-2">
                     <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map(tag => (
                           <span key={tag} className="text-xs px-2 py-0.5 rounded-full border text-muted-foreground">
                              {tag}
                           </span>
                        ))}
                     </div>
                     <h2 className="font-semibold leading-tight group-hover:underline">{post.title_tr}</h2>
                     {post.excerpt_tr && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt_tr}</p>
                     )}
                     {post.published_at && (
                        <p className="text-xs text-muted-foreground">
                           {formatTR(new Date(post.published_at))}
                        </p>
                     )}
                  </div>
               </Link>
            ))}
         </div>
      </div>
   )
}
