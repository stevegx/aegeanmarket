'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminCreateUserSchema, AdminCreateUserData } from '@/lib/validate'
import User from '@/models/User'

type Result = { success: true } | { success: false; error: string }

export async function adminCreateUser(
  data: AdminCreateUserData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  const parsed = adminCreateUserSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid user data',
    }
  }
  const input = parsed.data

  await connectDB()

  const existing = await User.findOne({
    $or: [{ username: input.username }, { email: input.email }],
  })
  if (existing) {
    return { success: false, error: 'Username or email already in use' }
  }

  const hashedPassword = await bcrypt.hash(input.password, 10)

  try {
    await User.create({
      username: input.username,
      email: input.email,
      password: hashedPassword,
      address: input.address,
      phone: input.phone,
      role: input.role,
      isActive: input.isActive,
    })
  } catch {
    return { success: false, error: 'Username or email already in use' }
  }

  revalidatePath('/adminpage')
  return { success: true }
}
