'use server'

import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminProductSchema, AdminProductData } from '@/lib/validate'
import Product from '@/models/Products'

type Result = { success: true } | { success: false; error: string }

export async function adminCreateProduct(
  data: AdminProductData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  const parsed = adminProductSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid product data',
    }
  }

  await connectDB()
  await Product.create({
    ...parsed.data,
    source: 'admin',
  })

  revalidatePath('/adminpage')
  revalidatePath('/products')
  revalidatePath('/')
  return { success: true }
}
