import Product from '@/models/Products'
import connectDB, { getProductReviews } from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import ProductDetails from './ProductDetails'

export interface PageProduct {
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

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await connectDB()

  const productRaw = (await Product.findById(id).lean()) as PageProduct

  if (!productRaw) {
    return (
      <div className="text-center h-screen pt-20 text-2xl font-bold">
        Error 404: Product not Found!
      </div>
    )
  }

  // Next.js fix: Τα MongoDB objects πρέπει να γίνουν JSON safe
  const product = JSON.parse(JSON.stringify(productRaw))

  const [reviews, session] = await Promise.all([
    getProductReviews(id),
    getSession(),
  ])

  return (
    <ProductDetails
      product={product}
      reviews={reviews}
      currentUserId={session?.userId ?? null}
    />
  )
}
