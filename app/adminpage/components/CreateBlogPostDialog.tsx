'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { adminCreateBlogPost } from '@/app/actions/adminCreateBlogPost'
import BlogPostFormFields, { type BlogFormState } from './BlogPostFormFields'

const EMPTY_FORM: BlogFormState = { title: '', content: '', image: '' }

export default function CreateBlogPostDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM)

  const handleCreate = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminCreateBlogPost(form)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      setForm(EMPTY_FORM)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setForm(EMPTY_FORM)
      }}
    >
      <DialogTrigger
        render={<Button className="gap-1.5 rounded-md px-4 font-semibold" />}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
        New post
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create blog post</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <BlogPostFormFields value={form} onChange={setForm} />
          {error && (
            <p className="text-sm text-destructive mt-3">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={isPending || !form.title || !form.content || !form.image}
            size="lg"
            className="font-semibold"
          >
            {isPending ? 'Creating...' : 'Create post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
