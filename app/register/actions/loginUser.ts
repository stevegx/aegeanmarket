"use server"
import { LoginFormData } from './../../../lib/validate';
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";



type LoginUserData = Omit<LoginFormData, "confirmPassword">

export async function loginUser(data: LoginUserData){
    await connectDB()
    const findUser = await User.findOne({
        $or: [{ email: data.loginCredentials }, { username: data.loginCredentials }]})
    
    if(!findUser) return { success:false, error: "Invalid login credentials" }
    
    const checkPassword = await bcrypt.compare(data.password , findUser.password)
    if(!checkPassword) return { success:false , error: "Invalid login credentials" }

    return({success: true , username: findUser.username})

}