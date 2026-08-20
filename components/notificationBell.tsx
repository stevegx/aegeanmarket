'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification01Icon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  useNotificationsStore,
  NotificationItem,
} from '@/app/store/useNotificationsStore'

const POLL_INTERVAL = 30000

function notificationText(notification: NotificationItem) {
  const from = notification.fromUser?.username ?? 'Κάποιος'
  const product = notification.product?.name ?? 'ένα προϊόν'
  return `Ο/Η ${from} απάντησε στο σχόλιό σου στο "${product}"`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('el-GR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationBell() {
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadCount = useNotificationsStore((state) => state.unreadCount)
  const fetchNotifications = useNotificationsStore(
    (state) => state.fetchNotifications
  )
  const markAllRead = useNotificationsStore((state) => state.markAllRead)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return (
    <Sheet
      onOpenChange={(open) => {
        if (open) markAllRead()
      }}
    >
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            className="relative size-10 rounded-full bg-aegean-light/30 hover:bg-aegean-light/30 active:bg-aegean-light"
          />
        }
      >
        <HugeiconsIcon
          icon={Notification01Icon}
          strokeWidth={2}
          className="size-5 text-aegean-dark"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-aegean-terracotta text-[11px] text-aegean-gray font-bold">
            {unreadCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-bold text-2xl">Ειδοποιήσεις</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col overflow-y-auto w-full h-full px-6 gap-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Δεν έχεις ειδοποιήσεις.</p>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification._id}
                href={
                  notification.product
                    ? `/products/${notification.product._id}`
                    : '#'
                }
                className={cn(
                  'flex flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:bg-aegean-gray/20',
                  notification.read
                    ? 'border-aegean-gray/50 bg-white'
                    : 'border-aegean-terracotta/40 bg-aegean-terracotta/5'
                )}
              >
                <span className="text-aegean-dark">
                  {notificationText(notification)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
