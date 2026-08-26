'use server'
import { LoginFormData, LoginSchema } from '@/lib/validate'
import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { issueAuthCookies } from '@/lib/oauth'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

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

  if (!findUser.password) {
    return {
      success: false,
      error: 'This account signs in with Google. Use that instead.',
    }
  }

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

  await issueAuthCookies(findUser)

  return { success: true, username: findUser.username, role: findUser.role }
}
