import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import connectDB from '@/lib/db'
import Order from '@/models/Orders'
import Product from '@/models/Products'
import Cart from '@/models/cart'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // The client confirms with redirect: 'if_required', so it usually never
  // returns for async payment methods — fulfillment has to be webhook-driven.
  // payment_intent.succeeded covers both instant and delayed-notification
  // methods (the latter transition processing -> succeeded later).
  if (event.type === 'payment_intent.succeeded') {
    await fulfillCardOrder(event.data.object as Stripe.PaymentIntent)
  }

  return NextResponse.json({ received: true })
}

async function fulfillCardOrder(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId || !mongoose.isValidObjectId(orderId)) return

  await connectDB()
  const dbSession = await mongoose.startSession()

  try {
    await dbSession.withTransaction(async () => {
      const order = await Order.findById(orderId).session(dbSession)

      // Idempotent: Stripe can redeliver the same event.
      if (!order || order.paymentStatus === 'paid') return

      if (paymentIntent.amount !== Math.round(order.totalPrice * 100)) {
        throw new Error(`Payment amount mismatch for order ${order._id}`)
      }

      for (const item of order.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session: dbSession }
        )
        // The card has already been charged at this point. A production
        // integration would issue a refund here; left as a known gap for
        // this demo since Stripe test-mode charges aren't real funds.
        if (!updated) {
          throw new Error(
            `Insufficient stock for product ${item.product} on order ${order._id}`
          )
        }
      }

      order.paymentStatus = 'paid'
      await order.save({ session: dbSession })

      if (order.user) {
        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [] } },
          { session: dbSession }
        )
      }
    })
  } finally {
    await dbSession.endSession()
  }
}
