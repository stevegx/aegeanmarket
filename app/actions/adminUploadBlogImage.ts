'use server'

import { put } from '@vercel/blob'
import { requireAdmin } from './requireAdmin'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type Result = { success: true; url: string } | { success: false; error: string }

export async function adminUploadBlogImage(
  formData: FormData
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { success: false, error: 'Not authorized' }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { success: false, error: 'No file provided' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Only JPEG, PNG, WEBP or GIF images are allowed',
    }
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'Image must be smaller than 5MB' }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')

  try {
    const blob = await put(`blog/${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })
    return { success: true, url: blob.url }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to upload image',
    }
  }
}
