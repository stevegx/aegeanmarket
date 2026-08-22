import connectDB from '@/lib/db'
import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/getSession'
import { CartSchema } from '@/lib/validate'
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
    const body = await req.json()
    const parsed = CartSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const { productId, quantity } = parsed.data

    const updatedCart = await cart.findOneAndUpdate(
      { user: session.userId, 'items.product': productId },
      { $inc: { 'items.$.quantity': quantity } },
      { new: true, runValidators: true }
    )
    if (!updatedCart) {
      await cart.findOneAndUpdate(
        { user: session.userId },
        {
          $push: {
            items: { product: productId, quantity: quantity },
          },
        },
        { upsert: true, runValidators: true }
      )
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}
