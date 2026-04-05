import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

export async function verifyToken(token: string, isRefresh = false) {
  try {
    const { payload } = await jwtVerify(
      token,
      isRefresh ? REFRESH_SECRET : JWT_SECRET
    )
    return payload
  } catch (error) {
    return null
  }
}

export async function signAccessToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)
}
