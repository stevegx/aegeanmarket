'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import Review from '@/models/Review'
import Notification from '@/models/Notification'

type DeleteReplyResult = { success: true } | { success: false; error: string }

export async function deleteReply(replyId: string): Promise<DeleteReplyResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  if (!mongoose.isValidObjectId(replyId)) {
    return { success: false, error: 'Invalid reply' }
  }

  await connectDB()

  const reply = await Review.findOne({
    _id: replyId,
    user: session.userId,
    parent: { $ne: null },
  })
  if (!reply) return { success: false, error: 'Reply not found' }

  await Notification.deleteMany({ review: reply._id })
  await reply.deleteOne()

  revalidatePath(`/products/${reply.product.toString()}`)

  return { success: true }
}
