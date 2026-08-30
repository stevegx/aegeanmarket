'use server'

import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import { getSession } from '@/app/actions/getSession'
import { checkoutSchema, CheckoutFormData } from '@/lib/validate'
import Product from '@/models/Products'
import Order from '@/models/Orders'
import Cart from '@/models/cart'

type CartItemInput = {
  _id: string
  quantity: number
}

type CreateOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string }

// Credit-card orders are created by initiateCardPayment + the Stripe webhook
// instead (app/api/webhooks/stripe) so fulfillment survives a client that
// never returns after a successful charge.
export async function createOrder(
  data: CheckoutFormData,
  cartItems: CartItemInput[]
): Promise<CreateOrderResult> {
  await connectDB()

  const parsed = checkoutSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Invalid checkout data' }
  }
  const checkoutData = parsed.data

  if (checkoutData.paymentMethod === 'credit_card') {
    return { success: false, error: 'Invalid checkout data' }
  }

  const session = await getSession()

  if (!session && (!checkoutData.guestName || !checkoutData.guestEmail)) {
    return {
      success: false,
      error: 'Guest name and email are required',
    }
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Your cart is empty' }
  }

  const dbSession = await mongoose.startSession()

  try {
    let orderId = ''

    await dbSession.withTransaction(async () => {
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

        const product = await Product.findById(item._id).session(dbSession)
        if (!product) {
          throw new Error('One of the products in your cart no longer exists')
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}" (available: ${product.stock})`
          )
        }

        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session: dbSession }
        )
        if (!updatedProduct) {
          throw new Error(`Insufficient stock for "${product.name}"`)
        }

        orderItems.push({
          product: product._id.toString(),
          name: product.name,
          priceAtpurchase: product.price,
          quantity: item.quantity,
        })
        totalPrice += product.price * item.quantity
      }

      const [newOrder] = await Order.create(
        [
          {
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
            paymentMethod: checkoutData.paymentMethod,
            paymentStatus:
              checkoutData.paymentMethod === 'cod' ? 'unpaid' : 'paid',
          },
        ],
        { session: dbSession }
      )

      if (session) {
        await Cart.findOneAndUpdate(
          { user: session.userId },
          { $set: { items: [] } },
          { session: dbSession }
        )
      }

      orderId = newOrder._id.toString()
    })

    return { success: true, orderId }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create order',
    }
  } finally {
    await dbSession.endSession()
  }
}
