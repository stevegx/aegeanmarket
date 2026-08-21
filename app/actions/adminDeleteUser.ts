'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import User from '@/models/User'

type Result = { success: true } | { success: false; error: string }

export async function adminDeleteUser(targetUserId: string): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(targetUserId)) {
    return { success: false, error: 'Invalid user id' }
  }

  if (targetUserId === admin.userId) {
    return { success: false, error: 'You cannot delete your own account' }
  }

  await connectDB()

  const target = await User.findById(targetUserId)
  if (!target) return { success: false, error: 'User not found' }

  if (target.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      return { success: false, error: 'Cannot delete the last admin' }
    }
  }

  // Orders/reviews from this user are kept as historical records; their
  // `user` reference is simply left pointing at a now-deleted document,
  // the same way guest checkout already leaves that field empty.
  await User.findByIdAndDelete(targetUserId)

  revalidatePath('/adminpage')
  return { success: true }
}
