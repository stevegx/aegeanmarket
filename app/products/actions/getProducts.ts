import connectDB from '@/lib/db'
import Product from '@/models/products'
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
export default async function getProducts(page: number = 1) {
  const limit = 20
  const skip = (page - 1) * limit

  try {
    await connectDB()

    const [products, total] = await Promise.all([
      Product.find({}).lean().skip(skip).limit(limit),
      Product.countDocuments({}),
    ])

    if (!products || products.length === 0) {
      return { products: [], totalPages: 0 }
    }

    const serializedProducts = products.map((product: IProduct) => ({
      ...product,
      _id: product._id.toString(),
    }))

    return {
      products: serializedProducts,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Couldn't connect to DB", error)
    return { products: [], totalPages: 0 }
  }
}
