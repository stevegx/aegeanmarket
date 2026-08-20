import BlogPost from './blogPost'
import { blogPostData } from './blogPostData'

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl text-center mb-10 font-bold text-aegean-dark">
        Blog
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {blogPostData.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
