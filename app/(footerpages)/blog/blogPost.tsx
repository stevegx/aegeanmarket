import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { stripMarkdown, getReadingTime } from '@/lib/utils'
import type { BlogPostDoc } from '@/lib/db'

interface BlogPostProps {
  post: BlogPostDoc
}

export default function BlogPost({ post }: BlogPostProps) {
  const readingTime = getReadingTime(post.content)

  return (
    <Link href={`/blog/${post._id}`} className="group block w-full max-w-100">
      <Card className="flex flex-col h-full overflow-hidden border border-border p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute top-3 left-3 rounded-full bg-background/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground shadow-sm">
            {readingTime} min read
          </span>
        </div>
        <div className="p-5 flex flex-col grow gap-3">
          <span className="text-[10px] uppercase tracking-widest text-aegean-terracotta font-bold">
            {new Date(post.createdAt).toLocaleDateString('en-GB')} •{' '}
            {post.author}
          </span>
          <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight transition-colors group-hover:text-aegean-green-text">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {stripMarkdown(post.content)}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-2 text-foreground font-bold text-sm">
            <span className="group-hover:underline">Read More</span>
            <span className="transform transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
