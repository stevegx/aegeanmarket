'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createReview } from '@/app/actions/createReview'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import StarRatingInput from '../../components/reviews/StarRatingInput'

export default function RateProductForm({
  productId,
  productName,
  initialRating,
  initialText,
}: {
  productId: string
  productName: string
  initialRating: number
  initialText: string
}) {
  const router = useRouter()
  const [rating, setRating] = useState(initialRating)
  const [text, setText] = useState(initialText)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating < 1) {
      setError('Please select a star rating.')
      return
    }
    if (!text.trim()) {
      setError('A written review is required.')
      return
    }

    setIsPending(true)
    const result = await createReview(productId, { rating, text })
    setIsPending(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.push(`/products/${productId}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-5 md:px-10 py-10">
      <Link
        href={`/products/${productId}`}
        className="text-sm text-muted-foreground hover:text-aegean-terracotta transition-colors"
      >
        ← Back to product
      </Link>

      <h1 className="font-bold text-2xl text-aegean-dark mt-4">
        Rate &quot;{productName}&quot;
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border border-aegean-gray rounded-lg p-6 bg-white mt-6"
      >
        <div>
          <span className="font-semibold text-sm text-aegean-dark block mb-2">
            Rating *
          </span>
          <StarRatingInput value={rating} onChange={setRating} size="size-8" />
        </div>

        <div>
          <span className="font-semibold text-sm text-aegean-dark block mb-2">
            Written review *
          </span>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us what you think about the product..."
            maxLength={1000}
            className="min-h-32"
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-aegean-green-text">{error}</p>
        )}

        <Button
          type="submit"
          variant="buy"
          size="lg"
          className="self-end font-bold"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Post'}
        </Button>
      </form>
    </div>
  )
}
