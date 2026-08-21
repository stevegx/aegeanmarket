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
import { Add01Icon } from '@hugeicons/core-free-icons'
import { adminCreateOrder } from '@/app/actions/adminCreateOrder'
import {
  adminSearchUsers,
  type AdminUserOption,
} from '@/app/actions/adminSearchUsers'
import OrderItemsEditor, { type EditableItem } from './OrderItemsEditor'

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const
const PAYMENT_METHOD_OPTIONS = [
  'credit_card',
  'iris',
  'paypal',
  'klarna',
  'cod',
] as const
const PAYMENT_STATUS_OPTIONS = ['paid', 'unpaid', 'refunded'] as const

const ADDRESS_FIELDS = [
  { key: 'street', label: 'Street' },
  { key: 'number', label: 'Number' },
  { key: 'city', label: 'City' },
  { key: 'zipcode', label: 'Zipcode' },
  { key: 'country', label: 'Country' },
] as const

const EMPTY_ADDRESS = {
  street: '',
  number: '',
  city: '',
  zipcode: '',
  country: '',
}

export default function CreateOrderDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [customerType, setCustomerType] = useState<'registered' | 'guest'>(
    'registered'
  )
  const [customer, setCustomer] = useState<AdminUserOption | null>(null)
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerResults, setCustomerResults] = useState<AdminUserOption[]>(
    []
  )
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>(
    'pending'
  )
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHOD_OPTIONS)[number]>('cod')
  const [paymentStatus, setPaymentStatus] =
    useState<(typeof PAYMENT_STATUS_OPTIONS)[number]>('unpaid')
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [items, setItems] = useState<EditableItem[]>([])

  const resetForm = () => {
    setCustomerType('registered')
    setCustomer(null)
    setCustomerQuery('')
    setCustomerResults([])
    setGuestName('')
    setGuestEmail('')
    setStatus('pending')
    setPaymentMethod('cod')
    setPaymentStatus('unpaid')
    setAddress(EMPTY_ADDRESS)
    setItems([])
    setError(null)
  }

  const handleCustomerSearch = (value: string) => {
    setCustomerQuery(value)
    if (value.trim().length < 2) {
      setCustomerResults([])
      return
    }
    startTransition(async () => {
      const results = await adminSearchUsers(value)
      setCustomerResults(results)
    })
  }

  const handleCreate = () => {
    setError(null)
    startTransition(async () => {
      const result = await adminCreateOrder({
        customerType,
        userId: customer?._id,
        guestName: customerType === 'guest' ? guestName : undefined,
        guestEmail: customerType === 'guest' ? guestEmail : undefined,
        status,
        paymentMethod,
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
      resetForm()
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetForm()
      }}
    >
      <DialogTrigger
        render={<Button className="gap-1.5 rounded-full px-4 font-semibold" />}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
        New order
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create order</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Customer</span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="rounded-full px-4"
                variant={customerType === 'registered' ? 'default' : 'outline'}
                onClick={() => setCustomerType('registered')}
              >
                Registered
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-full px-4"
                variant={customerType === 'guest' ? 'default' : 'outline'}
                onClick={() => setCustomerType('guest')}
              >
                Guest
              </Button>
            </div>

            {customerType === 'registered' ? (
              customer ? (
                <div className="flex items-center justify-between rounded-md bg-aegean-green/10 px-3 py-2 text-sm">
                  <span>
                    {customer.username}{' '}
                    <span className="text-muted-foreground">
                      ({customer.email})
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCustomer(null)}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    value={customerQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    placeholder="Search customer by username or email..."
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  {customerResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-popover ring-1 ring-foreground/10 rounded-md mt-1 max-h-40 overflow-y-auto">
                      {customerResults.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setCustomer(u)
                            setCustomerQuery('')
                            setCustomerResults([])
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex justify-between"
                        >
                          <span>{u.username}</span>
                          <span className="text-muted-foreground text-xs">
                            {u.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Guest name"
                  className="px-3 py-2 text-sm border rounded-md"
                />
                <input
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Guest email"
                  className="px-3 py-2 text-sm border rounded-md"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
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
              <label className="text-sm font-medium">Payment method</label>
              <Select
                value={paymentMethod}
                onValueChange={(v) =>
                  setPaymentMethod(v as typeof paymentMethod)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Payment status</label>
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
            onClick={handleCreate}
            disabled={
              isPending ||
              items.length === 0 ||
              (customerType === 'registered' && !customer) ||
              (customerType === 'guest' && (!guestName || !guestEmail))
            }
            size="lg"
            className="font-semibold"
          >
            {isPending ? 'Creating...' : 'Create order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
