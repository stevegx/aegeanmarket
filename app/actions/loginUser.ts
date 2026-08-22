'use server'
import { LoginFormData, LoginSchema } from '@/lib/validate'
import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'
import { SignJWT } from 'jose'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)
type LoginUserData = Omit<LoginFormData, 'confirmPassword'>

export async function loginUser(data: LoginUserData) {
  const parsed = LoginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Invalid login credentials' }
  }

  const ip = getClientIp(await headers())
  const credentialsKey = parsed.data.loginCredentials.trim().toLowerCase()
  const tooManyAttempts =
    isRateLimited(`login:ip:${ip}`, 20, 5 * 60 * 1000) ||
    isRateLimited(`login:cred:${credentialsKey}`, 5, 15 * 60 * 1000)

  if (tooManyAttempts) {
    return {
      success: false,
      error: 'Too many login attempts. Please try again later.',
    }
  }

  await connectDB()
  const findUser = await User.findOne({
    $or: [
      { email: parsed.data.loginCredentials },
      { username: parsed.data.loginCredentials },
    ],
  }).select('+password')

  if (!findUser) return { success: false, error: 'Invalid login credentials' }

  const checkPassword = await bcrypt.compare(
    parsed.data.password,
    findUser.password
  )
  if (!checkPassword)
    return { success: false, error: 'Invalid login credentials' }

  if (!findUser.isActive) {
    return {
      success: false,
      error: 'This account has been deactivated. Contact support.',
    }
  }

  const accessToken = await new SignJWT({
    userId: findUser._id.toString(),
    username: findUser.username,
    role: findUser.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId: findUser._id.toString(),
    username: findUser.username,
    role: findUser.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)

  const cookieStore = await cookies()
  cookieStore.set('auth_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 5, // 5 min
    path: '/',
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { success: true, username: findUser.username, role: findUser.role }
}
