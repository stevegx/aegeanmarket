'use server'
import { LoginFormData } from '@/lib/validate'
import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)
type LoginUserData = Omit<LoginFormData, 'confirmPassword'>

export async function loginUser(data: LoginUserData) {
  await connectDB()
  const findUser = await User.findOne({
    $or: [
      { email: data.loginCredentials },
      { username: data.loginCredentials },
    ],
  }).select('+password')

  if (!findUser) return { success: false, error: 'Invalid login credentials' }

  const checkPassword = await bcrypt.compare(data.password, findUser.password)
  if (!checkPassword)
    return { success: false, error: 'Invalid login credentials' }

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
