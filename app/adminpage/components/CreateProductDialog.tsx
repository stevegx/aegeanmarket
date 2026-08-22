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
import { adminCreateProduct } from '@/app/actions/adminCreateProduct'
import ProductFormFields, {
  type ProductFormState,
} from './ProductFormFields'

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  manufacturer: '',
  origin: '',
  volume: '',
  isFeatured: false,
}

export default function CreateProductDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)

  const handleCreate = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminCreateProduct({
        name: form.name,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image,
        manufacturer: form.manufacturer || undefined,
        origin: form.origin || undefined,
        volume: form.volume || undefined,
        isFeatured: form.isFeatured,
      })
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
        render={<Button className="gap-1.5 rounded-full px-4 font-semibold" />}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
        New product
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create product</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <ProductFormFields value={form} onChange={setForm} />
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={
              isPending ||
              !form.name ||
              !form.description ||
              !form.category ||
              !form.price ||
              !form.stock ||
              !form.image
            }
            size="lg"
            className="font-semibold"
          >
            {isPending ? 'Creating...' : 'Create product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
