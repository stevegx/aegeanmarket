'use server'
import { RegisterFormData } from '@/lib/validate'
import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

type CreateUserData = Omit<RegisterFormData, 'confirmPassword'>

export async function createUser(data: CreateUserData) {
  await connectDB()
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }],
  })
  if (existingUser)
    return { error: 'User with this email or username already exists' }

  const newUser = new User({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    address: data.address,
    phone: data.phone,
  })
  await newUser.save()
  redirect('/register/success')
}
