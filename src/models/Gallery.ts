import mongoose, { Schema, Document } from 'mongoose';
import type { IGallery } from '@/types';

export interface GalleryDocument extends Omit<IGallery, '_id'>, Document {}

const GallerySchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    url: { type: String, required: true },
    thumbnail: { type: String },
    album: { type: String, default: 'Umum', index: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

GallerySchema.index({ event: 1, album: 1 });

export const Gallery =
  mongoose.models.Gallery || mongoose.model<GalleryDocument>('Gallery', GallerySchema);
