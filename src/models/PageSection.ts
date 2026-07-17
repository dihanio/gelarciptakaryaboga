import mongoose, { Schema, Document } from 'mongoose';
import type { IPageSection } from '@/types';

export interface PageSectionDocument extends Omit<IPageSection, '_id'>, Document {}

const PageSectionSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    page: {
      type: String,
      enum: ['landing', 'about', 'contact'],
      default: 'landing',
      index: true,
    },
    sectionType: {
      type: String,
      enum: [
        'hero',
        'about',
        'highlights',
        'gallery_preview',
        'cta',
        'faq',
        'sponsors',
        'timeline',
        'stats',
        'custom',
        'news',
        'booth',
        'committee',
      ],
      required: true,
    },
    title: { type: String },
    subtitle: { type: String },
    content: { type: String },
    media: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
      },
    ],
    config: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PageSectionSchema.index({ event: 1, page: 1, order: 1 });

export const PageSection =
  mongoose.models.PageSection ||
  mongoose.model<PageSectionDocument>('PageSection', PageSectionSchema);
