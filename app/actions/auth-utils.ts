import { jwtVerify, SignJWT, type JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET)

export async function verifyToken(token: string, isRefresh = false) {
  try {
    const { payload } = await jwtVerify(
      token,
      isRefresh ? REFRESH_SECRET : JWT_SECRET
    )
    return payload
  } catch {
    return null
  }
}

export async function signAccessToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)
}
