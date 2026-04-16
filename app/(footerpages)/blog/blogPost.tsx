import { BlogPostType } from './page'
import Image from 'next/image'
import Link from 'next/link'
interface BlogPostProps {
  post: BlogPostType
}
export default function BlogPost({ post }: BlogPostProps) {
  return (
    <Link href={`/blog/${post.id}`} className="group block h-full">
      <div className="flex flex-col bg-white border border-gray-100 max-w-lg h-full p-0 overflow-hidden rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative w-full aspect-video  overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-fill transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col p-5 gap-3">
          <span className="text-[10px] uppercase tracking-widest text-aegean-terracotta font-bold">
            {post.date} • {post.author}
          </span>
          <h1 className="text-xl font-bold text-aegean-dark transition-colors line-clamp-2">
            {post.title}
          </h1>
          <p className="line-clamp-3 text-gray-600 text-sm leading-relaxed">
            {post.content}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-aegean-dark font-bold text-sm group-hover:underline">
              Read More
            </span>
            <span className="transform transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
