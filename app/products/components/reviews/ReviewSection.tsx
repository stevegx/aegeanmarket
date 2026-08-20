'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ThumbsUpIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { createReply } from '@/app/actions/createReply'
import { deleteReply } from '@/app/actions/deleteReply'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import StarRating from './StarRating'
import { ReviewData } from './types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('el-GR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ReviewSection({
  reviews,
  currentUserId,
  isLoggedIn,
  onReplyAdded,
  onReplyDeleted,
  onToggleLike,
}: {
  reviews: ReviewData[]
  currentUserId: string | null
  isLoggedIn: boolean
  onReplyAdded: (reply: ReviewData) => void
  onReplyDeleted: (id: string) => void
  onToggleLike: (id: string) => void
}) {
  const topLevel = reviews
    .filter((r) => !r.parent)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  const repliesByParent = reviews
    .filter((r) => r.parent)
    .reduce<Record<string, ReviewData[]>>((acc, r) => {
      const key = r.parent as string
      acc[key] = acc[key] ? [...acc[key], r] : [r]
      return acc
    }, {})

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-10 py-10 flex flex-col gap-6">
      <h2 className="font-bold text-2xl text-aegean-dark">
        Κριτικές {topLevel.length > 0 && `(${topLevel.length})`}
      </h2>

      {topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Δεν υπάρχουν κριτικές ακόμα. Γίνε ο πρώτος!
        </p>
      ) : (
        <div className="flex flex-col">
          {topLevel.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              replies={(repliesByParent[review._id] || []).sort((a, b) =>
                a.createdAt > b.createdAt ? 1 : -1
              )}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              onToggleLike={onToggleLike}
              onReplyAdded={onReplyAdded}
              onReplyDeleted={onReplyDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewItem({
  review,
  replies,
  currentUserId,
  isLoggedIn,
  onToggleLike,
  onReplyAdded,
  onReplyDeleted,
}: {
  review: ReviewData
  replies: ReviewData[]
  currentUserId: string | null
  isLoggedIn: boolean
  onToggleLike: (id: string) => void
  onReplyAdded: (reply: ReviewData) => void
  onReplyDeleted: (id: string) => void
}) {
  const [replyTarget, setReplyTarget] = useState<{
    id: string
    username: string
  } | null>(null)

  const isLiked = Boolean(currentUserId && review.likes.includes(currentUserId))

  return (
    <div className="border-b border-aegean-gray/60 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-aegean-dark">
            {review.user.username}
          </span>
          <StarRating rating={review.rating ?? 0} size="size-3.5" />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(review.createdAt)}
        </span>
      </div>
      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
        {review.text}
      </p>
      <div className="flex items-center gap-4 mt-2">
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => onToggleLike(review._id)}
            className={cn(
              'flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors',
              isLiked
                ? 'text-aegean-terracotta'
                : 'text-muted-foreground hover:text-aegean-terracotta'
            )}
          >
            <HugeiconsIcon
              icon={ThumbsUpIcon}
              strokeWidth={2}
              className={cn('size-3.5', isLiked && 'fill-aegean-terracotta')}
            />
            {review.likes.length > 0 && review.likes.length}
          </button>
        )}
        {isLoggedIn && (
          <button
            type="button"
            onClick={() =>
              setReplyTarget({ id: review._id, username: review.user.username })
            }
            className="text-xs font-medium text-aegean-terracotta hover:underline cursor-pointer"
          >
            Απάντηση
          </button>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-3 ml-4 flex flex-col gap-3 border-l-2 border-aegean-gray/40 pl-4">
          {replies.map((reply) => (
            <div key={reply._id}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-aegean-dark">
                  {reply.user.username}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground mt-0.5">
                {reply.mentionedUser && (
                  <span className="text-aegean-terracotta font-medium">
                    @{reply.mentionedUser.username}{' '}
                  </span>
                )}
                {reply.text}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() =>
                      setReplyTarget({
                        id: reply._id,
                        username: reply.user.username,
                      })
                    }
                    className="text-xs font-medium text-aegean-terracotta hover:underline cursor-pointer"
                  >
                    Απάντηση
                  </button>
                )}
                {currentUserId === reply.user._id && (
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await deleteReply(reply._id)
                      if (result.success) onReplyDeleted(reply._id)
                    }}
                    className="text-xs font-medium text-destructive hover:underline cursor-pointer"
                  >
                    Διαγραφή
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {replyTarget && (
        <ReplyForm
          targetUsername={replyTarget.username}
          onCancel={() => setReplyTarget(null)}
          onSubmit={async (text) => {
            const result = await createReply(replyTarget.id, { text })
            if (result.success) {
              onReplyAdded(result.reply)
              setReplyTarget(null)
            }
            return result
          }}
        />
      )}
    </div>
  )
}

function ReplyForm({
  targetUsername,
  onCancel,
  onSubmit,
}: {
  targetUsername: string
  onCancel: () => void
  onSubmit: (text: string) => Promise<{ success: boolean; error?: string }>
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setIsPending(true)
    const result = await onSubmit(text)
    setIsPending(false)
    if (!result.success) setError(result.error || 'Κάτι πήγε στραβά')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 ml-4 flex flex-col gap-2">
      <Textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Απάντηση στον/στην @${targetUsername}...`}
        maxLength={1000}
        className="text-sm"
      />
      {error && (
        <p className="text-xs font-semibold text-aegean-green">{error}</p>
      )}
      <div className="flex items-center gap-2 self-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Άκυρο
        </Button>
        <Button type="submit" variant="buy" size="sm" disabled={isPending}>
          {isPending ? 'Αποστολή...' : 'Απάντηση'}
        </Button>
      </div>
    </form>
  )
}
