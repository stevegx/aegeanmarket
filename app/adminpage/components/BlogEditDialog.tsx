'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PencilEdit02Icon,
  Delete02Icon,
  LinkSquare02Icon,
} from '@hugeicons/core-free-icons'
import type { BlogPostDoc } from '@/lib/db'
import { adminUpdateBlogPost } from '@/app/actions/adminUpdateBlogPost'
import { adminDeleteBlogPost } from '@/app/actions/adminDeleteBlogPost'
import BlogPostFormFields, { type BlogFormState } from './BlogPostFormFields'

export default function BlogEditDialog({ post }: { post: BlogPostDoc }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BlogFormState>({
    title: post.title,
    content: post.content,
    image: post.image,
  })

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminUpdateBlogPost(post._id, form)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await adminDeleteBlogPost(post._id)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="default" className="gap-1.5 px-3" />}
      >
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-3.5" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <DialogTitle className="text-base">Edit blog post</DialogTitle>
            <Link
              href={`/blog/${post._id}`}
              target="_blank"
              className={buttonVariants({
                variant: 'outline',
                size: 'default',
                className: 'gap-1.5 px-3',
              })}
            >
              View post
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                strokeWidth={2}
                className="size-3.5"
              />
            </Link>
          </div>
        </DialogHeader>

        <div className="py-2">
          <BlogPostFormFields value={form} onChange={setForm} />
          {error && (
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}
        </div>

        <DialogFooter className="justify-between sm:justify-between mt-2">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="default"
                  className="gap-1.5 px-3"
                />
              }
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete post?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{post.title}&rdquo; will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            disabled={isPending}
            size="lg"
            className="px-4 font-semibold"
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
