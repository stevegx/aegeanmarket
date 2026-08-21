'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminUpdateOrderSchema, AdminUpdateOrderData } from '@/lib/validate'
import Product from '@/models/Products'
import Order from '@/models/Orders'

type Result = { success: true } | { success: false; error: string }

export async function adminUpdateOrder(
  orderId: string,
  data: AdminUpdateOrderData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(orderId)) {
    return { success: false, error: 'Invalid order id' }
  }

  const parsed = adminUpdateOrderSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Invalid order data' }
  }
  const input = parsed.data

  const productIds = input.items.map((i) => i.productId)
  if (new Set(productIds).size !== productIds.length) {
    return { success: false, error: 'Duplicate product in order' }
  }
  if (productIds.some((id) => !mongoose.isValidObjectId(id))) {
    return { success: false, error: 'Invalid product in order' }
  }

  await connectDB()
  const dbSession = await mongoose.startSession()

  try {
    await dbSession.withTransaction(async () => {
      const order = await Order.findById(orderId).session(dbSession)
      if (!order) throw new Error('Order not found')

      const oldQuantities = new Map<string, number>()
      const oldPrices = new Map<string, number>()
      for (const item of order.items) {
        const key = item.product.toString()
        oldQuantities.set(key, item.quantity)
        oldPrices.set(key, item.priceAtpurchase)
      }

      const newItems: {
        product: string
        name: string
        priceAtpurchase: number
        quantity: number
      }[] = []
      let totalPrice = 0
      const seenProductIds = new Set<string>()

      for (const line of input.items) {
        seenProductIds.add(line.productId)

        const product = await Product.findById(line.productId).session(
          dbSession
        )
        if (!product) {
          throw new Error('One of the selected products no longer exists')
        }

        const oldQty = oldQuantities.get(line.productId) ?? 0
        const delta = line.quantity - oldQty

        if (delta > 0) {
          const updated = await Product.findOneAndUpdate(
            { _id: line.productId, stock: { $gte: delta } },
            { $inc: { stock: -delta } },
            { session: dbSession }
          )
          if (!updated) {
            throw new Error(
              `Insufficient stock for "${product.name}" (available: ${product.stock})`
            )
          }
        } else if (delta < 0) {
          await Product.findByIdAndUpdate(
            line.productId,
            { $inc: { stock: -delta } }, // -delta is positive here, i.e. a restock
            { session: dbSession }
          )
        }

        const priceAtpurchase = oldPrices.get(line.productId) ?? product.price

        newItems.push({
          product: line.productId,
          name: product.name,
          priceAtpurchase,
          quantity: line.quantity,
        })
        totalPrice += priceAtpurchase * line.quantity
      }

      // Restock any line items that were removed entirely from the order
      for (const [productId, qty] of oldQuantities) {
        if (!seenProductIds.has(productId)) {
          await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: qty } },
            { session: dbSession }
          )
        }
      }

      order.items = newItems as unknown as typeof order.items
      order.totalPrice = totalPrice
      order.status = input.status
      order.paymentStatus = input.paymentStatus
      order.shippingAddress = input.shippingAddress

      await order.save({ session: dbSession })
    })

    revalidatePath('/adminpage')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update order',
    }
  } finally {
    await dbSession.endSession()
  }
}
