'use server'
import connectDB from '@/lib/db'
import Product from '@/models/Products'

export interface CarouselProduct {
  _id: string
  name: string
  image: string
  price: number
  category: string
  stock: number
}

export default async function getFeaturedProducts(limit: number = 10) {
  try {
    await connectDB()

    const products = await Product.find({ isFeatured: true })
      .select('name image price category stock')
      .limit(limit)
      .lean()
    return products.map(
      (product): CarouselProduct => ({
        _id: product._id.toString(),
        name: product.name,
        image: product.image,
        price: product.price,
        category: product.category,
        stock: product.stock,
      })
    )
  } catch (error) {
    console.log('Error fetching latest products:', error)
    return []
  }
}
