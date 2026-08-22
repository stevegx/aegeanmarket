import type { Metadata } from 'next'
import Link from 'next/link'
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
  origin?: string
  volume?: string
  isFeatured?: boolean
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    await connectDB()
    const product = await Product.findById(id)
      .select('name description image')
      .lean<{ name: string; description: string; image: string }>()

    if (!product) return { title: 'Product not found' }

    const description = product.description.slice(0, 160)
    return {
      title: product.name,
      description,
      openGraph: {
        title: product.name,
        description,
        images: [{ url: product.image }],
      },
    }
  } catch {
    return { title: 'Product not found' }
  }
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
      <div className="flex flex-col items-center justify-center gap-3 min-h-[60vh] text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark">
          404 — Product not found
        </h1>
        <p className="text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/products"
          className="text-aegean-terracotta font-medium hover:underline"
        >
          Browse our products
        </Link>
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
      isAdmin={session?.role === 'admin'}
    />
  )
}
