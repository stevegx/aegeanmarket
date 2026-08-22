'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminProductSchema, AdminProductData } from '@/lib/validate'
import Product from '@/models/Products'

type Result = { success: true } | { success: false; error: string }

export async function adminUpdateProduct(
  productId: string,
  data: AdminProductData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(productId)) {
    return { success: false, error: 'Invalid product id' }
  }

  const parsed = adminProductSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid product data',
    }
  }

  await connectDB()
  const updated = await Product.findByIdAndUpdate(productId, parsed.data)
  if (!updated) return { success: false, error: 'Product not found' }

  revalidatePath('/adminpage')
  revalidatePath('/products')
  revalidatePath(`/products/${productId}`)
  revalidatePath('/')
  return { success: true }
}
