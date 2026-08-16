'use server'

import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { updateProfileSchema, UpdateProfileFormData } from '@/lib/validate'
import User from '@/models/User'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

type UpdateProfileResult =
  | { success: true; user: UpdateProfileFormData }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function updateProfile(
  data: UpdateProfileFormData
): Promise<UpdateProfileResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = updateProfileSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }
  const profileData = parsed.data

  await connectDB()

  const conflict = await User.findOne({
    _id: { $ne: session.userId },
    $or: [
      { username: profileData.username },
      { email: profileData.email },
      { phone: profileData.phone },
    ],
  })
  if (conflict) {
    const fieldErrors: Record<string, string[]> = {}
    if (conflict.username === profileData.username)
      fieldErrors.username = ['This username is already taken']
    if (conflict.email === profileData.email)
      fieldErrors.email = ['This email is already in use']
    if (conflict.phone === profileData.phone)
      fieldErrors.phone = ['This phone number is already in use']
    return { success: false, error: 'Invalid data', fieldErrors }
  }

  const updatedUser = await User.findByIdAndUpdate(
    session.userId,
    {
      username: profileData.username,
      email: profileData.email,
      address: profileData.address,
      phone: profileData.phone,
    },
    { new: true }
  )
  if (!updatedUser) return { success: false, error: 'User not found' }

  const tokenPayload = {
    userId: updatedUser._id.toString(),
    username: updatedUser.username,
    role: updatedUser.role,
  }

  const accessToken = await new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
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
    maxAge: 60 * 15,
    path: '/',
  })
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return {
    success: true,
    user: {
      username: updatedUser.username,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
    },
  }
}
