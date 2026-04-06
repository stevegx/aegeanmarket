import connectDB from '@/lib/db'
import product from '@/models/products'
import CategoryButtons from './categoryButtons'
export default async function FilterCategories() {
  let categories: string[] = []
  try {
    await connectDB()
    const [uniqueCategory] = await Promise.all([product.distinct('category')])
    categories = Array.from(
      new Set(
        uniqueCategory
          .filter((cat) => cat)
          .map((cat) => cat.trim().toUpperCase())
      )
    ).sort()
  } catch (error) {
    console.log("Couldn't connect to DB in Filterlist", error)
  }

  return (
    <div>
      <h3 className="font-bold mb-4 text-gray-800">Categories</h3>
      <CategoryButtons categories={categories} />
    </div>
  )
}
