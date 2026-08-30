'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCartStore } from '../../../store/useCartStore'

type PreviewItem = {
  _id: string
  name: string
  price: number
  quantity: number
  image: string
}

const countItems = (items: { quantity: number }[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

const CartPreviewList = ({
  title,
  items,
  accent = false,
}: {
  title: string
  items: PreviewItem[]
  accent?: boolean
}) => (
  <div
    className={
      'rounded-lg border p-3 ' +
      (accent
        ? 'border-aegean-terracotta/40 bg-aegean-terracotta/5'
        : 'border-border bg-muted/30')
    }
  >
    <div className="mb-2 flex items-baseline justify-between">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-xs text-muted-foreground">
        {countItems(items)} item(s)
      </p>
    </div>
    {items.length === 0 ? (
      <p className="py-1 text-sm text-muted-foreground">Empty</p>
    ) : (
      <ul className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item._id} className="flex items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-white">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="44px"
                  className="object-contain p-0.5"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-tight" title={item.name}>
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round(item.price * 100) / 100} € × {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {Math.round(item.price * item.quantity * 100) / 100} €
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
)

/**
 * Shown only when a logging-in user has BOTH a guest cart (this device) and a
 * saved cart (their account). reconcileAfterLogin sets store.pendingMerge to
 * open it. Dismissing without choosing defaults to "keep both" — nothing lost.
 */
export const CartMergeModal = () => {
  const pendingMerge = useCartStore((s) => s.pendingMerge)
  const guestItems = useCartStore((s) => s.items)
  const resolveMerge = useCartStore((s) => s.resolveMerge)
  const [busy, setBusy] = useState(false)

  const open = pendingMerge !== null
  const dbItems = pendingMerge?.dbItems ?? []

  const choose = async (mode: 'merge' | 'replace') => {
    if (busy) return
    setBusy(true)
    try {
      await resolveMerge(mode)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && open && !busy) choose('merge')
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] gap-4 overflow-y-auto sm:max-w-lg"
        data-testid="cart-merge-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-base">
            You already have a saved cart
          </DialogTitle>
          <DialogDescription>
            We found {countItems(dbItems)} item(s) in your account and{' '}
            {countItems(guestItems)} item(s) on this device. What should we keep?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <CartPreviewList title="In your account" items={dbItems} />
          <CartPreviewList title="On this device" items={guestItems} accent />
        </div>

        <DialogFooter className="gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 font-bold sm:flex-none"
            disabled={busy}
            onClick={() => choose('replace')}
          >
            USE THIS DEVICE
          </Button>
          <Button
            variant="buy"
            size="lg"
            className="flex-1 font-bold sm:flex-none"
            disabled={busy}
            onClick={() => choose('merge')}
          >
            KEEP BOTH
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
