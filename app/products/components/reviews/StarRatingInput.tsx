'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

export default function StarRatingInput({
  value,
  onChange,
  size = 'size-6',
}: {
  value: number
  onChange: (value: number) => void
  size?: string
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          className="cursor-pointer p-0.5"
          aria-label={`${star} από 5 αστέρια`}
        >
          <HugeiconsIcon
            icon={StarIcon}
            className={cn(
              size,
              'transition-colors',
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-aegean-gray'
            )}
          />
        </button>
      ))}
    </div>
  )
}
