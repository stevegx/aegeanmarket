import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import cart from '@/models/cart'

// Αυτό θα διορθώσει το Error 405
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

// Αυτό είναι για όταν πατάς "Add to Cart" σε ένα προϊόν
export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await connectDB()
    const data = await req.json()

    const updatedCart = await cart.findOneAndUpdate(
      { user: session.userId, 'items.product': data.productId },
      { $inc: { 'items.$.quantity': data.quantity } },
      { new: true }
    )
    if (!updatedCart) {
      await cart.findOneAndUpdate(
        { user: session.userId },
        {
          $push: {
            items: { product: data.productId, quantity: data.quantity },
          },
        },
        { upsert: true }
      )
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}
