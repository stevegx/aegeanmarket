import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/getSession'
import { getAdminStats, getAllOrdersAdmin, getAllUsersAdmin } from '@/lib/db'
import AdminTabs from './components/AdminTabs'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    orderPage?: string
    orderStatus?: string
    orderSearch?: string
    userPage?: string
    userRole?: string
    userSearch?: string
  }>
}) {
  const {
    tab,
    orderPage,
    orderStatus,
    orderSearch,
    userPage,
    userRole,
    userSearch,
  } = await searchParams
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <h1 className="text-2xl font-bold text-destructive">
          Access Denied
        </h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    )
  }

  const [stats, orderData, userData] = await Promise.all([
    getAdminStats(),
    getAllOrdersAdmin({
      page: orderPage ? Number(orderPage) : 1,
      status: orderStatus,
      search: orderSearch,
    }),
    getAllUsersAdmin({
      page: userPage ? Number(userPage) : 1,
      role: userRole,
      search: userSearch,
    }),
  ])

  return (
    <div className="flex flex-col items-center m-10 max-w-[1600px] gap-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-aegean-dark">
        Admin Panel
      </h1>
      <AdminTabs
        defaultTab={tab}
        stats={stats}
        analyticsUrl={process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_URL}
        orders={orderData.orders}
        ordersTotalPages={orderData.totalPages}
        ordersCurrentPage={Math.max(1, Number(orderPage ?? 1) || 1)}
        orderStatusFilter={orderStatus}
        orderSearch={orderSearch}
        users={userData.users}
        usersTotalPages={userData.totalPages}
        usersCurrentPage={Math.max(1, Number(userPage ?? 1) || 1)}
        userRoleFilter={userRole}
        userSearch={userSearch}
        currentAdminId={session.userId}
      />
    </div>
  )
}
