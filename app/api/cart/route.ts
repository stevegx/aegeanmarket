import { z } from 'zod'
import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import { CartSchema } from '@/lib/validate'
import cart from '@/models/cart'

export async function GET() {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const userCart = await cart
      .findOne({ user: session.userId })
      .populate('items.product')
    return NextResponse.json(userCart || { items: [] })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Full-replace write path: the body carries the ENTIRE desired cart. Items not
// present in the payload are removed, and an empty array clears the cart -- so
// local removals / "empty the cart" now actually reach the DB. This is the only
// endpoint that writes the cart (client store's pushCart + the login
// merge/replace flow both POST... PUT here).
export async function PUT(req: Request) {
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

    const items = parsed.data.map((i) => ({
      product: i.productId,
      quantity: i.quantity,
    }))

    await cart.findOneAndUpdate(
      { user: session.userId },
      { $set: { items } },
      { upsert: true, runValidators: true }
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
