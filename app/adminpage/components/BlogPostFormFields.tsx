'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import { adminUploadBlogImage } from '@/app/actions/adminUploadBlogImage'

export interface BlogFormState {
  title: string
  content: string
  image: string
}

export default function BlogPostFormFields({
  value,
  onChange,
}: {
  value: BlogFormState
  onChange: (next: BlogFormState) => void
}) {
  const [isUploading, startTransition] = useTransition()
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await adminUploadBlogImage(formData)
      if (!result.success) {
        setUploadError(result.error)
        return
      }
      onChange({ ...value, image: result.url })
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Title</label>
        <input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Post title"
          className="px-3 py-2 text-sm border rounded-md"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Content (Markdown supported)</label>
        <textarea
          value={value.content}
          onChange={(e) => onChange({ ...value, content: e.target.value })}
          placeholder="Write the post content..."
          rows={8}
          className="px-3 py-2 text-sm border rounded-md resize-y font-mono"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Image</label>
        {value.image && (
          <div className="relative w-full aspect-video rounded-md overflow-hidden ring-1 ring-foreground/10">
            <Image
              src={value.image}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 576px"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="text-sm"
        />
        {isUploading && (
          <p className="text-xs text-muted-foreground">Uploading...</p>
        )}
        {uploadError && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}
      </div>
    </div>
  )
}
