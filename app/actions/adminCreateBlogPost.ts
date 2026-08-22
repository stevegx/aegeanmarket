'use server'

import { revalidatePath } from 'next/cache'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import { adminBlogPostSchema, AdminBlogPostData } from '@/lib/validate'
import BlogPost from '@/models/BlogPost'

type Result = { success: true } | { success: false; error: string }

export async function adminCreateBlogPost(
  data: AdminBlogPostData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  const parsed = adminBlogPostSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid post data',
    }
  }

  await connectDB()
  await BlogPost.create({
    ...parsed.data,
    author: admin.username,
  })

  revalidatePath('/adminpage')
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true }
}
