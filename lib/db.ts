import mongoose from 'mongoose'
import User from '@/models/User'
import Order from '@/models/Orders'
import Product from '@/models/Products'
import Review from '@/models/Review'
import Notification from '@/models/Notification'
import '@/models/Products'
declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null
        promise: Promise<mongoose.Connection> | null
      }
    | undefined
}

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
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
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })
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

export default connectDB
