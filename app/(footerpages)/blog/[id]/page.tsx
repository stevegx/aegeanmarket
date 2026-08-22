import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getBlogPostById } from '@/lib/db'
import { requireAdmin } from '@/app/actions/requireAdmin'
import BlogEditDialog from '@/app/adminpage/components/BlogEditDialog'
import { stripMarkdown } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getBlogPostById(id)

  if (!post) return { title: 'Post not found' }

  const description = stripMarkdown(post.content).slice(0, 160)
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      images: [{ url: post.image }],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [post, admin] = await Promise.all([
    getBlogPostById(id),
    requireAdmin(),
  ])

  if (!post) {
    return (
      <div className="grow flex flex-col items-center justify-center gap-3 min-h-[60vh] text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark">
          404 — Post not found
        </h1>
        <p className="text-muted-foreground">
          This blog post doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/blog"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link href="/blog">
          <div className="mt-12 pt-8 border-t border-border p-3">
            <button className="text-aegean-dark font-bold hover:text-aegean-green transition-colors flex items-center gap-2 hover:cursor-pointer hover:underline">
              ← Back to Blog
            </button>
          </div>
        </Link>
        {admin && (
          <div className="mt-12 pt-8 mr-3">
            <BlogEditDialog post={post} />
          </div>
        )}
      </div>
      <article className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-aegean-dark mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground text-sm">
            <span className="bg-aegean-green/10 text-aegean-green-text px-3 py-1 rounded-full font-semibold">
              {new Date(post.createdAt).toLocaleDateString('en-GB')}
            </span>
            <span>•</span>
            <span>
              By{' '}
              <span className="text-aegean-dark font-bold">
                {post.author}
              </span>
            </span>
          </div>
        </header>
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-10">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}
