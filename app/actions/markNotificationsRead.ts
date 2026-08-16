'use server'

import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import Notification from '@/models/Notification'

type MarkReadResult = { success: true } | { success: false; error: string }

export async function markNotificationsRead(
  notificationId?: string
): Promise<MarkReadResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  await connectDB()

  if (notificationId) {
    if (!mongoose.isValidObjectId(notificationId)) {
      return { success: false, error: 'Invalid notification' }
    }
    await Notification.updateOne(
      { _id: notificationId, recipient: session.userId },
      { $set: { read: true } }
    )
  } else {
    await Notification.updateMany(
      { recipient: session.userId, read: false },
      { $set: { read: true } }
    )
  }

  return { success: true }
}
