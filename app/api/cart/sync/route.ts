import { z } from 'zod'
import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import { CartSchema } from '@/lib/validate'
import cart from '@/models/cart'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const body = await req.json()
    const parsed = z.array(CartSchema).safeParse(body.items)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const items = parsed.data

    for (const item of items) {
      const updated = await cart.findOneAndUpdate(
        { user: session.userId, 'items.product': item.productId },
        { $set: { 'items.$.quantity': item.quantity } }, // Χρησιμοποιούμε $set για να ταυτιστεί με το Zustand
        { runValidators: true }
      )
      if (!updated) {
        await cart.findOneAndUpdate(
          { user: session.userId },
          {
            $push: {
              items: { product: item.productId, quantity: item.quantity },
            },
          },
          { upsert: true, runValidators: true }
        )
      }
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
