import Link from 'next/link'
import Image from 'next/image'
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
      <div className="flex flex-col items-center justify-center gap-3 border border-aegean-gray rounded-lg p-10 text-center">
        <p className="text-lg font-semibold text-aegean-dark">
          Δεν έχεις αφήσει καμία κριτική ή σχόλιο ακόμα.
        </p>
        <Link
          href="/products"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Δες τα προϊόντα μας
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border border-aegean-gray shadow-md rounded-lg p-5 flex flex-col gap-3 shadow-aegean-green/10"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {review.product ? (
              <Link
                href={`/products/${review.product._id}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative size-10 shrink-0 rounded-md overflow-hidden bg-aegean-gray/30">
                  <Image
                    src={review.product.image}
                    alt={review.product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-sm text-aegean-dark group-hover:text-aegean-terracotta transition-colors">
                  {review.product.name}
                </span>
              </Link>
            ) : (
              <span className="font-semibold text-sm text-gray-400">
                Το προϊόν δεν υπάρχει πια
              </span>
            )}
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(review.createdAt).toLocaleDateString('el-GR', {
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
              Σχόλιο{' '}
              {review.mentionedUser && `προς @${review.mentionedUser.username}`}
            </span>
          )}

          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {review.text}
          </p>
        </div>
      ))}
    </div>
  )
}
