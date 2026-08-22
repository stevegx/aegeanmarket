import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import product from '@/models/Products'
import { escapeRegex } from '@/lib/utils'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q || q.length < 2)
    return NextResponse.json({ products: [], categories: [], brands: [] })

  const ip = getClientIp(req.headers)
  if (isRateLimited(`quick-search:${ip}`, 30, 10_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const regex = new RegExp(escapeRegex(q), 'i')

  try {
    await connectDB()
    const [foundProducts, foundCategories, foundManufacturer] =
      await Promise.all([
        product.find({ name: regex }).limit(5).select('name image price'),
        product.distinct('category', { category: regex }),
        product.distinct('manufacturer', { manufacturer: regex }),
      ])
    const uniqueCategories = Array.from(
      new Set(foundCategories.map((c: string) => c.trim().toUpperCase()))
    )

    const uniqueManufacturer = Array.from(
      new Set(foundManufacturer.map((m: string) => m.trim().toUpperCase()))
    )

    return NextResponse.json({
      products: foundProducts,
      categories: uniqueCategories.slice(0, 3),
      manufacturer: uniqueManufacturer.slice(0, 3),
    })
  } catch (error) {
    console.log('Search API error', error)
    return NextResponse.json(
      { error: 'Database failed to connect' },
      { status: 500 }
    )
  }
}
