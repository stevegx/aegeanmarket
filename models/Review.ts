import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
    mentionedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rating: { type: Number, min: 1, max: 5, default: null },
    text: { type: String, trim: true, maxlength: 1000, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  { timestamps: true }
)

// One top-level review per user per product
ReviewSchema.index(
  { product: 1, user: 1 },
  { unique: true, partialFilterExpression: { parent: null } }
)
ReviewSchema.index({ product: 1, parent: 1, createdAt: -1 })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)
