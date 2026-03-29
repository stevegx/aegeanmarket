import connectDB from '@/lib/db'
import Product from '@/models/products'

export default async function getProduct() {
  try {
    await connectDB()
    const products = await Product.find({}).lean()
    if (!products || products.length === 0) {
      console.log('There are no products!!')
      return []
    }
    const serializedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }))
    return serializedProducts
  } catch (error) {
    console.error("Couldn't connect to DB", error)
    return []
  }
}
