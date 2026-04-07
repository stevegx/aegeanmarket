import connectDB from '@/lib/db'
import product from '@/models/Products'

interface Filters {
  minPrice: number
  maxPrice: number
  totalStock: number
}
export default async function FilterList() {
  let manufacturers: string[] = []
  let stats: Filters = {
    minPrice: 0,
    maxPrice: 0,
    totalStock: 0,
  }

  try {
    await connectDB()
    const [uniqueManufacturer, aggregationResult] = await Promise.all([
      product.distinct('category'),
      product.distinct('manufacturer'),
      product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            totalStock: { $sum: '$stock' },
          },
        },
      ]),
    ])

    manufacturers = uniqueManufacturer as string[]

    if (aggregationResult.length > 0) {
      stats = {
        minPrice: aggregationResult[0].minPrice || 0,
        maxPrice: aggregationResult[0].maxPrice || 10000,
        totalStock: aggregationResult[0].totalStock || 0,
      }
    }
  } catch (error) {
    console.log("Couldn't connect to DB in Filterlist", error)
  }

  return (
    <div>
      <h3 className="font-bold mb-4">Price Range</h3>
      <div className="space-y-2">
        <input
          type="range"
          id="priceRange"
          name="PriceRange"
          min="0"
          max="100"
          value="0"
          step="any"
        />
      </div>
    </div>
  )
}
