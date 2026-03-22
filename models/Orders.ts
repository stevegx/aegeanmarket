import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    items: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},    
        quantity: {type: Number, required: true, default: 1}
    }],
    totalPrice: {type: Number, required: true},
    status: {enum: ["pending", "processing", "delivered", "cancelled", "shipped"], type: String, default: "pending", required: true},
    shippingAddress: {
        street: {type: String, required: true},
        number: {type: Number, required: true},
        city: {type: String, required: true},
        zipcode: {type: Number, required: true},
        country: {type: String, required: true},
    }
},{timestamps: true});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
