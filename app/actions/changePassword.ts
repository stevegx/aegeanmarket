'use server'

import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { changePasswordSchema, ChangePasswordFormData } from '@/lib/validate'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

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

  // Re-issue tokens so a stolen access/refresh token pair from before the
  // password change stops working (same pattern as updateProfile.ts).
  const tokenPayload = {
    userId: user._id.toString(),
    username: user.username,
    role: user.role,
  }

  const accessToken = await new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)

  const cookieStore = await cookies()
  cookieStore.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 5,
    path: '/',
  })
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return { success: true }
}
