'use client'

import { useState } from 'react'
import { createReview } from '@/app/actions/createReview'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ReviewData } from './types'

export default function ReviewCommentForm({
  productId,
  myReview,
  onSaved,
}: {
  productId: string
  myReview: ReviewData | null
  onSaved: (review: {
    _id: string
    rating: number
    text: string
    createdAt: string
  }) => void
}) {
  const [text, setText] = useState(myReview?.text ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  if (!myReview) {
    return (
      <p className="text-sm text-gray-500">
        Βαθμολόγησε πρώτα το προϊόν παραπάνω για να αφήσεις σχόλιο.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)
    const result = await createReview(productId, {
      rating: myReview.rating ?? 1,
      text,
    })
    setIsPending(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    onSaved(result.review)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 border border-aegean-gray rounded-lg p-4 bg-white"
    >
      <span className="font-semibold text-sm text-aegean-dark">
        {myReview.text ? 'Επεξεργασία σχολίου' : 'Άφησε ένα σχόλιο'}
      </span>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Πες μας τη γνώμη σου για το προϊόν..."
        maxLength={1000}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="submit"
        variant="buy"
        className="self-end px-4"
        disabled={isPending}
      >
        {isPending ? 'Αποθήκευση...' : 'Δημοσίευση'}
      </Button>
    </form>
  )
}
