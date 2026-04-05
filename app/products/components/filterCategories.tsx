import connectDB from '@/lib/db'
import product from '@/models/products'

export default async function FilterCategories() {
  let categories: string[] = []
  try {
    await connectDB()
    const [uniqueCategory] = await Promise.all([product.distinct('category')])
    categories = uniqueCategory as string[]
  } catch (error) {
    console.log("Couldn't connect to DB in Filterlist", error)
  }

  return (
    <div>
      <h3 className="font-bold mb-4 text-gray-800">Categories</h3>
      <div className="flex items-center gap-3 overflow-x-scroll w-full pb-2 outline-none">
        {categories.map((cat) => (
          <div
            key={cat}
            className="shrink-0 flex items-center cursor-pointer bg-aegean-green text-white font-semibold text-sm px-4 py-2 rounded-full hover:bg-aegean-green/80 transition-all active:scale-95 shadow-sm capitalize"
          >
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
