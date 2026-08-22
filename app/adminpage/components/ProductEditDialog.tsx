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
import type { AdminProductListItem, ProductDeleteImpact } from '@/lib/db'
import { adminUpdateProduct } from '@/app/actions/adminUpdateProduct'
import { adminDeleteProduct } from '@/app/actions/adminDeleteProduct'
import { getProductDeleteImpact } from '@/app/actions/getProductDeleteImpact'
import ProductFormFields, {
  type ProductFormState,
} from './ProductFormFields'

// Only the fields the edit form actually needs, so callers (e.g. the public
// product detail page) don't have to fetch admin-only list fields like
// rating/source/createdAt just to let an admin edit a product in place.
export type ProductEditFields = Pick<
  AdminProductListItem,
  | '_id'
  | 'name'
  | 'description'
  | 'category'
  | 'price'
  | 'stock'
  | 'image'
  | 'manufacturer'
  | 'origin'
  | 'volume'
  | 'isFeatured'
>

function toFormState(product: ProductEditFields): ProductFormState {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    image: product.image,
    manufacturer: product.manufacturer ?? '',
    origin: product.origin ?? '',
    volume: product.volume ?? '',
    isFeatured: product.isFeatured ?? false,
  }
}

export default function ProductEditDialog({
  product,
}: {
  product: ProductEditFields
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormState>(() =>
    toFormState(product)
  )

  const [impact, setImpact] = useState<ProductDeleteImpact | null>(null)
  const [impactLoading, setImpactLoading] = useState(false)
  const [impactError, setImpactError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminUpdateProduct(product._id, {
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
      router.refresh()
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await adminDeleteProduct(product._id)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  const loadImpact = () => {
    setImpact(null)
    setImpactError(null)
    setImpactLoading(true)
    startTransition(async () => {
      const result = await getProductDeleteImpact(product._id)
      setImpactLoading(false)
      if (!result.success) {
        setImpactError(result.error)
        return
      }
      setImpact(result.impact)
    })
  }

  const impactTotal = impact
    ? impact.orders + impact.carts + impact.favorites + impact.reviews
    : 0

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
            <DialogTitle className="text-base">Edit product</DialogTitle>
            <Link
              href={`/products/${product._id}`}
              target="_blank"
              className={buttonVariants({
                variant: 'outline',
                size: 'default',
                className: 'gap-1.5 px-3',
              })}
            >
              View product
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                strokeWidth={2}
                className="size-3.5"
              />
            </Link>
          </div>
        </DialogHeader>

        <div className="py-2">
          <ProductFormFields value={form} onChange={setForm} />
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </div>

        <DialogFooter className="justify-between sm:justify-between mt-2">
          <AlertDialog
            onOpenChange={(open) => {
              if (open) loadImpact()
            }}
          >
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
                <AlertDialogTitle>Delete product?</AlertDialogTitle>
                <AlertDialogDescription render={<div />}>
                  <p>
                    &ldquo;{product.name}&rdquo; will be permanently deleted.
                  </p>
                  {impactLoading && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Checking where this product is used...
                    </p>
                  )}
                  {impactError && (
                    <p className="mt-2 text-xs text-destructive">
                      {impactError}
                    </p>
                  )}
                  {impact && impactTotal > 0 && (
                    <p className="mt-2 text-xs text-destructive font-medium">
                      Still referenced in {impact.orders} order(s),{' '}
                      {impact.carts} cart(s), {impact.favorites} favorite
                      list(s) and {impact.reviews} review(s). Deleting it
                      will leave those references dangling.
                    </p>
                  )}
                  {impact && impactTotal === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Not referenced in any orders, carts, favorites or
                      reviews.
                    </p>
                  )}
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
