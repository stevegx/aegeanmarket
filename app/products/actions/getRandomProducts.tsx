'use server'
import connectDB from '@/lib/db'
import Product from '@/models/Products'

export interface IRandomProduct {
  _id: string
  name: string
  image: string
}

export default async function getRandomProducts(limit: number = 10) {
  try {
    await connectDB()
    const products = await Product.aggregate([
      { $sample: { size: limit } },
      { $project: { name: 1, image: 1 } },
    ])
    return products.map(
      (product): IRandomProduct => ({
        _id: product._id.toString(),
        name: product.name,
        image: product.image,
      })
    )
  } catch (error) {
    console.log('Error fetching random products:', error)
    return []
  }
}
