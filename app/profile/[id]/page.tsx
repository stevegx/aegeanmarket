import { redirect } from 'next/navigation'
import { getSession } from '@/app/actions/getSession'
import {
  getUserFromDb,
  getUserOrders,
  getUserFavorites,
  getUserReviews,
} from '@/lib/db'
import ProfileTabs from './components/ProfileTabs'

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  if (session.userId !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to view this profile.</p>
      </div>
    )
  }

  const user = await getUserFromDb(id)
  if (!user) {
    redirect('/login')
  }

  const [orders, favorites, reviews] = await Promise.all([
    getUserOrders(id),
    getUserFavorites(id),
    getUserReviews(id),
  ])

  return (
    <div className="flex flex-col items-center w-full px-4 py-10 gap-6">
      <h1 className="font-bold text-4xl text-center text-aegean-dark">
        Profile
      </h1>
      <ProfileTabs
        user={{
          id,
          username: user.username,
          email: user.email,
          address: user.address,
          phone: user.phone,
          role: user.role,
        }}
        orders={orders}
        favorites={favorites}
        reviews={reviews}
        defaultTab={tab}
      />
    </div>
  )
}
