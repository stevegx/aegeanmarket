import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ['customer', 'admin'], default: 'customer'},
    address: {type: String, required: true},
    phone: {type: String, required: true, unique: true},
}, {timestamps: true})

export default mongoose.models.User || mongoose.model('User', UserSchema)