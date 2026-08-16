'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { replySchema, ReplyFormData } from '@/lib/validate'
import Review from '@/models/Review'
import Notification from '@/models/Notification'

type ReplyResult = {
  _id: string
  user: { _id: string; username: string }
  parent: string
  mentionedUser: { _id: string; username: string } | null
  rating: null
  text: string
  createdAt: string
  likes: string[]
}

type CreateReplyResult =
  | { success: true; reply: ReplyResult }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createReply(
  parentId: string,
  data: ReplyFormData
): Promise<CreateReplyResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  if (!mongoose.isValidObjectId(parentId)) {
    return { success: false, error: 'Invalid review' }
  }

  const parsed = replySchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  await connectDB()

  const parent = await Review.findById(parentId)
  if (!parent) return { success: false, error: 'Review not found' }

  // Keep replies one level deep: replying to a reply attaches to its thread root,
  // but still mentions the person actually being replied to.
  const threadId = parent.parent ?? parent._id
  const mentionedUser = parent.user

  const reply = await Review.create({
    product: parent.product,
    user: session.userId,
    parent: threadId,
    mentionedUser,
    rating: null,
    text: parsed.data.text,
  })

  if (mentionedUser.toString() !== session.userId) {
    await Notification.create({
      recipient: mentionedUser,
      fromUser: session.userId,
      type: 'reply',
      product: parent.product,
      review: reply._id,
    })
  }

  revalidatePath(`/products/${parent.product.toString()}`)

  await reply.populate([
    { path: 'user', select: 'username' },
    { path: 'mentionedUser', select: 'username' },
  ])

  return { success: true, reply: JSON.parse(JSON.stringify(reply)) }
}
