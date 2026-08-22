'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import Product from '@/models/Products'

type Result = { success: true } | { success: false; error: string }

export async function adminDeleteProduct(productId: string): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(productId)) {
    return { success: false, error: 'Invalid product id' }
  }

  await connectDB()
  const deleted = await Product.findByIdAndDelete(productId)
  if (!deleted) return { success: false, error: 'Product not found' }

  if (deleted.image?.includes('.public.blob.vercel-storage.com/')) {
    try {
      await del(deleted.image)
    } catch {
      // Non-fatal: the product record is already gone, an orphaned blob can be
      // cleaned up manually and shouldn't block the delete from succeeding.
    }
  }

  revalidatePath('/adminpage')
  revalidatePath('/products')
  revalidatePath('/')
  return { success: true }
}
