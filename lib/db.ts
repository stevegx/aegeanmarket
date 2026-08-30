import mongoose from 'mongoose'
import User from '@/models/User'
import Order from '@/models/Orders'
import Product from '@/models/Products'
import Review from '@/models/Review'
import Notification from '@/models/Notification'
import BlogPost from '@/models/BlogPost'
import Cart from '@/models/cart'
import '@/models/Products'
import { escapeRegex } from '@/lib/utils'
declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null
        promise: Promise<mongoose.Connection> | null
      }
    | undefined
}

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn
  }
  if (!cached!.conn) {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('Please define MONGODB_URI in .env.local')
    }
    const opts = {
      bufferCommands: true,
    }
    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m.connection
    })
  }
  try {
    cached!.conn = await cached!.promise
  } catch (error) {
    cached!.promise = null
    throw error
  }
  return cached!.conn
}
export async function getUserFromDb(id: string) {
  try {
    await connectDB()
    const user = await User.findById(id)
      .select('-password')
      .select('-createdAt')
      .select('-updatedAt')
      .select('-isActive')
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getUserOrders(userId: string) {
  try {
    await connectDB()
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getUserFavorites(userId: string) {
  try {
    await connectDB()
    const user = await User.findById(userId).select('favorites').populate({
      path: 'favorites',
      select: 'name description price image category stock rating',
    })
    return JSON.parse(JSON.stringify(user?.favorites || []))
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}

export async function recalcProductRating(productId: string) {
  await connectDB()
  const result = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        parent: null,
      },
    },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' } } },
  ])
  const avgRating = result[0]?.avgRating ?? 0
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avgRating * 10) / 10,
  })
}

export async function getProductReviews(productId: string) {
  try {
    await connectDB()
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: 1 })
      .limit(500)
      .populate({ path: 'user', select: 'username' })
      .populate({ path: 'mentionedUser', select: 'username' })
      .lean()
    return JSON.parse(JSON.stringify(reviews))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getUserReviews(userId: string) {
  try {
    await connectDB()
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: 'product', select: 'name image' })
      .populate({ path: 'mentionedUser', select: 'username' })
      .lean()
    return JSON.parse(JSON.stringify(reviews))
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
}

export async function getUserNotifications(userId: string) {
  try {
    await connectDB()
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate({ path: 'fromUser', select: 'username' })
        .populate({ path: 'product', select: 'name' })
        .lean(),
      Notification.countDocuments({ recipient: userId, read: false }),
    ])
    return {
      notifications: JSON.parse(JSON.stringify(notifications)),
      unreadCount,
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [], unreadCount: 0 }
  }
}

const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

export interface AdminStats {
  totalUsers: number
  newUsersToday: number
  ordersByStatus: Record<(typeof ORDER_STATUSES)[number], number>
  trends: { date: string; orders: number; newUsers: number; revenue: number }[]
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB()

  const now = new Date()
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  const startOfWindow = new Date(startOfToday)
  startOfWindow.setUTCDate(startOfWindow.getUTCDate() - 29) // 30-day window incl. today

  const [
    totalUsers,
    newUsersToday,
    orderStatusCounts,
    orderDayCounts,
    userDayCounts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfWindow } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          // Cancelled orders never generated real revenue, so they're excluded.
          revenue: {
            $sum: {
              $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalPrice', 0],
            },
          },
        },
      },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startOfWindow } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 },
        },
      },
    ]),
  ])

  const ordersByStatus = ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0
      return acc
    },
    {} as AdminStats['ordersByStatus']
  )
  for (const row of orderStatusCounts) {
    if (row._id in ordersByStatus) {
      ordersByStatus[row._id as (typeof ORDER_STATUSES)[number]] = row.count
    }
  }

  const orderDayMap = new Map(
    orderDayCounts.map((row) => [row._id as string, row])
  )
  const userDayMap = new Map(
    userDayCounts.map((row) => [row._id as string, row.newUsers as number])
  )

  const trends: AdminStats['trends'] = []
  for (let i = 0; i < 30; i++) {
    const day = new Date(startOfWindow)
    day.setUTCDate(day.getUTCDate() + i)
    const key = day.toISOString().slice(0, 10)
    const orderRow = orderDayMap.get(key)
    trends.push({
      date: key,
      orders: orderRow?.orders ?? 0,
      revenue: orderRow?.revenue ?? 0,
      newUsers: userDayMap.get(key) ?? 0,
    })
  }

  return { totalUsers, newUsersToday, ordersByStatus, trends }
}

export const ADMIN_PAGE_SIZE = 15

export interface AdminOrderListItem {
  _id: string
  items: {
    product: string
    name: string
    priceAtpurchase: number
    quantity: number
  }[]
  totalPrice: number
  status: (typeof ORDER_STATUSES)[number]
  paymentMethod: string
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
  shippingAddress: {
    street: string
    number: string
    city: string
    zipcode: string
    country: string
  }
  guestName?: string
  guestEmail?: string
  createdAt: string
  userDoc?: { _id: string; username: string; email: string }
}

export async function getAllOrdersAdmin({
  page = 1,
  status,
  search,
}: {
  page?: number
  status?: string
  search?: string
}) {
  await connectDB()
  const limit = ADMIN_PAGE_SIZE
  const currentPage = Math.max(1, page)
  const skip = (currentPage - 1) * limit

  const match: Record<string, unknown> = {}
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    match.status = status
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDoc',
      },
    },
    { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
  ]

  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const regex = new RegExp(escapeRegex(trimmedSearch), 'i')
    pipeline.push({
      $match: {
        $or: [
          { guestName: regex },
          { guestEmail: regex },
          { 'userDoc.username': regex },
          { 'userDoc.email': regex },
        ],
      },
    })
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              items: 1,
              totalPrice: 1,
              status: 1,
              paymentMethod: 1,
              paymentStatus: 1,
              shippingAddress: 1,
              guestName: 1,
              guestEmail: 1,
              createdAt: 1,
              'userDoc._id': 1,
              'userDoc.username': 1,
              'userDoc.email': 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    }
  )

  const [result] = await Order.aggregate(pipeline)
  const totalCount: number = result?.totalCount?.[0]?.count ?? 0

  return {
    orders: JSON.parse(JSON.stringify(result?.data ?? [])) as AdminOrderListItem[],
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  }
}

export interface AdminUserListItem {
  _id: string
  username: string
  email: string
  address: string
  phone: string
  role: 'customer' | 'admin'
  isActive: boolean
  createdAt: string
}

export async function getAllUsersAdmin({
  page = 1,
  search,
  role,
}: {
  page?: number
  search?: string
  role?: string
}) {
  await connectDB()
  const limit = ADMIN_PAGE_SIZE
  const currentPage = Math.max(1, page)
  const skip = (currentPage - 1) * limit

  const match: Record<string, unknown> = {}
  if (role === 'customer' || role === 'admin') {
    match.role = role
  }
  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const regex = new RegExp(escapeRegex(trimmedSearch), 'i')
    match.$or = [{ username: regex }, { email: regex }]
  }

  const [users, totalCount] = await Promise.all([
    User.find(match)
      .select('username email address phone role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(match),
  ])

  return {
    users: JSON.parse(JSON.stringify(users)) as AdminUserListItem[],
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  }
}

export interface BlogPostDoc {
  _id: string
  title: string
  content: string
  image: string
  author: string
  createdAt: string
}

export async function getAllBlogPosts() {
  await connectDB()
  const posts = await BlogPost.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(posts)) as BlogPostDoc[]
}

export async function getLatestBlogPosts(limit: number) {
  await connectDB()
  const posts = await BlogPost.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
  return JSON.parse(JSON.stringify(posts)) as BlogPostDoc[]
}

export async function getBlogPostById(id: string) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  const post = await BlogPost.findById(id).lean()
  return post ? (JSON.parse(JSON.stringify(post)) as BlogPostDoc) : null
}

export async function getAllBlogPostsAdmin({
  page = 1,
  search,
}: {
  page?: number
  search?: string
}) {
  await connectDB()
  const limit = ADMIN_PAGE_SIZE
  const currentPage = Math.max(1, page)
  const skip = (currentPage - 1) * limit

  const match: Record<string, unknown> = {}
  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const regex = new RegExp(escapeRegex(trimmedSearch), 'i')
    match.$or = [{ title: regex }, { author: regex }]
  }

  const [posts, totalCount] = await Promise.all([
    BlogPost.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BlogPost.countDocuments(match),
  ])

  return {
    posts: JSON.parse(JSON.stringify(posts)) as BlogPostDoc[],
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  }
}

export interface AdminProductListItem {
  _id: string
  name: string
  description: string
  category: string
  stock: number
  rating: number
  price: number
  image: string
  manufacturer?: string
  origin?: string
  volume?: string
  isFeatured?: boolean
  source: 'feed' | 'admin'
  createdAt: string
}

export async function getAllProductsAdmin({
  page = 1,
  search,
}: {
  page?: number
  search?: string
}) {
  await connectDB()
  const limit = ADMIN_PAGE_SIZE
  const currentPage = Math.max(1, page)
  const skip = (currentPage - 1) * limit

  const match: Record<string, unknown> = {}
  const trimmedSearch = search?.trim()
  if (trimmedSearch) {
    const regex = new RegExp(escapeRegex(trimmedSearch), 'i')
    match.$or = [{ name: regex }, { category: regex }, { manufacturer: regex }]
  }

  const [products, totalCount] = await Promise.all([
    Product.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(match),
  ])

  return {
    products: JSON.parse(JSON.stringify(products)) as AdminProductListItem[],
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  }
}

export interface ProductDeleteImpact {
  orders: number
  carts: number
  favorites: number
  reviews: number
}

export async function getProductDeleteImpact(
  productId: string
): Promise<ProductDeleteImpact> {
  await connectDB()
  const id = new mongoose.Types.ObjectId(productId)

  const [orders, carts, favorites, reviews] = await Promise.all([
    Order.countDocuments({ 'items.product': id }),
    Cart.countDocuments({ 'items.product': id }),
    User.countDocuments({ favorites: id }),
    Review.countDocuments({ product: id }),
  ])

  return { orders, carts, favorites, reviews }
}

export interface RelatedProduct {
  _id: string
  name: string
  image: string
  price: number
  category: string
  stock: number
}

// Related-products rail on the product detail page: same category first,
// topped up with same-manufacturer picks, then random products, so it's
// never empty even for a lightly-populated category.
export async function getRelatedProducts({
  productId,
  category,
  manufacturer,
  limit = 10,
}: {
  productId: string
  category: string
  manufacturer?: string
  limit?: number
}): Promise<RelatedProduct[]> {
  await connectDB()
  const projection = 'name image price category stock'
  const excludeIds = [new mongoose.Types.ObjectId(productId)]

  const sameCategory = await Product.find({
    _id: { $nin: excludeIds },
    category,
  })
    .select(projection)
    .limit(limit)
    .lean()
  const results = [...sameCategory]
  excludeIds.push(...results.map((p) => p._id))

  if (results.length < limit && manufacturer) {
    const sameManufacturer = await Product.find({
      _id: { $nin: excludeIds },
      manufacturer,
    })
      .select(projection)
      .limit(limit - results.length)
      .lean()
    results.push(...sameManufacturer)
    excludeIds.push(...sameManufacturer.map((p) => p._id))
  }

  if (results.length < limit) {
    const random = await Product.aggregate([
      { $match: { _id: { $nin: excludeIds } } },
      { $sample: { size: limit - results.length } },
      { $project: { name: 1, image: 1, price: 1, category: 1, stock: 1 } },
    ])
    results.push(...random)
  }

  return JSON.parse(JSON.stringify(results))
}

export async function computeCartTotal(
  cartItems: { _id: string; quantity: number }[]
): Promise<number> {
  await connectDB()
  let total = 0
  for (const item of cartItems) {
    if (!mongoose.isValidObjectId(item._id)) {
      throw new Error('Invalid product in cart')
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error('Invalid cart item')
    }
    const product = await Product.findById(item._id).select('price').lean()
    if (!product) {
      throw new Error('One of the products in your cart no longer exists')
    }
    total += product.price * item.quantity
  }
  return total
}

export default connectDB
