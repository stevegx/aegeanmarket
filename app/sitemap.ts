import type { MetadataRoute } from 'next'
import connectDB from '@/lib/db'
import Product from '@/models/Products'
import BlogPost from '@/models/BlogPost'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const STATIC_ROUTES = [
  '',
  '/products',
  '/blog',
  '/aboutus',
  '/communication',
  '/payment-methods',
  '/shipments',
  '/returns-cancelations',
  '/login',
  '/register',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()

  const [products, posts] = await Promise.all([
    Product.find().select('_id updatedAt').lean<
      { _id: string; updatedAt?: Date }[]
    >(),
    BlogPost.find().select('_id updatedAt').lean<
      { _id: string; updatedAt?: Date }[]
    >(),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }))

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product._id}`,
    lastModified: product.updatedAt ?? new Date(),
  }))

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post._id}`,
    lastModified: post.updatedAt ?? new Date(),
  }))

  return [...staticEntries, ...productEntries, ...blogEntries]
}
