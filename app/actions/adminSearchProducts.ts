'use server'

import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { escapeRegex } from '@/lib/utils'
import Product from '@/models/Products'

export interface AdminProductOption {
  _id: string
  name: string
  price: number
  stock: number
}

export async function adminSearchProducts(
  query: string
): Promise<AdminProductOption[]> {
  const admin = await requireAdmin()
  if (!admin) return []

  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  await connectDB()
  const regex = new RegExp(escapeRegex(trimmed), 'i')
  const products = await Product.find({ name: regex })
    .select('name price stock')
    .limit(8)
    .lean()

  return JSON.parse(JSON.stringify(products))
}
