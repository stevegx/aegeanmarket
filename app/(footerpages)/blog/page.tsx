import type { Metadata } from 'next'
import BlogPost from './blogPost'
import { getAllBlogPosts } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stories, guides, and news from Aegean Market about wines, spirits, and Mediterranean culture.',
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Blog
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Stories, guides, and news about wines, spirits, and Mediterranean
          culture.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {posts.map((post) => (
          <BlogPost key={post._id} post={post} />
        ))}
      </div>
    </div>
  )
}
