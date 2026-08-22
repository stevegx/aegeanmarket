import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/getSession'
import connectDB, {
  getAdminStats,
  getAllOrdersAdmin,
  getAllUsersAdmin,
  getAllBlogPostsAdmin,
  getAllProductsAdmin,
} from '@/lib/db'
import User from '@/models/User'
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
    blogPage?: string
    blogSearch?: string
    productPage?: string
    productSearch?: string
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
    blogPage,
    blogSearch,
    productPage,
    productSearch,
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

  // The JWT role claim above can be stale for up to 7 days (refresh tokens
  // aren't re-checked against the DB). Re-verify before showing admin data.
  await connectDB()
  const dbUser = await User.findById(session.userId).select('role isActive')
  if (!dbUser || dbUser.role !== 'admin' || !dbUser.isActive) {
    redirect('/')
  }

  const [stats, orderData, userData, blogData, productData] =
    await Promise.all([
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
      getAllBlogPostsAdmin({
        page: blogPage ? Number(blogPage) : 1,
        search: blogSearch,
      }),
      getAllProductsAdmin({
        page: productPage ? Number(productPage) : 1,
        search: productSearch,
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
        blogPosts={blogData.posts}
        blogTotalPages={blogData.totalPages}
        blogCurrentPage={Math.max(1, Number(blogPage ?? 1) || 1)}
        blogSearch={blogSearch}
        products={productData.products}
        productsTotalPages={productData.totalPages}
        productsCurrentPage={Math.max(1, Number(productPage ?? 1) || 1)}
        productSearch={productSearch}
      />
    </div>
  )
}
