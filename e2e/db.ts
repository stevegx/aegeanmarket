import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'

/**
 * Direct access to the isolated `aegeanmarket_e2e` database for cart-sync
 * specs: seed catalog products, plant / read a user's saved cart, and look up
 * a user id by username. Uses the raw driver (no Mongoose models) so it needs
 * nothing registered -- the Next server process does its own `.populate()`.
 */

let connected = false

async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set (expected from .env.test)')
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri)
  }
  connected = true
  return mongoose.connection.db!
}

export async function closeDb() {
  if (connected && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    connected = false
  }
}

export type SeededProduct = {
  id: string
  name: string
  price: number
  stock: number
  image: string
}

/** Insert `count` minimal, schema-valid products. Returns their ids + fields. */
export async function seedProducts(count: number): Promise<SeededProduct[]> {
  const db = await getDb()
  const now = new Date()
  const tag = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const docs = Array.from({ length: count }, (_, i) => ({
    _id: new ObjectId(),
    name: `E2E ${tag} Product ${i}`,
    description: 'e2e seeded product',
    category: 'wine',
    stock: 99,
    rating: 0,
    price: 10 + i,
    image: 'https://www.ekava.gr/e2e-placeholder.jpg',
    source: 'admin' as const,
    createdAt: now,
    updatedAt: now,
  }))
  await db.collection('products').insertMany(docs)
  return docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    price: d.price,
    stock: d.stock,
    image: d.image,
  }))
}

export async function getUserId(username: string): Promise<string> {
  const db = await getDb()
  const user = await db.collection('users').findOne({ username })
  if (!user) throw new Error(`e2e: user "${username}" not found`)
  return user._id.toString()
}

export type CartLine = { id: string; quantity: number }

/** Upsert the saved cart for a user. */
export async function setDbCart(
  userId: string,
  lines: CartLine[]
): Promise<void> {
  const db = await getDb()
  await db.collection('carts').updateOne(
    { user: new ObjectId(userId) },
    {
      $set: {
        user: new ObjectId(userId),
        items: lines.map((l) => ({
          product: new ObjectId(l.id),
          quantity: l.quantity,
        })),
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  )
}

/** Read a user's saved cart as `{ id, quantity }[]`, sorted by product id. */
export async function getDbCart(userId: string): Promise<CartLine[]> {
  const db = await getDb()
  const doc = await db
    .collection('carts')
    .findOne({ user: new ObjectId(userId) })
  const items = (doc?.items ?? []) as { product: ObjectId; quantity: number }[]
  return items
    .map((i) => ({ id: i.product.toString(), quantity: i.quantity }))
    .sort((a, b) => a.id.localeCompare(b.id))
}
