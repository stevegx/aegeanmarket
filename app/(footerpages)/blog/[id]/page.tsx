'use client'
import { blogPostData } from '../page'
import Image from 'next/image'
import Link from 'next/link'
export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogPostData.find((p) => p.id === parseInt(params.id))
  if (!post) {
    return (
      <div className="grow flex justify-center items-center text-7xl font-bold uppercase tracking-tighter">
        404:Post not found
      </div>
    )
  }
  return (
    <div>
      <Link href="/blog">
        <div className="mt-12 pt-8 border-t border-gray-100 p-3">
          <button className="text-aegean-dark font-bold hover:text-aegean-green transition-colors flex items-center gap-2 hover:cursor-pointer hover:underline">
            ← Επιστροφή στο Blog
          </button>
        </div>
      </Link>
      <article className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-aegean-dark mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-3 text-gray-500 text-sm">
            <span className="bg-aegean-green/10 text-aegean-green px-3 py-1 rounded-full font-semibold">
              {post.date}
            </span>
            <span>•</span>
            <span>
              By{' '}
              <span className="text-aegean-dark font-bold">{post.author}</span>
            </span>
          </div>
        </header>
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-10">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
            {post.content}
          </p>
        </div>
      </article>
    </div>
  )
}
