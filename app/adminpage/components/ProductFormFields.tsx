'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { adminUploadProductImage } from '@/app/actions/adminUploadProductImage'

export interface ProductFormState {
  name: string
  description: string
  category: string
  price: string
  stock: string
  image: string
  manufacturer: string
  origin: string
  volume: string
  isFeatured: boolean
}

export default function ProductFormFields({
  value,
  onChange,
}: {
  value: ProductFormState
  onChange: (next: ProductFormState) => void
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
      const result = await adminUploadProductImage(formData)
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
        <label className="text-sm font-medium">Name</label>
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Product name"
          className="px-3 py-2 text-sm border rounded-md"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="Product description..."
          rows={5}
          className="px-3 py-2 text-sm border rounded-md resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Category</label>
          <input
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value })}
            placeholder="e.g. Olive Oil"
            className="px-3 py-2 text-sm border rounded-md"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Manufacturer</label>
          <input
            value={value.manufacturer}
            onChange={(e) =>
              onChange({ ...value, manufacturer: e.target.value })
            }
            placeholder="Optional"
            className="px-3 py-2 text-sm border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Price (&euro;)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={value.price}
            onChange={(e) => onChange({ ...value, price: e.target.value })}
            placeholder="0.00"
            className="px-3 py-2 text-sm border rounded-md"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Stock</label>
          <input
            type="number"
            min={0}
            step="1"
            value={value.stock}
            onChange={(e) => onChange({ ...value, stock: e.target.value })}
            placeholder="0"
            className="px-3 py-2 text-sm border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Origin</label>
          <input
            value={value.origin}
            onChange={(e) => onChange({ ...value, origin: e.target.value })}
            placeholder="Optional"
            className="px-3 py-2 text-sm border rounded-md"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Volume</label>
          <input
            value={value.volume}
            onChange={(e) => onChange({ ...value, volume: e.target.value })}
            placeholder="Optional"
            className="px-3 py-2 text-sm border rounded-md"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Switch
          checked={value.isFeatured}
          onCheckedChange={(checked) =>
            onChange({ ...value, isFeatured: checked })
          }
        />
        <label className="text-sm font-medium">Featured</label>
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
