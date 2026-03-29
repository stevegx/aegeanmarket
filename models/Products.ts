import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
    price: { type: Number, required: true, index: true, min: 0 },
    image: { type: String, required: true },
  },
  { timestamps: true }
)
ProductSchema.index({ category: 1, preice: 1 })
ProductSchema.index({ name: 'text', description: 'text' })
export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)
