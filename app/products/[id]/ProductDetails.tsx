'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  Home01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons'
import ProductImage from '@/components/productImage'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QuantityController } from '../components/productCard'
import FavoriteButton from '../components/FavoriteButton'
import ReviewSection, { WriteReviewButton } from '../components/reviews/ReviewSection'
import StarRating from '../components/reviews/StarRating'
import { ReviewData } from '../components/reviews/types'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '@/app/(auth)/store/useAuthStore'
import { toggleReviewLike } from '@/app/actions/toggleReviewLike'
import ProductEditDialog from '@/app/adminpage/components/ProductEditDialog'
import ProductCarousel from '@/components/mainPageComponents/productCarousel'
import { RelatedProduct } from '@/lib/db'
import { PageProduct } from './page'

function Breadcrumbs({ product }: { product: PageProduct }) {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/products?category=${product.category}` },
    { label: product.name, href: null },
  ]

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 flex-wrap text-sm text-muted-foreground"
    >
      {crumbs.map((crumb, index) => (
        <span key={crumb.label + index} className="flex items-center gap-1.5">
          {index > 0 && (
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-3.5 shrink-0"
            />
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-aegean-dark transition-colors flex items-center gap-1"
            >
              {index === 0 && <HugeiconsIcon icon={Home01Icon} className="size-3.5" />}
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium line-clamp-1 max-w-[220px] sm:max-w-none">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">
        {value}
      </span>
    </div>
  )
}

export default function ProductDetails({
  product,
  reviews: initialReviews,
  currentUserId,
  isAdmin,
  relatedProducts,
}: {
  product: PageProduct
  reviews: ReviewData[]
  currentUserId: string | null
  isAdmin: boolean
  relatedProducts: RelatedProduct[]
}) {
  const buyItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const [reviews, setReviews] = useState(initialReviews)

  const quantity = cartItems.find((i) => i._id === product._id)?.quantity || 0

  const topLevelReviews = reviews.filter((r) => !r.parent)
  const hasOwnReview = Boolean(
    currentUserId && topLevelReviews.some((r) => r.user._id === currentUserId)
  )
  const averageRating =
    topLevelReviews.length > 0
      ? Math.round(
          (topLevelReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
            topLevelReviews.length) *
            10
        ) / 10
      : product.rating

  const specs = [
    { label: 'Manufacturer', value: product.manufacturer },
    { label: 'Origin', value: product.origin },
    { label: 'Volume', value: product.volume },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value))

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
      <div className="max-w-7xl mx-auto w-full px-5 md:px-10 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Breadcrumbs product={product} />
          {isAdmin && <ProductEditDialog product={product} />}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-5 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square w-full rounded-2xl bg-white overflow-hidden ring-1 ring-border/50 shadow-sm">
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
              className={`object-contain p-10 ${product.stock === 0 ? 'grayscale' : ''}`}
              sizes="(max-width: 1024px) 100vw, 560px"
              quality={85}
              priority
              fill
            />
          </div>
        </div>

        {/* Info column */}
        <div className="flex flex-col gap-5 pb-2">
          <div className="flex flex-col gap-2">
            <Link
              href={`/products?category=${product.category}`}
              className="text-muted-foreground hover:text-aegean-dark text-xs font-semibold uppercase tracking-widest transition-colors w-fit"
            >
              {product.category}
            </Link>

            <h1 className="font-bold text-3xl md:text-4xl text-foreground leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={averageRating} size="size-5" />
              <span className="text-sm font-semibold text-foreground">
                {averageRating}
              </span>
              {topLevelReviews.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({topLevelReviews.length} review
                  {topLevelReviews.length === 1 ? '' : 's'})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-extrabold text-4xl text-aegean-blue">
              {product.price} €
            </p>
            {product.stock > 0 ? (
              <Badge variant="secondary" className="gap-1 h-6 px-2.5 text-xs">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-aegean-green-text" />
                In stock
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 h-6 px-2.5 text-xs">
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                Out of stock
              </Badge>
            )}
          </div>

          <div className="w-full max-w-sm">
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

          <WriteReviewButton
            productId={product._id}
            isLoggedIn={isLoggedIn}
            hasOwnReview={hasOwnReview}
            variant="outline"
            showIcon={false}
            className="w-fit"
          />

          <Separator />

          {specs.length > 0 && (
            <div className="flex flex-col divide-y divide-border">
              {specs.map((spec) => (
                <SpecRow key={spec.label} label={spec.label} value={spec.value} />
              ))}
            </div>
          )}

          {specs.length > 0 && <Separator />}

          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-lg text-foreground">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <ProductCarousel
            products={relatedProducts}
            tittle="You might also like"
            compact
          />
        </div>
      )}

      <ReviewSection
        productId={product._id}
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
