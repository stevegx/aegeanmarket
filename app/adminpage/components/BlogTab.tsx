'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PaginationControls from '@/app/products/components/PaginationControls'
import type { BlogPostDoc } from '@/lib/db'
import BlogEditDialog from './BlogEditDialog'
import CreateBlogPostDialog from './CreateBlogPostDialog'

interface BlogTabProps {
  posts: BlogPostDoc[]
  totalPages: number
  currentPage: number
  search?: string
}

export default function BlogTab({
  posts,
  totalPages,
  currentPage,
  search,
}: BlogTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(search ?? '')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'blog')
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    params.set('blogPage', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search ?? '')) {
        updateParams({ blogSearch: searchInput })
      }
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title or author..."
          className="flex-1 min-w-64 px-3 py-2 text-sm border rounded-md"
        />

        <CreateBlogPostDialog />
      </div>

      <div className="w-full overflow-x-auto rounded-lg ring-1 ring-foreground/10">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No posts found
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post._id}>
                <TableCell className="max-w-xs truncate">
                  {post.title}
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleDateString('en-GB')}
                </TableCell>
                <TableCell>
                  <BlogEditDialog post={post} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          paramName="blogPage"
        />
      )}
    </div>
  )
}
