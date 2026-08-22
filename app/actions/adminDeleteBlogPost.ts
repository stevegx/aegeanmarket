'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import connectDB from '@/lib/db'
import { requireAdmin } from './requireAdmin'
import BlogPost from '@/models/BlogPost'

type Result = { success: true } | { success: false; error: string }

export async function adminDeleteBlogPost(postId: string): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  if (!mongoose.isValidObjectId(postId)) {
    return { success: false, error: 'Invalid post id' }
  }

  await connectDB()
  const deleted = await BlogPost.findByIdAndDelete(postId)
  if (!deleted) return { success: false, error: 'Post not found' }

  if (deleted.image.includes('.public.blob.vercel-storage.com/')) {
    try {
      await del(deleted.image)
    } catch {
      // Non-fatal: the post record is already gone, an orphaned blob can be
      // cleaned up manually and shouldn't block the delete from succeeding.
    }
  }

  revalidatePath('/adminpage')
  revalidatePath('/blog')
  revalidatePath('/')
  return { success: true }
}
