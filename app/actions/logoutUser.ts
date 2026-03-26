'use server'

import { cookies } from 'next/headers'

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('auth token')
  cookieStore.set('auth_token', '', { expires: new Date(0), path: '/' })
}
