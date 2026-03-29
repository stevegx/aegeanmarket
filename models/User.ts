import mongoose from 'mongoose'
import { lowercase } from 'zod'

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
