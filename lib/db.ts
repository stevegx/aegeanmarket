import mongoose from 'mongoose'

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
      bufferCommands: false,
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

export default connectDB
