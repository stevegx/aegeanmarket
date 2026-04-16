import { blogPostData } from '../page'
import Image from 'next/image'

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPostData.find((p) => p.id === parseInt(params.id))
  if (!post) {
    return (
      <div className="flex-grow flex justify-center items-center text-7xl font-bold uppercase tracking-tighter">
        404:Post not found
      </div>
    )
  }
  return (
    <div className="flex justify-center gap-10 py-5 flex-wrap">
      <div>
        <Image src={post.image} alt={post.title} width={800} height={400} />
      </div>
      <div className="flex flex-col max-w-xl gap-3">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <h3 className="text-sm font-light">
          Created at: {post.date} by{' '}
          <span className="font-medium">{post.author}</span>
        </h3>
        <p className="text-sm font-medium">{post.content}</p>
      </div>
    </div>
  )
}
