'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminUpdateUserSchema, AdminUpdateUserData } from '@/lib/validate'
import User from '@/models/User'

type Result = { success: true } | { success: false; error: string }

export async function adminUpdateUser(
  targetUserId: string,
  data: AdminUpdateUserData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(targetUserId)) {
    return { success: false, error: 'Invalid user id' }
  }

  const parsed = adminUpdateUserSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Invalid user data' }
  }
  const input = parsed.data

  await connectDB()

  const target = await User.findById(targetUserId)
  if (!target) return { success: false, error: 'User not found' }

  const isSelf = targetUserId === admin.userId
  if (isSelf && input.role !== 'admin') {
    return { success: false, error: 'You cannot remove your own admin role' }
  }
  if (isSelf && !input.isActive) {
    return { success: false, error: 'You cannot deactivate your own account' }
  }

  if (target.role === 'admin' && input.role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount <= 1) {
      return { success: false, error: 'Cannot remove the last admin' }
    }
  }

  const duplicate = await User.findOne({
    _id: { $ne: targetUserId },
    $or: [{ username: input.username }, { email: input.email }],
  })
  if (duplicate) {
    return { success: false, error: 'Username or email already in use' }
  }

  target.username = input.username
  target.email = input.email
  target.address = input.address
  target.phone = input.phone
  target.role = input.role
  target.isActive = input.isActive

  try {
    await target.save()
  } catch {
    // Most likely a duplicate-key race on the unique username/email index.
    return { success: false, error: 'Username or email already in use' }
  }

  revalidatePath('/adminpage')
  return { success: true }
}
