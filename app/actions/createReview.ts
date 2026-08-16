'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB, { recalcProductRating } from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { reviewSchema, ReviewFormData } from '@/lib/validate'
import Review from '@/models/Review'
import Product from '@/models/Products'

type CreateReviewResult =
  | {
      success: true
      review: {
        _id: string
        rating: number
        text: string
        createdAt: string
        updatedAt: string
      }
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createReview(
  productId: string,
  data: ReviewFormData
): Promise<CreateReviewResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  if (!mongoose.isValidObjectId(productId)) {
    return { success: false, error: 'Invalid product' }
  }

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid data',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  await connectDB()

  const product = await Product.findById(productId).select('_id')
  if (!product) return { success: false, error: 'Product not found' }

  const review = await Review.findOneAndUpdate(
    { product: productId, user: session.userId, parent: null },
    { $set: { rating: parsed.data.rating, text: parsed.data.text } },
    { new: true, upsert: true }
  )

  await recalcProductRating(productId)
  revalidatePath(`/products/${productId}`)

  return { success: true, review: JSON.parse(JSON.stringify(review)) }
}
