import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: [] },
    ],
  },
  { timestamps: true }
)

UserSchema.index({ createdAt: -1 })

export default mongoose.models.User || mongoose.model('User', UserSchema)
