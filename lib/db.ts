import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING as string;


if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_CONNECTION_STRING environment variable");
}



async function dbConnect() {
    if (mongoose.connection.readyState >= 1){
        await mongoose.connect(MONGODB_URI);
    }
}

ecport default connectDB;