import connectDB from '@/lib/db'
import product from '@/models/Products'
import CategoryButtons from './categoryButtons'

export interface CategoryStat {
  name: string
  count: number
}

export default async function FilterCategories() {
  let categories: CategoryStat[] = []
  let total = 0

  try {
    await connectDB()
    const rows = await product.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: { $toUpper: { $trim: { input: '$category' } } },
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: '' } } },
      { $sort: { _id: 1 } },
    ])

    categories = rows.map((r) => ({ name: r._id, count: r.count }))
    total = rows.reduce((sum, r) => sum + r.count, 0)
  } catch (error) {
    console.log("Couldn't connect to DB in FilterCategories", error)
  }

  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Shop by category
      </h3>
      <CategoryButtons categories={categories} total={total} />
    </div>
  )
}
