'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import Review from '@/models/Review'

type ToggleReviewLikeResult =
  | { success: true; liked: boolean; likesCount: number }
  | { success: false; error: string }

export async function toggleReviewLike(
  reviewId: string
): Promise<ToggleReviewLikeResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  if (!mongoose.isValidObjectId(reviewId)) {
    return { success: false, error: 'Invalid review' }
  }

  await connectDB()

  const review = await Review.findOne({ _id: reviewId, parent: null }).select(
    'likes product'
  )
  if (!review) return { success: false, error: 'Review not found' }

  const alreadyLiked = review.likes.some(
    (id: mongoose.Types.ObjectId) => id.toString() === session.userId
  )

  const updated = await Review.findByIdAndUpdate(
    reviewId,
    { [alreadyLiked ? '$pull' : '$addToSet']: { likes: session.userId } },
    { new: true }
  ).select('likes')

  revalidatePath(`/products/${review.product.toString()}`)

  return {
    success: true,
    liked: !alreadyLiked,
    likesCount: updated.likes.length,
  }
}
