'use server'

import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import User from '@/models/User'

type ToggleFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string }

export async function toggleFavorite(
  productId: string
): Promise<ToggleFavoriteResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  if (!mongoose.isValidObjectId(productId)) {
    return { success: false, error: 'Invalid product' }
  }

  await connectDB()

  const user = await User.findById(session.userId).select('favorites')
  if (!user) return { success: false, error: 'User not found' }

  const isFavorite = user.favorites.some(
    (id: mongoose.Types.ObjectId) => id.toString() === productId
  )

  await User.findByIdAndUpdate(session.userId, {
    [isFavorite ? '$pull' : '$addToSet']: { favorites: productId },
  })

  return { success: true, isFavorite: !isFavorite }
}
