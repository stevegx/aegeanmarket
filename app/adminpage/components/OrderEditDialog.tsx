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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'
import type { AdminOrderListItem } from '@/lib/db'
import { adminUpdateOrder } from '@/app/actions/adminUpdateOrder'
import OrderItemsEditor, { type EditableItem } from './OrderItemsEditor'

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
const PAYMENT_STATUS_OPTIONS = ['paid', 'unpaid', 'refunded'] as const

const ADDRESS_FIELDS = [
  { key: 'street', label: 'Street' },
  { key: 'number', label: 'Number' },
  { key: 'city', label: 'City' },
  { key: 'zipcode', label: 'Zipcode' },
  { key: 'country', label: 'Country' },
] as const

export default function OrderEditDialog({
  order,
}: {
  order: AdminOrderListItem
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState(order.status)
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [address, setAddress] = useState(order.shippingAddress)
  const [items, setItems] = useState<EditableItem[]>(
    order.items.map((i) => ({
      productId: i.product,
      name: i.name,
      priceAtpurchase: i.priceAtpurchase,
      quantity: i.quantity,
    }))
  )

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminUpdateOrder(order._id, {
        status,
        paymentStatus,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      })
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
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-3.5" />
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Edit order</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Payment</label>
              <Select
                value={paymentStatus}
                onValueChange={(v) =>
                  setPaymentStatus(v as typeof paymentStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Shipping address</span>
            <div className="grid grid-cols-2 gap-3">
              {ADDRESS_FIELDS.map(({ key, label }) => (
                <input
                  key={key}
                  value={address[key]}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={label}
                  className="px-3 py-2 text-sm border rounded-md"
                />
              ))}
            </div>
          </div>

          <OrderItemsEditor items={items} onChange={setItems} />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isPending}
            size="lg"
            className="font-semibold"
          >
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
