import { ImageSkeleton } from '@/components/native/icons'
import {
   Card,
   CardContent,
   CardHeader,
} from '@/components/ui/card'
import Link from 'next/link'

export function BlogPostGrid({ blogs }) {
   return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
         {blogs.map((post: any) => (
            <BlogPostCard key={post.slug} post={post} />
         ))}
      </div>
   )
}

export function BlogPostSkeletonGrid() {
   return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
         {[...Array(3)].map(() => (
            <BlogPostSkeleton key={Math.random()} />
         ))}
      </div>
   )
}

export function BlogPostCard({ post }) {
   const title = post.title_tr ?? post.title
   const image = post.cover_image_url ?? post.image
   const slug = post.slug
   const excerpt = post.excerpt_tr ?? post.description

   return (
      <Link href={`/blog/${slug}`}>
         <Card className="h-full">
            <CardHeader className="p-0">
               <div className="relative h-60 w-full">
                  {image ? (
                     <img
                        className="absolute inset-0 h-full w-full rounded-t-lg object-cover"
                        src={image}
                        alt={title ?? 'blog post'}
                        loading="lazy"
                     />
                  ) : (
                     <div className="absolute inset-0 h-full w-full rounded-t-lg bg-neutral-200 dark:bg-neutral-700" />
                  )}
               </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-4">
               <h5>{title}</h5>
               {excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
               )}
            </CardContent>
         </Card>
      </Link>
   )
}

export const BlogPostSkeleton = () => {
   return (
      <Link href="#">
         <div className="animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            <div className="relative h-full w-full">
               <div className="flex h-40 w-full items-center justify-center rounded bg-neutral-300 dark:bg-neutral-700 ">
                  <ImageSkeleton />
               </div>
            </div>
            <div className="p-5">
               <div className="w-full">
                  <div className="mb-4 h-2.5 w-48 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[440px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="mb-2.5 h-2 max-w-[460px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="h-2 max-w-[360px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
               </div>
            </div>
         </div>
      </Link>
   )
}
