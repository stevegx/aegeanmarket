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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import PaginationControls from '@/app/products/components/PaginationControls'
import type { AdminOrderListItem } from '@/lib/db'
import OrderEditDialog from './OrderEditDialog'
import CreateOrderDialog from './CreateOrderDialog'
import {
  STATUS_META,
  TONE_CLASSES,
  PAYMENT_STATUS_TONE,
  BADGE_CLASS,
} from './statusMeta'

const STATUS_OPTIONS = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

interface OrdersTabProps {
  orders: AdminOrderListItem[]
  totalPages: number
  currentPage: number
  statusFilter?: string
  search?: string
}

export default function OrdersTab({
  orders,
  totalPages,
  currentPage,
  statusFilter,
  search,
}: OrdersTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(search ?? '')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'orders')
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    params.set('orderPage', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search ?? '')) {
        updateParams({ orderSearch: searchInput })
      }
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter ?? 'all'}
            onValueChange={(value) =>
              updateParams({ orderStatus: value === 'all' ? null : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username, email or guest name..."
            className="flex-1 min-w-64 px-3 py-2 text-sm border rounded-md"
          />
        </div>

        <CreateOrderDialog />
      </div>

      <div className="w-full overflow-x-auto rounded-lg ring-1 ring-foreground/10">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  {order.userDoc?.username ?? order.guestName ?? '—'}
                  <div className="text-muted-foreground text-xs">
                    {order.userDoc?.email ?? order.guestEmail}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString('en-GB')}
                </TableCell>
                <TableCell>€{order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      BADGE_CLASS,
                      TONE_CLASSES[STATUS_META[order.status]?.tone ?? 'neutral']
                    )}
                  >
                    {STATUS_META[order.status]?.label ?? order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      BADGE_CLASS,
                      TONE_CLASSES[PAYMENT_STATUS_TONE[order.paymentStatus] ?? 'neutral']
                    )}
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <OrderEditDialog order={order} />
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
          paramName="orderPage"
        />
      )}
    </div>
  )
}
