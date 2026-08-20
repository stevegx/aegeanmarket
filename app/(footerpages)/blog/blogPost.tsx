import { BlogPostType } from './blogPostData'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

interface BlogPostProps {
  post: BlogPostType
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <Link href={`/blog/${post.id}`} className="group block w-full max-w-100">
      <Card className="flex flex-col h-full overflow-hidden border border-border p-0 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="relative w-full aspect-video">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </div>
        <div className="p-5 flex flex-col grow gap-3">
          <span className="text-[10px] uppercase tracking-widest text-aegean-terracotta font-bold">
            {post.date} • {post.author}
          </span>
          <h1 className="text-xl font-bold text-aegean-dark line-clamp-2 leading-tight">
            {post.title}
          </h1>
          <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-2 text-aegean-dark font-bold text-sm">
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
