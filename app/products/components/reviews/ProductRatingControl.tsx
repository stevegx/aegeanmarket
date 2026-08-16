'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createReview } from '@/app/actions/createReview'
import StarRatingInput from './StarRatingInput'
import { ReviewData } from './types'

export default function ProductRatingControl({
  productId,
  averageRating,
  isLoggedIn,
  myReview,
  onSaved,
  className,
}: {
  productId: string
  averageRating: number
  isLoggedIn: boolean
  myReview: ReviewData | null
  onSaved: (review: {
    _id: string
    rating: number
    text: string
    createdAt: string
  }) => void
  className?: string
}) {
  const router = useRouter()

  const handleRate = async (value: number) => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    const result = await createReview(productId, {
      rating: value,
      text: myReview?.text ?? '',
    })
    if (result.success) onSaved(result.review)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-bold text-sm text-aegean-dark">
        {averageRating}
      </span>
      <StarRatingInput
        value={Math.round(averageRating)}
        onChange={handleRate}
        size="size-4"
      />
    </div>
  )
}
