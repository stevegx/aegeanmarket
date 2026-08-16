'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QuantityController } from '../components/productCard'
import FavoriteButton from '../components/FavoriteButton'
import ReviewSection from '../components/reviews/ReviewSection'
import ProductRatingControl from '../components/reviews/ProductRatingControl'
import { ReviewData } from '../components/reviews/types'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'
import { toggleReviewLike } from '@/app/actions/toggleReviewLike'
import { PageProduct } from './page'

export default function ProductDetails({
  product,
  reviews: initialReviews,
  currentUserId,
}: {
  product: PageProduct
  reviews: ReviewData[]
  currentUserId: string | null
}) {
  const buyItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const [reviews, setReviews] = useState(initialReviews)

  const quantity = cartItems.find((i) => i._id === product._id)?.quantity || 0

  const topLevelReviews = reviews.filter((r) => !r.parent)
  const myReview =
    (currentUserId &&
      topLevelReviews.find((r) => r.user._id === currentUserId)) ||
    null
  const averageRating =
    topLevelReviews.length > 0
      ? Math.round(
          (topLevelReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
            topLevelReviews.length) *
            10
        ) / 10
      : product.rating

  const handleReviewSaved = (saved: {
    _id: string
    rating: number
    text: string
    createdAt: string
  }) => {
    const username = useAuthStore.getState().username
    if (!currentUserId || !username) return
    const reviewData: ReviewData = {
      _id: saved._id,
      user: { _id: currentUserId, username },
      parent: null,
      mentionedUser: null,
      rating: saved.rating,
      text: saved.text,
      createdAt: saved.createdAt,
      likes: [],
    }
    setReviews((prev) => {
      const exists = prev.some((r) => r._id === reviewData._id)
      return exists
        ? prev.map((r) =>
            r._id === reviewData._id ? { ...reviewData, likes: r.likes } : r
          )
        : [...prev, reviewData]
    })
  }

  const handleReplyAdded = (reply: ReviewData) => {
    setReviews((prev) => [...prev, reply])
  }

  const handleReplyDeleted = (replyId: string) => {
    setReviews((prev) => prev.filter((r) => r._id !== replyId))
  }

  const handleToggleLike = async (reviewId: string) => {
    if (!currentUserId) return
    const wasLiked =
      reviews.find((r) => r._id === reviewId)?.likes.includes(currentUserId) ??
      false

    const applyLike = (liked: boolean) =>
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                likes: liked
                  ? [...r.likes, currentUserId]
                  : r.likes.filter((id) => id !== currentUserId),
              }
            : r
        )
      )

    applyLike(!wasLiked)
    const result = await toggleReviewLike(reviewId)
    if (!result.success) applyLike(wasLiked)
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row p-5 md:p-10 max-w-7xl mx-auto w-full items-center mt-10">
        <div className="w-full flex items-center justify-around rounded-lg p-4 aspect-square relative">
          <FavoriteButton
            productId={product._id}
            className="absolute top-4 right-4 z-10"
          />
          <Image
            src={product.image}
            alt={product.name}
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={85}
            priority
            fill
          />
        </div>

        <div className="w-full flex flex-col">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-4">
              <Link
                href="/products"
                className="text-gray-500 hover:text-blue-600 text-sm font-medium uppercase tracking-wider transition-colors"
              >
                Products
              </Link>
              <span className="text-gray-400 text-sm">/</span>
              <Link
                href={`/products?category=${product.category}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                {product.category}
              </Link>
            </div>
            <h1 className="font-bold text-3xl md:text-4xl text-gray-900 leading-tight">
              {product.name}
            </h1>
            {product.stock === 0 && (
              <div className="text-red-500 font-bold text-sm mt-2">
                ● OUT OF STOCK
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="font-extrabold text-3xl text-gray-900">
              {product.price} €
            </h2>
            <ProductRatingControl
              productId={product._id}
              averageRating={averageRating}
              isLoggedIn={isLoggedIn}
              myReview={myReview}
              onSaved={handleReviewSaved}
              className="mt-2"
            />
            <p className="text-gray-600 font-light mt-4 leading-relaxed line-clamp-4 lg:line-clamp-none">
              {product.description}
            </p>
          </div>

          <hr className="my-6 border-gray-100" />

          <div className="w-full">
            {quantity === 0 ? (
              product.stock > 0 ? (
                <Button
                  variant="buy"
                  className="w-full transition-all duration-300 animate-in fade-in zoom-in-95 p-5"
                  onClick={() => buyItem(product)}
                >
                  BUY
                </Button>
              ) : (
                <Button variant="disabledBuy" className="p-5 w-full" disabled>
                  BUY
                </Button>
              )
            ) : (
              <QuantityController product={product} />
            )}
          </div>

          <hr className="my-6 border-gray-100" />

          <div className="border rounded-xl divide-y divide-gray-100 overflow-hidden">
            {/* Free Delivery Section */}
            <div className="flex items-start p-4 gap-4 bg-white">
              <div className="mt-1 text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m-10.5-11.25h10.5a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25V9.75a2.25 2.25 0 0 1 2.25-2.25Z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Free Delivery</h3>
                <p className="text-sm text-gray-500 font-light">
                  Enter your postal code for delivery Availability
                </p>
              </div>
            </div>

            {/* Return Delivery Section */}
            <div className="flex items-start p-4 gap-4 bg-white">
              <div className="mt-1 text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Return Delivery</h3>
                <p className="text-sm text-gray-500 font-light">
                  Free 30 Days Delivery Returns.{' '}
                  <span className="underline cursor-pointer hover:text-black transition-colors">
                    Details
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReviewSection
        productId={product._id}
        reviews={reviews}
        currentUserId={currentUserId}
        isLoggedIn={isLoggedIn}
        onReviewSaved={handleReviewSaved}
        onReplyAdded={handleReplyAdded}
        onReplyDeleted={handleReplyDeleted}
        onToggleLike={handleToggleLike}
      />
    </>
  )
}
