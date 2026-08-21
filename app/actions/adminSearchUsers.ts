'use server'

import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { escapeRegex } from '@/lib/utils'
import User from '@/models/User'

export interface AdminUserOption {
  _id: string
  username: string
  email: string
}

export async function adminSearchUsers(
  query: string
): Promise<AdminUserOption[]> {
  const admin = await requireAdmin()
  if (!admin) return []

  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  await connectDB()
  const regex = new RegExp(escapeRegex(trimmed), 'i')
  const users = await User.find({
    $or: [{ username: regex }, { email: regex }],
  })
    .select('username email')
    .limit(8)
    .lean()

  return JSON.parse(JSON.stringify(users))
}
