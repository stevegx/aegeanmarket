import SearchBar from './searchBar'
import connectDB from '@/lib/db'
import product from '@/models/Products'

export default async function SearchComponent() {
  await connectDB()
  let categories: string[] = []

  try {
    const uniqueCategory = await product.distinct('category').exec()

    if (uniqueCategory) {
      categories = Array.from(
        new Set(
          uniqueCategory
            .filter((cat) => cat)
            .map((cat) => cat.trim().toUpperCase())
        )
      ).sort()
    }
  } catch (error) {
    console.log('Database Error:', error)
  }
  return <SearchBar categories={categories} />
}
