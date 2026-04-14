import connectDB from '@/lib/db'
import Product from '@/models/Products'
export interface IProduct {
  _id: string
  name: string
  price: number
  description: string
  category: string
  image: string
  stock: number
  rating: number
  manufacturer?: string
}
interface GetProductsArgs {
  page?: number
  category?: string
  maxPrice?: number
  manufacturers?: string[]
  minRating?: number
  onlyInStock?: boolean
  searchTerm?: string
  volume?: string[]
  origin?: string[]
}
export default async function getProducts({
  page = 1,
  category,
  maxPrice,
  manufacturers,
  minRating,
  onlyInStock,
  searchTerm,
  volume,
  origin,
}: GetProductsArgs = {}) {
  const limit = 20
  const skip = (page - 1) * limit

  try {
    await connectDB()

    const query: Record<string, unknown> = {}

    // Φίλτρο Κατηγορίας
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }

    // Φίλτρο Τιμής (Μικρότερη ή ίση)
    if (maxPrice) {
      query.price = { $lte: maxPrice }
    }

    // Φίλτρο Πολλαπλών Κατασκευαστών
    if (manufacturers && manufacturers.length > 0) {
      query.manufacturer = { $in: manufacturers }
    }

    // Φίλτρο Rating (Μεγαλύτερο ή ίσο)
    if (minRating) {
      query.rating = { $gte: minRating }
    }

    // Φίλτρο Stock (Αν είναι true, δείξε μόνο > 0)
    if (onlyInStock) {
      query.stock = { $gt: 0 }
    }

    // Φίλτρο Αναζήτησης (searchTerm)
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i')
      query.$or = [
        { name: searchRegex },
        { manufacturer: searchRegex },
        { category: searchRegex },
      ]
    }
    // Φίλτρο για πολλαπλά μεγέθη
    if (volume && volume.length > 0) {
      query.volume = { $in: volume }
    }
    // Φίλτρο για Προέλευση
    if (origin && origin.length > 0) {
      query.origin = { $in: origin }
    }
    // 2. Εκτέλεση Query
    const [products, total] = await Promise.all([
      Product.find(query).lean().skip(skip).limit(limit),
      Product.countDocuments(query),
    ])

    if (!products || products.length === 0) {
      return { products: [], totalPages: 0 }
    }

    // 3. Serialization (Μετατροπή _id σε string για το Frontend)
    const serializedProducts = products.map((product: IProduct) => ({
      ...product,
      _id: product._id.toString(),
    }))

    return {
      products: serializedProducts,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error('Database error in getProducts:', error)
    return { products: [], totalPages: 0 }
  }
}
