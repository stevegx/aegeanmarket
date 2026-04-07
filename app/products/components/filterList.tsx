import connectDB from '@/lib/db'
import Product from '@/models/Products' // Διόρθωση import
import FilterForm from './filterForm' // Το client component που φτιάξαμε

interface FilterStats {
  minPrice: number
  maxPrice: number
  totalStock: number
  maxRating: number
  manufacturers: string[]
}

export default async function FilterList() {
  // Default τιμές
  let stats: FilterStats = {
    minPrice: 0,
    maxPrice: 0,
    totalStock: 0,
    maxRating: 5,
    manufacturers: [],
  }

  try {
    await connectDB()

    // Τρέχουμε 2 queries: ένα για τα brands και ένα aggregation για τα νούμερα
    const [uniqueManufacturers, aggregationResult] = await Promise.all([
      Product.distinct('manufacturer'),
      Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            totalStock: { $sum: '$stock' },
            maxRating: { $max: '$rating' },
          },
        },
      ]),
    ])

    if (aggregationResult.length > 0) {
      stats = {
        minPrice: aggregationResult[0].minPrice || 0,
        maxPrice: aggregationResult[0].maxPrice || 10000,
        totalStock: aggregationResult[0].totalStock || 0,
        maxRating: aggregationResult[0].maxRating || 5,
        manufacturers: (uniqueManufacturers as string[]).filter(Boolean).sort(),
      }
    }
  } catch (error) {
    console.error("Couldn't connect to DB in Filterlist", error)
  }

  return (
    <div className="p-4">
      <FilterForm
        minPrice={stats.minPrice}
        maxPrice={stats.maxPrice}
        manufacturers={stats.manufacturers}
        totalStock={stats.totalStock}
        maxRating={stats.maxRating}
      />
    </div>
  )
}
