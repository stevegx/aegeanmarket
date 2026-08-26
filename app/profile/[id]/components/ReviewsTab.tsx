import Link from 'next/link'
import ProductImage from '@/components/productImage'
import StarRating from '@/app/products/components/reviews/StarRating'

export interface UserReviewData {
  _id: string
  product: { _id: string; name: string; image: string } | null
  parent: string | null
  mentionedUser: { _id: string; username: string } | null
  rating: number | null
  text: string
  createdAt: string
}

export default function ReviewsTab({ reviews }: { reviews: UserReviewData[] }) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-border rounded-lg p-10 text-center">
        <p className="text-lg font-semibold text-foreground">
          You haven&apos;t left any reviews or comments yet.
        </p>
        <Link
          href="/products"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Browse our products
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-card border border-border shadow-md rounded-lg p-5 flex flex-col gap-3 shadow-aegean-green/10"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {review.product ? (
              <Link
                href={`/products/${review.product._id}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative size-10 shrink-0 rounded-md overflow-hidden bg-muted">
                  <ProductImage
                    src={review.product.image}
                    alt={review.product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-sm text-foreground group-hover:text-aegean-terracotta transition-colors">
                  {review.product.name}
                </span>
              </Link>
            ) : (
              <span className="font-semibold text-sm text-muted-foreground">
                This product no longer exists
              </span>
            )}
            <span className="text-xs text-muted-foreground shrink-0">
              {new Date(review.createdAt).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {review.rating !== null ? (
            <StarRating rating={review.rating} size="size-4" />
          ) : (
            <span className="text-xs font-medium text-aegean-terracotta w-fit px-2 py-0.5 rounded-full bg-aegean-terracotta/10">
              Comment{' '}
              {review.mentionedUser && `to @${review.mentionedUser.username}`}
            </span>
          )}

          <p className="text-sm text-foreground whitespace-pre-wrap">
            {review.text}
          </p>
        </div>
      ))}
    </div>
  )
}
