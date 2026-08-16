'use server'

import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { changePasswordSchema, ChangePasswordFormData } from '@/lib/validate'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

type ChangePasswordResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function changePassword(
  data: ChangePasswordFormData
): Promise<ChangePasswordResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }
  const { currentPassword, newPassword } = parsed.data

  await connectDB()

  const user = await User.findById(session.userId).select('+password')
  if (!user) return { success: false, error: 'User not found' }

  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    return {
      success: false,
      error: 'Invalid data',
      fieldErrors: { currentPassword: ['Current password is incorrect'] },
    }
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  return { success: true }
}
