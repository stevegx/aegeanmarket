'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ThumbsUpIcon, StarIcon } from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { createReply } from '@/app/actions/createReply'
import { deleteReply } from '@/app/actions/deleteReply'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import StarRating from './StarRating'
import { ReviewData } from './types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

const SORT_OPTIONS = {
  newest: 'Newest first',
  highest: 'Highest rated',
  lowest: 'Lowest rated',
} as const

type SortKey = keyof typeof SORT_OPTIONS

export function WriteReviewButton({
  productId,
  isLoggedIn,
  hasOwnReview,
  variant = 'buy',
  size = 'sm',
  showIcon = true,
  className,
}: {
  productId: string
  isLoggedIn: boolean
  hasOwnReview: boolean
  variant?: 'buy' | 'outline'
  size?: 'sm' | 'xs'
  showIcon?: boolean
  className?: string
}) {
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('font-semibold gap-1.5', className)}
        onClick={() => router.push('/login')}
      >
        {showIcon && <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-4" />}
        Log in to write a review
      </Button>
    )
  }

  return (
    <Link href={`/products/${productId}/rate`}>
      <Button variant={variant} size={size} className={cn('font-semibold gap-1.5', className)}>
        {showIcon && <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-4" />}
        {hasOwnReview ? 'Edit your review' : 'Write a review'}
      </Button>
    </Link>
  )
}

export default function ReviewSection({
  productId,
  reviews,
  currentUserId,
  isLoggedIn,
  onReplyAdded,
  onReplyDeleted,
  onToggleLike,
}: {
  productId: string
  reviews: ReviewData[]
  currentUserId: string | null
  isLoggedIn: boolean
  onReplyAdded: (reply: ReviewData) => void
  onReplyDeleted: (id: string) => void
  onToggleLike: (id: string) => void
}) {
  const [sort, setSort] = useState<SortKey>('newest')
  const hasOwnReview = Boolean(
    currentUserId &&
      reviews.some((r) => !r.parent && r.user._id === currentUserId)
  )

  const topLevel = useMemo(() => {
    const items = reviews.filter((r) => !r.parent)
    return [...items].sort((a, b) => {
      if (sort === 'highest') return (b.rating ?? 0) - (a.rating ?? 0)
      if (sort === 'lowest') return (a.rating ?? 0) - (b.rating ?? 0)
      return a.createdAt < b.createdAt ? 1 : -1
    })
  }, [reviews, sort])

  const repliesByParent = reviews
    .filter((r) => r.parent)
    .reduce<Record<string, ReviewData[]>>((acc, r) => {
      const key = r.parent as string
      acc[key] = acc[key] ? [...acc[key], r] : [r]
      return acc
    }, {})

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-10 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap border-l-4 border-aegean-dark pl-4">
        <div>
          <h2 className="font-bold text-2xl md:text-3xl text-foreground">
            Reviews {topLevel.length > 0 && `(${topLevel.length})`}
          </h2>
          <p className="text-muted-foreground text-sm italic">
            What our customers are saying
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {topLevel.length > 1 && (
            <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
              <SelectTrigger className="h-9 px-3 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SORT_OPTIONS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {topLevel.length > 0 && (
            <WriteReviewButton
              productId={productId}
              isLoggedIn={isLoggedIn}
              hasOwnReview={hasOwnReview}
            />
          )}
        </div>
      </div>

      {topLevel.length === 0 ? (
        <Card className="items-center justify-center gap-3 py-12 text-center border-dashed">
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first!
          </p>
          <WriteReviewButton
            productId={productId}
            isLoggedIn={isLoggedIn}
            hasOwnReview={hasOwnReview}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <Card className="p-5 gap-3 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-full bg-aegean-dark text-white text-xs font-bold shrink-0">
            {initials(review.user.username)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm text-foreground">
              {review.user.username}
            </span>
            <StarRating rating={review.rating ?? 0} size="size-3.5" />
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(review.createdAt)}
        </span>
      </div>

      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {review.text}
      </p>

      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => onToggleLike(review._id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium cursor-pointer transition-colors',
              isLiked
                ? 'bg-aegean-dark text-white'
                : 'bg-muted text-muted-foreground hover:bg-aegean-dark hover:text-white'
            )}
          >
            <HugeiconsIcon
              icon={ThumbsUpIcon}
              strokeWidth={2}
              className={cn('size-3.5', isLiked && 'fill-current')}
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
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-aegean-dark hover:text-white cursor-pointer"
          >
            Reply
          </button>
        )}
      </div>

      {replies.length > 0 && (
        <div className="flex flex-col gap-3 border-l-2 border-border pl-4">
          {replies.map((reply) => (
            <div key={reply._id}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-foreground">
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
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-aegean-dark hover:text-white cursor-pointer"
                  >
                    Reply
                  </button>
                )}
                {currentUserId === reply.user._id && (
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await deleteReply(reply._id)
                      if (result.success) onReplyDeleted(reply._id)
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-white cursor-pointer"
                  >
                    Delete
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
    </Card>
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
    if (!result.success) setError(result.error || 'Something went wrong')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Reply to @${targetUsername}...`}
        maxLength={1000}
        className="text-sm"
      />
      {error && (
        <p className="text-xs font-semibold text-aegean-green-text">{error}</p>
      )}
      <div className="flex items-center gap-2 self-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="buy" size="sm" disabled={isPending}>
          {isPending ? 'Sending...' : 'Reply'}
        </Button>
      </div>
    </form>
  )
}
