'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminCreateOrderSchema, AdminCreateOrderData } from '@/lib/validate'
import Product from '@/models/Products'
import Order from '@/models/Orders'
import User from '@/models/User'

type Result =
  | { success: true; orderId: string }
  | { success: false; error: string }

export async function adminCreateOrder(
  data: AdminCreateOrderData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  const parsed = adminCreateOrderSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid order data',
    }
  }
  const input = parsed.data

  const productIds = input.items.map((i) => i.productId)
  if (new Set(productIds).size !== productIds.length) {
    return { success: false, error: 'Duplicate product in order' }
  }
  if (productIds.some((id) => !mongoose.isValidObjectId(id))) {
    return { success: false, error: 'Invalid product in order' }
  }
  if (
    input.customerType === 'registered' &&
    (!input.userId || !mongoose.isValidObjectId(input.userId))
  ) {
    return { success: false, error: 'Invalid customer' }
  }

  await connectDB()

  if (input.customerType === 'registered') {
    const customer = await User.findById(input.userId)
    if (!customer) return { success: false, error: 'Customer not found' }
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

      for (const line of input.items) {
        const product = await Product.findById(line.productId).session(
          dbSession
        )
        if (!product) {
          throw new Error('One of the selected products no longer exists')
        }

        const updated = await Product.findOneAndUpdate(
          { _id: line.productId, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } },
          { session: dbSession }
        )
        if (!updated) {
          throw new Error(
            `Insufficient stock for "${product.name}" (available: ${product.stock})`
          )
        }

        orderItems.push({
          product: line.productId,
          name: product.name,
          priceAtpurchase: product.price,
          quantity: line.quantity,
        })
        totalPrice += product.price * line.quantity
      }

      const [newOrder] = await Order.create(
        [
          {
            user: input.customerType === 'registered' ? input.userId : undefined,
            guestName:
              input.customerType === 'guest' ? input.guestName : undefined,
            guestEmail:
              input.customerType === 'guest' ? input.guestEmail : undefined,
            items: orderItems,
            totalPrice,
            shippingAddress: input.shippingAddress,
            paymentMethod: input.paymentMethod,
            paymentStatus: input.paymentStatus,
            status: input.status,
          },
        ],
        { session: dbSession }
      )

      orderId = newOrder._id.toString()
    })

    revalidatePath('/adminpage')
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
