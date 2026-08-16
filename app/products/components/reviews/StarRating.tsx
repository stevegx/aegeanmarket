import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

export default function StarRating({
  rating,
  size = 'size-4',
}: {
  rating: number
  size?: string
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          className={cn(
            size,
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-aegean-gray'
          )}
        />
      ))}
    </div>
  )
}
