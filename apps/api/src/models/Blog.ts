
// apps/api/src/models/Blog.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected';
  submittedAt?: Date;
  publishedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  likes: mongoose.Types.ObjectId[];
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'draft' },
    submittedAt: Date,
    publishedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: String,
    metaTitle: String,
    metaDescription: String,
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, createdAt: -1 });
BlogSchema.index({ category: 1 });

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);