import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import cart from '@/models/cart'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { items } = await req.json() // Παίρνει το array [{productId, quantity}, ...]

    for (const item of items) {
      const updated = await cart.findOneAndUpdate(
        { user: session.userId, 'items.product': item.productId },
        { $set: { 'items.$.quantity': item.quantity } } // Χρησιμοποιούμε $set για να ταυτιστεί με το Zustand
      )
      if (!updated) {
        await cart.findOneAndUpdate(
          { user: session.userId },
          {
            $push: {
              items: { product: item.productId, quantity: item.quantity },
            },
          },
          { upsert: true }
        )
      }
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
