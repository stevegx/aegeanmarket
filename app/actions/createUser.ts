'use server'
import { CreateUserData, createUserSchema } from '@/lib/validate'
import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getClientIp, isRateLimited } from '@/lib/rateLimit'

export async function createUser(data: CreateUserData) {
  const parsed = createUserSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' }
  }

  const ip = getClientIp(await headers())
  if (isRateLimited(`register:ip:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: 'Too many registration attempts. Please try again later.' }
  }

  await connectDB()
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10)
  const existingUser = await User.findOne({
    $or: [{ email: parsed.data.email }, { username: parsed.data.username }],
  })
  if (existingUser)
    return { error: 'User with this email or username already exists' }

  const newUser = new User({
    username: parsed.data.username,
    email: parsed.data.email,
    password: hashedPassword,
    address: parsed.data.address,
    phone: parsed.data.phone,
  })
  await newUser.save()
  redirect('/register/success')
}
