'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardTab from './DashboardTab'
import OrdersTab from './OrdersTab'
import UsersTab from './UsersTab'
import BlogTab from './BlogTab'
import ProductsTab from './ProductsTab'
import type {
  AdminStats,
  AdminOrderListItem,
  AdminUserListItem,
  BlogPostDoc,
  AdminProductListItem,
} from '@/lib/db'

const VALID_TABS = ['dashboard', 'orders', 'users', 'blog', 'products']

const TAB_TRIGGER_CLASS =
  'text-base px-4 py-2 font-semibold data-selected:!bg-aegean-green data-selected:!text-aegean-white data-selected:!shadow-md'

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
  blogPosts: BlogPostDoc[]
  blogTotalPages: number
  blogCurrentPage: number
  blogSearch?: string
  products: AdminProductListItem[]
  productsTotalPages: number
  productsCurrentPage: number
  productSearch?: string
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
  blogPosts,
  blogTotalPages,
  blogCurrentPage,
  blogSearch,
  products,
  productsTotalPages,
  productsCurrentPage,
  productSearch,
}: AdminTabsProps) {
  const initialTab = VALID_TABS.includes(defaultTab || '')
    ? defaultTab
    : 'dashboard'

  return (
    <Tabs defaultValue={initialTab} className="w-full items-center gap-6">
      <TabsList>
        <TabsTrigger value="dashboard" className={TAB_TRIGGER_CLASS}>
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="orders" className={TAB_TRIGGER_CLASS}>
          Orders
        </TabsTrigger>
        <TabsTrigger value="users" className={TAB_TRIGGER_CLASS}>
          Users
        </TabsTrigger>
        <TabsTrigger value="blog" className={TAB_TRIGGER_CLASS}>
          Blog
        </TabsTrigger>
        <TabsTrigger value="products" className={TAB_TRIGGER_CLASS}>
          Products
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
      <TabsContent value="blog" className="w-full">
        <BlogTab
          posts={blogPosts}
          totalPages={blogTotalPages}
          currentPage={blogCurrentPage}
          search={blogSearch}
        />
      </TabsContent>
      <TabsContent value="products" className="w-full">
        <ProductsTab
          products={products}
          totalPages={productsTotalPages}
          currentPage={productsCurrentPage}
          search={productSearch}
        />
      </TabsContent>
    </Tabs>
  )
}
