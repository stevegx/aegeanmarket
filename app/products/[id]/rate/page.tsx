import { redirect } from 'next/navigation'
import Product from '@/models/Products'
import Review from '@/models/Review'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import RateProductForm from './RateProductForm'

export default async function RateProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect(`/login?redirect=/products/${id}/rate`)
  }

  await connectDB()

  const product = (await Product.findById(id).select('name image').lean()) as {
    _id: string
    name: string
    image: string
  } | null

  if (!product) {
    return (
      <div className="text-center h-screen pt-20 text-2xl font-bold">
        Error 404: Product not Found!
      </div>
    )
  }

  const existingReview = await Review.findOne({
    product: id,
    user: session.userId,
    parent: null,
  })
    .select('rating text')
    .lean<{ rating: number | null; text: string } | null>()

  return (
    <RateProductForm
      productId={id}
      productName={product.name}
      initialRating={existingReview?.rating ?? 0}
      initialText={existingReview?.text ?? ''}
    />
  )
}
