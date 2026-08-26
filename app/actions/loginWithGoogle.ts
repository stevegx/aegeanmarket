'use server'

import { headers } from 'next/headers'
import {
  verifyGoogleIdToken,
  findOrCreateOAuthUser,
  issueAuthCookies,
} from '@/lib/oauth'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

export async function loginWithGoogle(idToken: string) {
  const ip = getClientIp(await headers())
  if (isRateLimited(`oauth:google:ip:${ip}`, 20, 5 * 60 * 1000)) {
    return { success: false, error: 'Too many attempts. Please try again later.' }
  }

  try {
    const profile = await verifyGoogleIdToken(idToken)
    const user = await findOrCreateOAuthUser(profile)

    if (!user.isActive) {
      return {
        success: false,
        error: 'This account has been deactivated. Contact support.',
      }
    }

    await issueAuthCookies(user)
    return { success: true, username: user.username, role: user.role }
  } catch {
    return { success: false, error: 'Google sign-in failed. Please try again.' }
  }
}
