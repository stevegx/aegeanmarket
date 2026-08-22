import mongoose from 'mongoose'

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true }, // markdown
    image: { type: String, required: true },
    author: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

BlogPostSchema.index({ createdAt: -1 })

export default mongoose.models.BlogPost ||
  mongoose.model('BlogPost', BlogPostSchema)
