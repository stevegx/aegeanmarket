'use server'
import connectDB from '@/lib/db'
import Product from '@/models/Products'

export interface IRandomProduct {
  _id: string
  name: string
  image: string
  category: string
}

// Deterministic 32-bit string hash (djb2 variant), used to turn today's date
// into a PRNG seed so every request on the same day gets the same shuffle.
function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0
}

// mulberry32: small, fast, deterministic PRNG from an integer seed.
function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed)
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default async function getRandomProducts(limit: number = 10) {
  try {
    await connectDB()

    // UTC calendar day: same 10 products for everyone all day, new set the
    // next day. Deterministic from the date, so it doesn't depend on any
    // cache surviving between requests/serverless instances.
    const today = new Date().toISOString().slice(0, 10)
    const seed = hashSeed(today)

    const allIds: { _id: string }[] = await Product.find({})
      .select('_id')
      .lean()
    if (allIds.length === 0) return []

    const selectedIds = seededShuffle(allIds, seed)
      .slice(0, limit)
      .map((doc) => doc._id.toString())

    const products = await Product.find({ _id: { $in: selectedIds } })
      .select('name image category')
      .lean()

    const orderIndex = new Map(selectedIds.map((id, index) => [id, index]))

    return products
      .map(
        (product): IRandomProduct => ({
          _id: product._id.toString(),
          name: product.name,
          image: product.image,
          category: product.category,
        })
      )
      .sort(
        (a, b) => (orderIndex.get(a._id) ?? 0) - (orderIndex.get(b._id) ?? 0)
      )
  } catch (error) {
    console.log('Error fetching random products:', error)
    return []
  }
}
