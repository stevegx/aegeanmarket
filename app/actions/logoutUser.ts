'use server'

import { cookies } from 'next/headers'

export async function logoutUser() {
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  }
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
  cookieStore.delete('refresh_token')
  cookieStore.set('auth_token', '', {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  })
  cookieStore.set('refresh_token', '', {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  })
}
