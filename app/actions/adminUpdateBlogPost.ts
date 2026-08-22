'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminBlogPostSchema, AdminBlogPostData } from '@/lib/validate'
import BlogPost from '@/models/BlogPost'

type Result = { success: true } | { success: false; error: string }

export async function adminUpdateBlogPost(
  postId: string,
  data: AdminBlogPostData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(postId)) {
    return { success: false, error: 'Invalid post id' }
  }

  const parsed = adminBlogPostSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid post data',
    }
  }

  await connectDB()
  const updated = await BlogPost.findByIdAndUpdate(postId, parsed.data)
  if (!updated) return { success: false, error: 'Post not found' }

  revalidatePath('/adminpage')
  revalidatePath('/blog')
  revalidatePath(`/blog/${postId}`)
  revalidatePath('/')
  return { success: true }
}
