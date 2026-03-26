'use server'

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function getSession() {
  const cookieStore = await cookies()
  const taken = cookieStore.get('auth_token')?.value

  if (!taken) return null

  try {
    const { payload } = await jwtVerify(taken, JWT_SECRET)

    return {
      username: payload.username as string,
      userId: payload.userId as string,
    }
  } catch (err) {
    return null
  }
}
