'use client'

import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProfileInfoTab, { ProfileUser } from './ProfileInfoTab'
import SecurityTab from './SecurityTab'
import OrdersTab, { OrderData } from './OrdersTab'
import FavoritesTab, { FavoriteProduct } from './FavoritesTab'
import ReviewsTab, { UserReviewData } from './ReviewsTab'

interface ProfileTabsProps {
  user: ProfileUser
  orders: OrderData[]
  favorites: FavoriteProduct[]
  reviews: UserReviewData[]
  defaultTab?: string
}

const VALID_TABS = ['info', 'security', 'orders', 'favorites', 'reviews']

export default function ProfileTabs({
  user,
  orders,
  favorites,
  reviews,
  defaultTab,
}: ProfileTabsProps) {
  const initialTab = VALID_TABS.includes(defaultTab || '') ? defaultTab : 'info'

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-6">
      <div className="h-16 w-16 relative">
        <Image
          src="/images/userDefaultImage.png"
          alt="User Default Image"
          fill
          className="object-contain"
        />
      </div>
      <h2 className="font-bold text-xl">
        Hello {user.role},{' '}
        <span className="text-aegean-dark">{user.username}</span>
      </h2>

      <Tabs defaultValue={initialTab} className="w-full items-center">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="orders">
            Orders {orders.length > 0 && `(${orders.length})`}
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites {favorites.length > 0 && `(${favorites.length})`}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="w-full">
          <ProfileInfoTab user={user} />
        </TabsContent>
        <TabsContent value="security" className="w-full">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="orders" className="w-full">
          <OrdersTab orders={orders} />
        </TabsContent>
        <TabsContent value="favorites" className="w-full">
          <FavoritesTab favorites={favorites} />
        </TabsContent>
        <TabsContent value="reviews" className="w-full">
          <ReviewsTab reviews={reviews} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
