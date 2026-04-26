import BlogPost from '@/app/(footerpages)/blog/blogPost'
import { blogPostData } from '@/app/(footerpages)/blog/page'
export default function BlogSection() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center gap-3 pb-8">
        <h1 className="text-2xl md:text-4xl  font-bold  text-center">
          Ideas and Suggestions
        </h1>
        <p className="text-lg font-mono text-aegean-dark">
          Visit our Blog and find usefull ideas and tips.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center justify-center w-full gap-10">
        {blogPostData.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
