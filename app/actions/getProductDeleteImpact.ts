'use server'

import mongoose from 'mongoose'
import { requireAdmin } from './requireAdmin'
import {
  getProductDeleteImpact as getProductDeleteImpactDb,
  type ProductDeleteImpact,
} from '@/lib/db'

type Result =
  | { success: true; impact: ProductDeleteImpact }
  | { success: false; error: string }

export async function getProductDeleteImpact(
  productId: string
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(productId)) {
    return { success: false, error: 'Invalid product id' }
  }

  const impact = await getProductDeleteImpactDb(productId)
  return { success: true, impact }
}
