import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: { type: String, default: '' },
    phone: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    themePreference: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    favorites: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: [] },
    ],
  },
  { timestamps: true }
)

UserSchema.index({ createdAt: -1 })

export default mongoose.models.User || mongoose.model('User', UserSchema)
