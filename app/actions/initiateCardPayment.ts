'use server'

import mongoose from 'mongoose'
import connectDB, { getUserFromDb } from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { checkoutSchema, CheckoutFormData } from '@/lib/validate'
import { stripe } from '@/lib/stripe'
import Product from '@/models/Products'
import Order from '@/models/Orders'

type CartItemInput = {
  _id: string
  quantity: number
}

type InitiateCardPaymentResult =
  | {
      success: true
      orderId: string
      clientSecret: string
      amount: number
    }
  | { success: false; error: string }

type CartTotalResult =
  | { success: true; amount: number }
  | { success: false; error: string }

// Server is the source of truth for what a cart costs. The client only needs
// this to size the Stripe <Elements> instance up-front (deferred PaymentIntent
// flow) so the amount matches the PaymentIntent created at confirm time.
async function computeCartTotalCents(
  cartItems: CartItemInput[]
): Promise<number> {
  let totalPrice = 0
  for (const item of cartItems) {
    if (!mongoose.isValidObjectId(item._id)) {
      throw new Error('Invalid product in cart')
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error('Invalid cart item')
    }
    const product = await Product.findById(item._id).select('price').lean<{
      price: number
    }>()
    if (!product) {
      throw new Error('One of the products in your cart no longer exists')
    }
    totalPrice += product.price * item.quantity
  }
  return Math.round(totalPrice * 100)
}

export async function getCheckoutAmount(
  cartItems: CartItemInput[]
): Promise<CartTotalResult> {
  await connectDB()
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty' }
  }
  try {
    return { success: true, amount: await computeCartTotalCents(cartItems) }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to price your cart',
    }
  }
}

// Card orders are created here in a pending/unpaid state, before payment is
// confirmed. Stock is checked but not decremented — the webhook at
// app/api/webhooks/stripe decrements stock and marks the order paid once
// Stripe confirms the charge, so the order survives a client that never
// makes it back (dropped connection, closed tab) after a successful payment.
export async function initiateCardPayment(
  data: CheckoutFormData,
  cartItems: CartItemInput[]
): Promise<InitiateCardPaymentResult> {
  await connectDB()

  const parsed = checkoutSchema.safeParse(data)
  if (!parsed.success || parsed.data.paymentMethod !== 'credit_card') {
    return { success: false, error: 'Invalid checkout data' }
  }
  const checkoutData = parsed.data

  const session = await getSession()
  if (!session && (!checkoutData.guestName || !checkoutData.guestEmail)) {
    return { success: false, error: 'Guest name and email are required' }
  }
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty' }
  }

  try {
    const orderItems: {
      product: string
      name: string
      priceAtpurchase: number
      quantity: number
    }[] = []
    let totalPrice = 0

    for (const item of cartItems) {
      if (!mongoose.isValidObjectId(item._id)) {
        throw new Error('Invalid product in cart')
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error('Invalid cart item')
      }
      const product = await Product.findById(item._id)
      if (!product) {
        throw new Error('One of the products in your cart no longer exists')
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}" (available: ${product.stock})`
        )
      }
      orderItems.push({
        product: product._id.toString(),
        name: product.name,
        priceAtpurchase: product.price,
        quantity: item.quantity,
      })
      totalPrice += product.price * item.quantity
    }

    const amount = Math.round(totalPrice * 100)

    const order = await Order.create({
      user: session ? session.userId : undefined,
      guestName: session ? undefined : checkoutData.guestName,
      guestEmail: session ? undefined : checkoutData.guestEmail,
      items: orderItems,
      totalPrice,
      shippingAddress: {
        street: checkoutData.street,
        number: checkoutData.number,
        city: checkoutData.city,
        zipcode: checkoutData.zipcode,
        country: checkoutData.country,
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'unpaid',
    })

    const customerEmail = session
      ? (await getUserFromDb(session.userId))?.email
      : checkoutData.guestEmail

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      // Only card and Klarna are offered online — keep this list in sync with
      // the `paymentMethodTypes` passed to <Elements> in CheckoutClient.
      payment_method_types: ['card', 'klarna'],
      receipt_email: customerEmail || undefined,
      metadata: { orderId: order._id.toString() },
    })

    if (!paymentIntent.client_secret) {
      await Order.findByIdAndDelete(order._id)
      return { success: false, error: 'Failed to initialize payment' }
    }

    order.stripePaymentIntentId = paymentIntent.id
    await order.save()

    return {
      success: true,
      orderId: order._id.toString(),
      clientSecret: paymentIntent.client_secret,
      amount,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to start payment',
    }
  }
}
