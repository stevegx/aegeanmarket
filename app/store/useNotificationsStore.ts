import { create } from 'zustand'
import { markNotificationsRead } from '@/app/actions/markNotificationsRead'

export interface NotificationItem {
  _id: string
  fromUser: { _id: string; username: string } | null
  product: { _id: string; name: string } | null
  type: 'reply'
  read: boolean
  createdAt: string
}

interface NotificationsState {
  notifications: NotificationItem[]
  unreadCount: number
  isHydrated: boolean
  fetchNotifications: () => Promise<void>
  markAllRead: () => Promise<void>
  reset: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  (set, get) => ({
    notifications: [],
    unreadCount: 0,
    isHydrated: false,

    fetchNotifications: async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          set({
            notifications: data.notifications || [],
            unreadCount: data.unreadCount || 0,
            isHydrated: true,
          })
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    },

    markAllRead: async () => {
      if (get().unreadCount === 0) return
      set({
        notifications: get().notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })
      await markNotificationsRead()
    },

    reset: () => set({ notifications: [], unreadCount: 0, isHydrated: false }),
  })
)
