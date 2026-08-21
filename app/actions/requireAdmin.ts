import { getSession } from './getSession'
import connectDB from '@/lib/db'
import User from '@/models/User'

// Re-checks the role against the DB (not just the JWT payload) so a demoted
// admin's still-valid token can't be used to perform further admin writes.
export async function requireAdmin() {
  const session = await getSession()
  if (!session) return null

  await connectDB()
  const user = await User.findById(session.userId).select('role')
  if (!user || user.role !== 'admin') return null

  return { userId: session.userId, username: session.username }
}
