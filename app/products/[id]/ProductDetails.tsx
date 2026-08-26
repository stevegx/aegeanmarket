'use client'

import { useState } from 'react'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QuantityController } from '../components/productCard'
import FavoriteButton from '../components/FavoriteButton'
import ReviewSection from '../components/reviews/ReviewSection'
import StarRating from '../components/reviews/StarRating'
import { ReviewData } from '../components/reviews/types'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'
import { toggleReviewLike } from '@/app/actions/toggleReviewLike'
import ProductEditDialog from '@/app/adminpage/components/ProductEditDialog'
import { PageProduct } from './page'

export default function ProductDetails({
  product,
  reviews: initialReviews,
  currentUserId,
  isAdmin,
}: {
  product: PageProduct
  reviews: ReviewData[]
  currentUserId: string | null
  isAdmin: boolean
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
      <div className="max-w-md mx-auto w-full px-5 md:px-0 mt-10">
        {isAdmin && (
          <div className="flex justify-end mb-3">
            <ProductEditDialog product={product} />
          </div>
        )}

        <Card className="gap-0 overflow-hidden pt-0">
          <div className="relative aspect-square w-full bg-white">
            <FavoriteButton
              productId={product._id}
              className="absolute top-4 right-4 z-10"
            />
            {product.stock === 0 && (
              <span className="z-10 absolute text-sm font-bold text-white bg-black/70 px-3 py-1.5 rounded top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                OUT OF STOCK
              </span>
            )}
            <ProductImage
              src={product.image}
              alt={product.name}
              className={`object-contain p-8 ${product.stock === 0 ? 'grayscale' : ''}`}
              sizes="(max-width: 768px) 100vw, 448px"
              quality={85}
              priority
              fill
            />
          </div>

          <CardContent className="flex flex-col items-center gap-2 px-6 pt-6 pb-6 text-center">
            <Link
              href={`/products?category=${product.category}`}
              className="text-muted-foreground hover:text-aegean-dark text-xs font-semibold uppercase tracking-widest transition-colors"
            >
              {product.category}
            </Link>

            <h1 className="font-bold text-3xl text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size="size-5" />
              <span className="text-sm font-semibold text-foreground">
                {averageRating}
              </span>
            </div>

            <p className="font-extrabold text-4xl text-aegean-blue mt-2">
              {product.price} €
            </p>

            <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3 mt-2">
              {product.description}
            </p>

            <div className="w-full mt-4">
              {quantity === 0 ? (
                product.stock > 0 ? (
                  <Button
                    variant="buy"
                    size="lg"
                    className="w-full transition-all duration-300 animate-in fade-in zoom-in-95"
                    onClick={() => buyItem(product)}
                  >
                    BUY
                  </Button>
                ) : (
                  <Button variant="disabledBuy" size="lg" className="w-full" disabled>
                    BUY
                  </Button>
                )
              ) : (
                <QuantityController product={product} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoggedIn && (
        <div className="max-w-7xl mx-auto w-full px-5 md:px-10 pb-4">
          <Link href={`/products/${product._id}/rate`}>
            <Button
              variant="buy"
              size="lg"
              className="w-full sm:w-auto font-bold"
            >
              {myReview ? 'Edit your rating' : 'Rate this product'}
            </Button>
          </Link>
        </div>
      )}

      <ReviewSection
        reviews={reviews}
        currentUserId={currentUserId}
        isLoggedIn={isLoggedIn}
        onReplyAdded={handleReplyAdded}
        onReplyDeleted={handleReplyDeleted}
        onToggleLike={handleToggleLike}
      />
    </>
  )
}
