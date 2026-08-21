'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardTab from './DashboardTab'
import OrdersTab from './OrdersTab'
import UsersTab from './UsersTab'
import type { AdminStats, AdminOrderListItem, AdminUserListItem } from '@/lib/db'

const VALID_TABS = ['dashboard', 'orders', 'users']

interface AdminTabsProps {
  defaultTab?: string
  stats: AdminStats
  analyticsUrl?: string
  orders: AdminOrderListItem[]
  ordersTotalPages: number
  ordersCurrentPage: number
  orderStatusFilter?: string
  orderSearch?: string
  users: AdminUserListItem[]
  usersTotalPages: number
  usersCurrentPage: number
  userRoleFilter?: string
  userSearch?: string
  currentAdminId: string
}

export default function AdminTabs({
  defaultTab,
  stats,
  analyticsUrl,
  orders,
  ordersTotalPages,
  ordersCurrentPage,
  orderStatusFilter,
  orderSearch,
  users,
  usersTotalPages,
  usersCurrentPage,
  userRoleFilter,
  userSearch,
  currentAdminId,
}: AdminTabsProps) {
  const initialTab = VALID_TABS.includes(defaultTab || '')
    ? defaultTab
    : 'dashboard'

  return (
    <Tabs defaultValue={initialTab} className="w-full items-center gap-6">
      <TabsList>
        <TabsTrigger
          value="dashboard"
          className="text-base px-4 py-2 font-semibold data-selected:!bg-aegean-green data-selected:!text-aegean-white data-selected:!shadow-md"
        >
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="orders"
          className="text-base px-4 py-2 font-semibold data-selected:!bg-aegean-green data-selected:!text-aegean-white data-selected:!shadow-md"
        >
          Orders
        </TabsTrigger>
        <TabsTrigger
          value="users"
          className="text-base px-4 py-2 font-semibold data-selected:!bg-aegean-green data-selected:!text-aegean-white data-selected:!shadow-md"
        >
          Users
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="w-full">
        <DashboardTab stats={stats} analyticsUrl={analyticsUrl} />
      </TabsContent>
      <TabsContent value="orders" className="w-full">
        <OrdersTab
          orders={orders}
          totalPages={ordersTotalPages}
          currentPage={ordersCurrentPage}
          statusFilter={orderStatusFilter}
          search={orderSearch}
        />
      </TabsContent>
      <TabsContent value="users" className="w-full">
        <UsersTab
          users={users}
          totalPages={usersTotalPages}
          currentPage={usersCurrentPage}
          roleFilter={userRoleFilter}
          search={userSearch}
          currentAdminId={currentAdminId}
        />
      </TabsContent>
    </Tabs>
  )
}
