import mongoose, { Schema, Document } from 'mongoose';
import type { INews } from '@/types';

export interface NewsDocument extends Omit<INews, '_id'>, Document {}

const NewsSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String },
    category: {
      type: String,
      enum: ['pengumuman', 'informasi', 'artikel', 'liputan'],
      default: 'informasi',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true }],
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

NewsSchema.index({ event: 1, slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
NewsSchema.index({ event: 1, slug: 1, deletedAt: 1 });
NewsSchema.index({ event: 1, status: 1, publishedAt: -1 });

export const News = mongoose.models.News || mongoose.model<NewsDocument>('News', NewsSchema);
