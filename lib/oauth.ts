import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose'
import connectDB from '@/lib/db'
import User from '@/models/User'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

type SessionUser = {
  _id: { toString(): string }
  username: string
  role: string
}

export async function issueAuthCookies(user: SessionUser) {
  const accessToken = await new SignJWT({
    userId: user._id.toString(),
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId: user._id.toString(),
    username: user.username,
    role: user.role,
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
}

export async function verifyGoogleIdToken(idToken: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')

  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  })

  if (!payload.email || payload.email_verified !== true) {
    throw new Error('Google account has no verified email')
  }

  return {
    id: payload.sub as string,
    email: payload.email as string,
    name: (payload.name as string) || (payload.email as string).split('@')[0],
  }
}

type OAuthProfile = { id: string; email: string; name: string }

async function generateUniqueUsername(base: string) {
  const cleanBase =
    base.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) ||
    'user'
  let candidate = cleanBase
  let suffix = 0
  while (await User.exists({ username: candidate })) {
    suffix += 1
    candidate = `${cleanBase}${suffix}`
  }
  return candidate
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  await connectDB()

  let user = await User.findOne({ googleId: profile.id })
  if (user) return user

  // Same email already registered with a password -- link this Google
  // account to it instead of creating a duplicate.
  user = await User.findOne({ email: profile.email.toLowerCase() })
  if (user) {
    user.googleId = profile.id
    await user.save()
    return user
  }

  const username = await generateUniqueUsername(profile.name || profile.email)
  user = new User({
    username,
    email: profile.email.toLowerCase(),
    googleId: profile.id,
  })
  await user.save()
  return user
}
