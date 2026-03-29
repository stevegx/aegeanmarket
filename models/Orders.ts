import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        priceAtpurchase: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      enum: ['pending', 'processing', 'delivered', 'cancelled', 'shipped'],
      type: String,
      default: 'pending',
      required: true,
      index: true,
    },
    shippingAddress: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      city: { type: String, required: true },
      zipcode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
)
OrderSchema.index({ user: 1, creadtedAt: -1 })
export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
