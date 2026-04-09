import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import product from '@/models/Products'
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q) return NextResponse.json({ products: [], categories: [], brands: [] })
  const regex = new RegExp(q, 'i')

  try {
    await connectDB()
    const [foundProducts, foundCategories, foundManufacturer] =
      await Promise.all([
        product.find({ name: regex }).limit(5).select('name image price'),
        product.find({ category: regex }).limit(3),
        product.find({ manufacturer: regex }).limit(3),
      ])
    return NextResponse.json({
      products: foundProducts,
      categories: foundCategories,
      brands: foundManufacturer,
    })
  } catch (error) {
    console.log('Failed to connect DB in route.ts', error)
  }
}
